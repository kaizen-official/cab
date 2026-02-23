const { prisma } = require("../../config/database");
const ApiError = require("../../utils/ApiError");
const { parsePagination, paginatedResponse } = require("../../utils/pagination");
const notificationService = require("../notification/notification.service");

const REVIEW_SELECT = {
  id: true,
  rating: true,
  comment: true,
  createdAt: true,
  rideId: true,
  author: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  },
  target: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  },
};

class ReviewService {
  async create(authorId, { targetId, rideId, rating, comment }) {
    if (authorId === targetId) {
      throw ApiError.badRequest("You cannot review yourself");
    }

    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw ApiError.notFound("Ride not found");
    if (ride.status !== "COMPLETED") {
      throw ApiError.badRequest("Can only review completed rides");
    }

    const wasOnRide = await this._verifyParticipation(authorId, targetId, rideId);
    if (!wasOnRide) {
      throw ApiError.forbidden("Both users must have participated in this ride");
    }

    const existing = await prisma.review.findUnique({
      where: { authorId_rideId: { authorId, rideId } },
    });
    if (existing) {
      throw ApiError.conflict("You already reviewed this ride");
    }

    const review = await prisma.review.create({
      data: {
        authorId,
        targetId,
        rideId,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        comment: comment || null,
      },
      select: REVIEW_SELECT,
    });

    await notificationService.create({
      userId: targetId,
      type: "REVIEW_RECEIVED",
      title: "New review",
      body: `You received a ${rating}-star review.`,
      metadata: { reviewId: review.id, rideId },
    });

    return review;
  }

  async getForUser(userId, query) {
    const { page, limit, skip } = parsePagination(query);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { targetId: userId },
        select: REVIEW_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { targetId: userId } }),
    ]);

    return paginatedResponse(reviews, total, { page, limit });
  }

  async getForRide(rideId, query) {
    const { page, limit, skip } = parsePagination(query);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { rideId },
        select: REVIEW_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { rideId } }),
    ]);

    return paginatedResponse(reviews, total, { page, limit });
  }

  async _verifyParticipation(authorId, targetId, rideId) {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    const participants = new Set([ride.creatorId]);

    const confirmedBookings = await prisma.booking.findMany({
      where: { rideId, status: "COMPLETED" },
      select: { passengerId: true },
    });
    for (const b of confirmedBookings) {
      participants.add(b.passengerId);
    }

    return participants.has(authorId) && participants.has(targetId);
  }
}

module.exports = new ReviewService();
