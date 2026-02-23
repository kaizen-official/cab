const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../../config/database");
const { config } = require("../../config");
const { generateOTP, otpExpiresAt } = require("../../utils/otp");
const ApiError = require("../../utils/ApiError");

class AuthService {
  async register({ email, password, firstName, lastName }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName },
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
    });

    const otp = await this._createOTP(email, "EMAIL_VERIFICATION");

    // In production, send this via email service
    console.log(`[auth] verification OTP for ${email}: ${otp.code}`);

    const tokens = this._generateTokens(user.id);
    await this._storeRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens, otpSent: true };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }
    if (!user.isActive) {
      throw ApiError.forbidden("Account has been deactivated");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const tokens = this._generateTokens(user.id);
    await this._storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        college: user.college,
      },
      tokens,
    };
  }

  async verifyEmail({ email, code }) {
    const otp = await this._verifyOTP(email, code, "EMAIL_VERIFICATION");
    if (!otp) {
      throw ApiError.badRequest("Invalid or expired OTP");
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    return { verified: true };
  }

  async resendVerification(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw ApiError.notFound("User not found");
    if (user.emailVerified) throw ApiError.badRequest("Email already verified");

    const otp = await this._createOTP(email, "EMAIL_VERIFICATION");
    console.log(`[auth] resent verification OTP for ${email}: ${otp.code}`);

    return { sent: true };
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether the email exists
      return { sent: true };
    }

    const otp = await this._createOTP(email, "PASSWORD_RESET");
    console.log(`[auth] password reset OTP for ${email}: ${otp.code}`);

    return { sent: true };
  }

  async resetPassword({ email, code, newPassword }) {
    const otp = await this._verifyOTP(email, code, "PASSWORD_RESET");
    if (!otp) {
      throw ApiError.badRequest("Invalid or expired OTP");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email },
      data: { passwordHash, refreshToken: null },
    });

    return { reset: true };
  }

  async refreshToken(token) {
    let payload;
    try {
      payload = jwt.verify(token, config.jwt.refreshSecret);
    } catch {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== token || !user.isActive) {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const tokens = this._generateTokens(user.id);
    await this._storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // ── Private helpers ──

  _generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn,
    });
    const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
    return { accessToken, refreshToken };
  }

  async _storeRefreshToken(userId, token) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token },
    });
  }

  async _createOTP(email, purpose) {
    await prisma.oTP.updateMany({
      where: { email, purpose, used: false },
      data: { used: true },
    });

    return prisma.oTP.create({
      data: {
        email,
        code: generateOTP(),
        purpose,
        expiresAt: otpExpiresAt(),
      },
    });
  }

  async _verifyOTP(email, code, purpose) {
    const otp = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        purpose,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) return null;

    await prisma.oTP.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return otp;
  }
}

module.exports = new AuthService();
