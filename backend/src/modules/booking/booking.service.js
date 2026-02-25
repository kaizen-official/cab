const { prisma } = require("../../config/database");
const ApiError = require("../../utils/ApiError");
const { parsePagination, paginatedResponse } = require("../../utils/pagination");
const notificationService = require("../notification/notification.service");

const BOOKING_SELECT = {
  id: true,
  seatsBooked: true,
  status: true,
  message: true,
  createdAt: true,
  ride: {
    select: {
      id: true,
      fromCity: true,
      fromAddress: true,
      toCity: true,
      toAddress: true,
      departureTime: true,
      pricePerSeat: true,
      status: true,
      creator: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
  },
  passenger: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true, college: true },
  },
};

class BookingService {
  async requestBooking(passengerId, { rideId, seatsBooked = 1, message }) {
    const requester = await prisma.user.findUnique({ where: { id: passengerId }, select: { emailVerified: true } });
    if (!requester?.emailVerified) {
      throw ApiError.forbidden("You must verify your email before booking a ride");
    }

    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw ApiError.notFound("Ride not found");
    if (ride.creatorId === passengerId) {
      throw ApiError.badRequest("You cannot book your own ride");
    }
    if (ride.status !== "ACTIVE") {
      throw ApiError.badRequest("This ride is not accepting bookings");
    }

    const seats = parseInt(seatsBooked, 10);
    if (seats < 1) throw ApiError.badRequest("Must book at least 1 seat");
    if (seats > ride.availableSeats) {
      throw ApiError.badRequest(`Only ${ride.availableSeats} seat(s) available`);
    }

    const existing = await prisma.booking.findUnique({
      where: { rideId_passengerId: { rideId, passengerId } },
    });
    if (existing && existing.status !== "CANCELLED" && existing.status !== "REJECTED") {
      throw ApiError.conflict("You already have an active booking for this ride");
    }

    if (ride.allowedGenders && ride.allowedGenders.length > 0) {
      const passenger = await prisma.user.findUnique({
        where: { id: passengerId },
        select: { gender: true },
      });
      if (passenger.gender && !ride.allowedGenders.includes(passenger.gender)) {
        throw ApiError.forbidden("This ride has gender restrictions");
      }
    }

    let booking;
    if (existing && (existing.status === "CANCELLED" || existing.status === "REJECTED")) {
      booking = await prisma.booking.update({
        where: { id: existing.id },
        data: { seatsBooked: seats, status: "PENDING", message: message || null },
        select: BOOKING_SELECT,
      });
    } else {
      booking = await prisma.booking.create({
        data: { rideId, passengerId, seatsBooked: seats, message: message || null },
        select: BOOKING_SELECT,
      });
    }

    await notificationService.create({
      userId: ride.creatorId,
      type: "BOOKING_REQUEST",
      title: "New booking request",
      body: `Someone wants to join your ride from ${ride.fromCity} to ${ride.toCity}.`,
      metadata: { rideId, bookingId: booking.id },
    });

    return booking;
  }

  async confirmBooking(bookingId, driverId) {
    const booking = await this._getBookingForDriver(bookingId, driverId);

    if (booking.status !== "PENDING") {
      throw ApiError.badRequest("Booking is not pending");
    }

    const ride = await prisma.ride.findUnique({ where: { id: booking.rideId } });
    if (ride.availableSeats < booking.seatsBooked) {
      throw ApiError.badRequest("Not enough seats available");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
        select: BOOKING_SELECT,
      });

      const newAvailable = ride.availableSeats - booking.seatsBooked;
      await tx.ride.update({
        where: { id: booking.rideId },
        data: {
          availableSeats: newAvailable,
          status: newAvailable === 0 ? "FULL" : "ACTIVE",
        },
      });

      await notificationService.createInTx(tx, {
        userId: booking.passengerId,
        type: "BOOKING_CONFIRMED",
        title: "Booking confirmed",
        body: `Your booking for the ride from ${ride.fromCity} to ${ride.toCity} has been confirmed.`,
        metadata: { rideId: ride.id, bookingId },
      });

      return updated;
    });

    return result;
  }

  async rejectBooking(bookingId, driverId) {
    const booking = await this._getBookingForDriver(bookingId, driverId);

    if (booking.status !== "PENDING") {
      throw ApiError.badRequest("Booking is not pending");
    }

    const result = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "REJECTED" },
      select: BOOKING_SELECT,
    });

    const ride = await prisma.ride.findUnique({ where: { id: booking.rideId } });
    await notificationService.create({
      userId: booking.passengerId,
      type: "BOOKING_REJECTED",
      title: "Booking rejected",
      body: `Your booking for the ride from ${ride.fromCity} to ${ride.toCity} was not accepted.`,
      metadata: { rideId: ride.id, bookingId },
    });

    return result;
  }

  async cancelBooking(bookingId, passengerId) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw ApiError.notFound("Booking not found");
    if (booking.passengerId !== passengerId) {
      throw ApiError.forbidden("Not your booking");
    }
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      throw ApiError.badRequest("Cannot cancel this booking");
    }

    const wasConfirmed = booking.status === "CONFIRMED";

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
        select: BOOKING_SELECT,
      });

      if (wasConfirmed) {
        const ride = await tx.ride.findUnique({ where: { id: booking.rideId } });
        const newAvailable = ride.availableSeats + booking.seatsBooked;
        await tx.ride.update({
          where: { id: booking.rideId },
          data: {
            availableSeats: newAvailable,
            status: newAvailable > 0 && ride.status === "FULL" ? "ACTIVE" : ride.status,
          },
        });

        await notificationService.createInTx(tx, {
          userId: ride.creatorId,
          type: "BOOKING_CANCELLED",
          title: "Booking cancelled",
          body: `A passenger cancelled their booking for your ride from ${ride.fromCity} to ${ride.toCity}.`,
          metadata: { rideId: ride.id, bookingId },
        });
      }

      return updated;
    });

    return result;
  }

  async getMyBookings(passengerId, query) {
    const { page, limit, skip } = parsePagination(query);
    const where = { passengerId };

    if (query.status) {
      where.status = query.status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: BOOKING_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return paginatedResponse(bookings, total, { page, limit });
  }

  async getRideBookings(rideId, driverId, query) {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw ApiError.notFound("Ride not found");
    if (ride.creatorId !== driverId) throw ApiError.forbidden("Not your ride");

    const { page, limit, skip } = parsePagination(query);
    const where = { rideId };

    if (query.status) {
      where.status = query.status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: BOOKING_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return paginatedResponse(bookings, total, { page, limit });
  }

  // ── Private helpers ──

  async _getBookingForDriver(bookingId, driverId) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw ApiError.notFound("Booking not found");

    const ride = await prisma.ride.findUnique({ where: { id: booking.rideId } });
    if (ride.creatorId !== driverId) {
      throw ApiError.forbidden("You are not the driver of this ride");
    }

    return booking;
  }
}

module.exports = new BookingService();
