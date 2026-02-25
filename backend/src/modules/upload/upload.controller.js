const uploadService = require("./upload.service");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");

exports.saveAvatar = asyncHandler(async (req, res) => {
  const result = await uploadService.saveAvatarUrl(req.user.id, req.body.url);
  res.json(ApiResponse.success(result, "Avatar updated"));
});

exports.saveStudentId = asyncHandler(async (req, res) => {
  const result = await uploadService.saveStudentIdUrl(req.user.id, req.body.url);
  res.json(ApiResponse.success(result, "Student ID submitted"));
});
