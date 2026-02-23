const notificationService = require("./notification.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getForUser(req.user.id, req.query);
  ApiResponse.ok(result).send(res);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.user.id);
  ApiResponse.ok(null, "Marked as read").send(res);
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  ApiResponse.ok(null, "All marked as read").send(res);
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  ApiResponse.ok({ count }).send(res);
});
