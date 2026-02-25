const { Router } = require("express");
const multer = require("multer");
const controller = require("./upload.controller");
const { authenticate } = require("../../middleware/auth");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.post("/avatar", authenticate, upload.single("file"), controller.uploadAvatar);
router.post("/student-id", authenticate, upload.single("file"), controller.uploadStudentId);

module.exports = router;
