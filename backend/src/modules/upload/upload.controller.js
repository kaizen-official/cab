const uploadService = require("./upload.service");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");

exports.uploadAvatar = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadAvatar(req.user.id, req.file);
  res.json(ApiResponse.success(result, "Avatar uploaded"));
});

exports.uploadStudentId = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadStudentId(req.user.id, req.file);
  res.json(ApiResponse.success(result, "Student ID uploaded"));
});
