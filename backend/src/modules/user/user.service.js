const { prisma } = require("../../config/database");
const ApiError = require("../../utils/ApiError");

const PUBLIC_USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  bio: true,
  college: true,
  collegeVerified: true,
  program: true,
  academicYear: true,
  gender: true,
  studentIdStatus: true,
  createdAt: true,
};

const PRIVATE_USER_SELECT = {
  ...PUBLIC_USER_SELECT,
  email: true,
  phone: true,
  whatsappNumber: true,
  whatsappVisible: true,
  studentIdUrl: true,
  emailVerified: true,
};

class UserService {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: PRIVATE_USER_SELECT,
    });
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  async getPublicProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) throw ApiError.notFound("User not found");

    const stats = await this._getUserStats(userId);
    return { ...user, stats };
  }

  async updateProfile(userId, data) {
    const allowed = [
      "firstName", "lastName", "phone", "gender", "bio", "avatarUrl",
      "whatsappNumber", "program", "academicYear", "whatsappVisible",
    ];
    const updateData = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw ApiError.badRequest("No valid fields to update");
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: PRIVATE_USER_SELECT,
    });
  }

  async setCollege(userId, college) {
    return prisma.user.update({
      where: { id: userId },
      data: { college, collegeVerified: false },
      select: PRIVATE_USER_SELECT,
    });
  }

  async deactivateAccount(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false, refreshToken: null },
    });
  }

  async _getUserStats(userId) {
    const [ridesCreated, ridesJoined, reviewCount, avgRating] = await Promise.all([
      prisma.ride.count({ where: { creatorId: userId } }),
      prisma.booking.count({ where: { passengerId: userId, status: "COMPLETED" } }),
      prisma.review.count({ where: { targetId: userId } }),
      prisma.review.aggregate({
        where: { targetId: userId },
        _avg: { rating: true },
      }),
    ]);

    return {
      ridesCreated,
      ridesJoined,
      reviewCount,
      avgRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : null,
    };
  }
}

module.exports = new UserService();
