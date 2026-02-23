const reviewService = require("./review.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

exports.create = asyncHandler(async (req, res) => {
  const review = await reviewService.create(req.user.id, req.body);
  ApiResponse.created(review, "Review submitted").send(res);
});

exports.getForUser = asyncHandler(async (req, res) => {
  const result = await reviewService.getForUser(req.params.userId, req.query);
  ApiResponse.ok(result).send(res);
});

exports.getForRide = asyncHandler(async (req, res) => {
  const result = await reviewService.getForRide(req.params.rideId, req.query);
  ApiResponse.ok(result).send(res);
});
