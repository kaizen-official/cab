const { Router } = require("express");
const controller = require("./upload.controller");
const { authenticate } = require("../../middleware/auth");

const router = Router();

router.patch("/avatar", authenticate, controller.saveAvatar);
router.patch("/student-id", authenticate, controller.saveStudentId);

module.exports = router;
