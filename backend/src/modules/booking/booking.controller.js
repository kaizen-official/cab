const bookingService = require("./booking.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

exports.requestBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.requestBooking(req.user.id, req.body);
  ApiResponse.created(booking, "Booking requested").send(res);
});

exports.confirmBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.confirmBooking(req.params.id, req.user.id);
  ApiResponse.ok(booking, "Booking confirmed").send(res);
});

exports.rejectBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.rejectBooking(req.params.id, req.user.id);
  ApiResponse.ok(booking, "Booking rejected").send(res);
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user.id);
  ApiResponse.ok(booking, "Booking cancelled").send(res);
});

exports.getMyBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getMyBookings(req.user.id, req.query);
  ApiResponse.ok(result).send(res);
});

exports.getRideBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getRideBookings(req.params.rideId, req.user.id, req.query);
  ApiResponse.ok(result).send(res);
});
