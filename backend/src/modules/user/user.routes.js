const { Router } = require("express");
const controller = require("./user.controller");
const { authenticate } = require("../../middleware/auth");
const validate = require("../../middleware/validate");

const router = Router();

router.get("/me", authenticate, controller.getMyProfile);

router.patch(
  "/me",
  authenticate,
  validate({
    body: {
      firstName: { min: 1, max: 50 },
      lastName: { min: 1, max: 50 },
      phone: { pattern: /^\+?[0-9]{7,15}$/, patternMessage: "Invalid phone number" },
      gender: { enum: ["MALE", "FEMALE", "OTHER"] },
      bio: { max: 500 },
    },
  }),
  controller.updateProfile
);

router.patch(
  "/me/college",
  authenticate,
  validate({ body: { college: { required: true, min: 2, max: 100 } } }),
  controller.setCollege
);

router.delete("/me", authenticate, controller.deactivateAccount);

router.get("/:id", controller.getPublicProfile);

module.exports = router;
