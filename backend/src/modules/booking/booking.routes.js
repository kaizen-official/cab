const { Router } = require("express");
const controller = require("./booking.controller");
const { authenticate } = require("../../middleware/auth");
const validate = require("../../middleware/validate");

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate({
    body: {
      rideId: { required: true },
      seatsBooked: { type: "number" },
    },
  }),
  controller.requestBooking
);

router.get("/mine", controller.getMyBookings);

router.get("/ride/:rideId", controller.getRideBookings);

router.post("/:id/confirm", controller.confirmBooking);

router.post("/:id/reject", controller.rejectBooking);

router.post("/:id/cancel", controller.cancelBooking);

module.exports = router;
