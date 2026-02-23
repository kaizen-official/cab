const { Router } = require("express");
const controller = require("./review.controller");
const { authenticate } = require("../../middleware/auth");
const validate = require("../../middleware/validate");

const router = Router();

router.post(
  "/",
  authenticate,
  validate({
    body: {
      targetId: { required: true },
      rideId: { required: true },
      rating: { required: true, type: "number" },
      comment: { max: 1000 },
    },
  }),
  controller.create
);

router.get("/user/:userId", controller.getForUser);

router.get("/ride/:rideId", controller.getForRide);

module.exports = router;
