const { prisma } = require("../../config/database");
const ApiError = require("../../utils/ApiError");

class UploadService {
  async saveAvatarUrl(userId, url) {
    if (!url || typeof url !== "string") {
      throw ApiError.badRequest("A valid avatar URL is required");
    }

    return prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
      select: { id: true, avatarUrl: true },
    });
  }

  async saveStudentIdUrl(userId, url) {
    if (!url || typeof url !== "string") {
      throw ApiError.badRequest("A valid student ID URL is required");
    }

    return prisma.user.update({
      where: { id: userId },
      data: { studentIdUrl: url, studentIdStatus: "PENDING" },
      select: { id: true, studentIdUrl: true, studentIdStatus: true },
    });
  }
}

module.exports = new UploadService();
