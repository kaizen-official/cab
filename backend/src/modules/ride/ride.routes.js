const { Router } = require("express");
const controller = require("./ride.controller");
const { authenticate, optionalAuth } = require("../../middleware/auth");
const validate = require("../../middleware/validate");

const router = Router();

router.get("/search", optionalAuth, controller.search);

router.get("/mine", authenticate, controller.getMyRides);

router.get("/:id", optionalAuth, controller.getById);

router.post(
  "/",
  authenticate,
  validate({
    body: {
      fromCity: { required: true, min: 1 },
      fromAddress: { required: true, min: 1 },
      toCity: { required: true, min: 1 },
      toAddress: { required: true, min: 1 },
      departureTime: { required: true, isDate: true, isFuture: true },
      totalSeats: { required: true, type: "number" },
      pricePerSeat: { required: true, type: "number" },
    },
  }),
  controller.create
);

router.patch("/:id", authenticate, controller.update);

router.post("/:id/cancel", authenticate, controller.cancel);

router.post("/:id/depart", authenticate, controller.markDeparted);

router.post("/:id/complete", authenticate, controller.markCompleted);

module.exports = router;
