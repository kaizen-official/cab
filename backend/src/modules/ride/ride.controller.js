const rideService = require("./ride.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

exports.create = asyncHandler(async (req, res) => {
  const ride = await rideService.create(req.user.id, req.body);
  ApiResponse.created(ride, "Ride created").send(res);
});

exports.search = asyncHandler(async (req, res) => {
  const result = await rideService.search(req.query);
  ApiResponse.ok(result).send(res);
});

exports.getById = asyncHandler(async (req, res) => {
  const ride = await rideService.getById(req.params.id);
  ApiResponse.ok(ride).send(res);
});

exports.getMyRides = asyncHandler(async (req, res) => {
  const result = await rideService.getByCreator(req.user.id, req.query);
  ApiResponse.ok(result).send(res);
});

exports.update = asyncHandler(async (req, res) => {
  const ride = await rideService.update(req.params.id, req.user.id, req.body);
  ApiResponse.ok(ride, "Ride updated").send(res);
});

exports.cancel = asyncHandler(async (req, res) => {
  await rideService.cancel(req.params.id, req.user.id);
  ApiResponse.ok(null, "Ride cancelled").send(res);
});

exports.markDeparted = asyncHandler(async (req, res) => {
  const ride = await rideService.markDeparted(req.params.id, req.user.id);
  ApiResponse.ok(ride, "Ride marked as departed").send(res);
});

exports.markCompleted = asyncHandler(async (req, res) => {
  await rideService.markCompleted(req.params.id, req.user.id);
  ApiResponse.ok(null, "Ride completed").send(res);
});
