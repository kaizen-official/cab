const { Router } = require("express");
const controller = require("./auth.controller");
const { authenticate } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const rateLimiter = require("../../middleware/rateLimiter");

const router = Router();

router.post(
  "/register",
  rateLimiter.strict(60 * 1000, 5),
  validate({
    body: {
      email: { required: true, type: "email" },
      password: { required: true, min: 8, max: 128 },
      firstName: { required: true, min: 1, max: 50 },
      lastName: { required: true, min: 1, max: 50 },
    },
  }),
  controller.register
);

router.post(
  "/login",
  rateLimiter.strict(60 * 1000, 10),
  validate({
    body: {
      email: { required: true, type: "email" },
      password: { required: true },
    },
  }),
  controller.login
);

router.post(
  "/verify-email",
  rateLimiter.strict(60 * 1000, 5),
  validate({
    body: {
      email: { required: true, type: "email" },
      code: { required: true, min: 6, max: 6 },
    },
  }),
  controller.verifyEmail
);

router.post(
  "/resend-verification",
  rateLimiter.strict(60 * 1000, 3),
  validate({ body: { email: { required: true, type: "email" } } }),
  controller.resendVerification
);

router.post(
  "/forgot-password",
  rateLimiter.strict(60 * 1000, 3),
  validate({ body: { email: { required: true, type: "email" } } }),
  controller.forgotPassword
);

router.post(
  "/reset-password",
  rateLimiter.strict(60 * 1000, 5),
  validate({
    body: {
      email: { required: true, type: "email" },
      code: { required: true, min: 6, max: 6 },
      newPassword: { required: true, min: 8, max: 128 },
    },
  }),
  controller.resetPassword
);

router.post(
  "/refresh-token",
  validate({ body: { refreshToken: { required: true } } }),
  controller.refreshToken
);

router.post("/logout", authenticate, controller.logout);

router.get("/me", authenticate, controller.me);

module.exports = router;
