const jwt = require("jsonwebtoken");
const { config } = require("../config");
const { prisma } = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Missing or malformed token");
  }

  const token = header.split(" ")[1];

  let payload;
  try {
    payload = jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Token expired");
    }
    throw ApiError.unauthorized("Invalid token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      college: true,
      collegeVerified: true,
      emailVerified: true,
      isActive: true,
      gender: true,
    },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Account not found or deactivated");
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, config.jwt.accessSecret);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
    });
    if (user && user.isActive) {
      req.user = user;
    }
  } catch {
    // token invalid — continue as unauthenticated
  }

  next();
});

const requireVerifiedEmail = (req, _res, next) => {
  if (!req.user.emailVerified) {
    throw ApiError.forbidden("Email not verified");
  }
  next();
};

module.exports = { authenticate, optionalAuth, requireVerifiedEmail };
