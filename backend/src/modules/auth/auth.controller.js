const authService = require("./auth.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  ApiResponse.created(result, "Account created. Check your email for verification OTP.").send(res);
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  ApiResponse.ok(result, "Logged in").send(res);
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.body);
  ApiResponse.ok(result, "Email verified").send(res);
});

exports.resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.resendVerification(req.body.email);
  ApiResponse.ok(result, "Verification OTP sent").send(res);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  ApiResponse.ok(result, "If the email exists, a reset OTP has been sent").send(res);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  ApiResponse.ok(result, "Password reset successful").send(res);
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const tokens = await authService.refreshToken(req.body.refreshToken);
  ApiResponse.ok(tokens, "Token refreshed").send(res);
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  ApiResponse.ok(null, "Logged out").send(res);
});

exports.me = asyncHandler(async (req, res) => {
  ApiResponse.ok(req.user, "Current user").send(res);
});
