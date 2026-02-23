const userService = require("./user.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

exports.getMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  ApiResponse.ok(user).send(res);
});

exports.getPublicProfile = asyncHandler(async (req, res) => {
  const user = await userService.getPublicProfile(req.params.id);
  ApiResponse.ok(user).send(res);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  ApiResponse.ok(user, "Profile updated").send(res);
});

exports.setCollege = asyncHandler(async (req, res) => {
  const user = await userService.setCollege(req.user.id, req.body.college);
  ApiResponse.ok(user, "College updated").send(res);
});

exports.deactivateAccount = asyncHandler(async (req, res) => {
  await userService.deactivateAccount(req.user.id);
  ApiResponse.ok(null, "Account deactivated").send(res);
});
