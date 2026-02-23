const { Router } = require("express");
const controller = require("./notification.controller");
const { authenticate } = require("../../middleware/auth");

const router = Router();

router.use(authenticate);

router.get("/", controller.getMyNotifications);

router.get("/unread-count", controller.getUnreadCount);

router.patch("/:id/read", controller.markAsRead);

router.patch("/read-all", controller.markAllAsRead);

module.exports = router;
