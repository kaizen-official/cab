const { prisma } = require("../../config/database");
const { parsePagination, paginatedResponse } = require("../../utils/pagination");
const ApiError = require("../../utils/ApiError");

class NotificationService {
  async create({ userId, type, title, body, metadata = null }) {
    return prisma.notification.create({
      data: { userId, type, title, body, metadata },
    });
  }

  async createInTx(tx, { userId, type, title, body, metadata = null }) {
    return tx.notification.create({
      data: { userId, type, title, body, metadata },
    });
  }

  async getForUser(userId, query) {
    const { page, limit, skip } = parsePagination(query);

    const where = { userId };
    if (query.unreadOnly === "true") {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      ...paginatedResponse(notifications, total, { page, limit }),
      unreadCount,
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) throw ApiError.notFound("Notification not found");
    if (notification.userId !== userId) throw ApiError.forbidden();

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId) {
    return prisma.notification.count({ where: { userId, read: false } });
  }
}

module.exports = new NotificationService();
