const { prisma } = require("../../config/database");
const ApiError = require("../../utils/ApiError");
const { parsePagination, paginatedResponse } = require("../../utils/pagination");
const notificationService = require("../notification/notification.service");

const RIDE_SELECT = {
  id: true,
  fromCity: true,
  fromAddress: true,
  fromLat: true,
  fromLng: true,
  toCity: true,
  toAddress: true,
  toLat: true,
  toLng: true,
  departureTime: true,
  estimatedArrival: true,
  totalSeats: true,
  availableSeats: true,
  pricePerSeat: true,
  vehicle: true,
  vehicleNumber: true,
  notes: true,
  allowedGenders: true,
  status: true,
  createdAt: true,
  creator: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      college: true,
      collegeVerified: true,
    },
  },
};

function enrichRide(ride) {
  const seats = ride.availableSeats;
  let urgencyLabel = "Open";
  if (seats === 0) urgencyLabel = "Full";
  else if (seats <= 2) urgencyLabel = "Almost Full";

  const confirmedCount = ride.bookings
    ? ride.bookings.filter((b) => b.status === "CONFIRMED").length
    : 0;

  return { ...ride, urgencyLabel, confirmedCount };
}

function enrichRides(rides) {
  return rides.map(enrichRide);
}

class RideService {
  async create(userId, data) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } });
    if (!user?.emailVerified) {
      throw ApiError.forbidden("You must verify your email before creating a ride");
    }

    const departureTime = new Date(data.departureTime);
    if (departureTime <= new Date()) {
      throw ApiError.badRequest("Departure time must be in the future");
    }

    return prisma.ride.create({
      data: {
        creatorId: userId,
        fromCity: data.fromCity,
        fromAddress: data.fromAddress,
        fromLat: data.fromLat ? parseFloat(data.fromLat) : null,
        fromLng: data.fromLng ? parseFloat(data.fromLng) : null,
        toCity: data.toCity,
        toAddress: data.toAddress,
        toLat: data.toLat ? parseFloat(data.toLat) : null,
        toLng: data.toLng ? parseFloat(data.toLng) : null,
        departureTime,
        estimatedArrival: data.estimatedArrival ? new Date(data.estimatedArrival) : null,
        totalSeats: parseInt(data.totalSeats, 10),
        availableSeats: parseInt(data.totalSeats, 10),
        pricePerSeat: parseInt(data.pricePerSeat, 10),
        vehicle: data.vehicle || null,
        vehicleNumber: data.vehicleNumber || null,
        notes: data.notes || null,
        allowedGenders: data.allowedGenders || [],
      },
      select: RIDE_SELECT,
    });
  }

  async search(query) {
    const { page, limit, skip } = parsePagination(query);

    const where = {
      status: { in: ["ACTIVE", "FULL"] },
      departureTime: { gt: new Date() },
    };

    if (query.fromCity) {
      where.fromCity = { contains: query.fromCity, mode: "insensitive" };
    }
    if (query.toCity) {
      where.toCity = { contains: query.toCity, mode: "insensitive" };
    }
    if (query.date) {
      const start = new Date(query.date);
      const end = new Date(query.date);
      end.setDate(end.getDate() + 1);
      where.departureTime = { gte: start, lt: end };
    }
    if (query.minSeats) {
      where.availableSeats = { gte: parseInt(query.minSeats, 10) };
    }
    if (query.maxPrice) {
      where.pricePerSeat = { lte: parseInt(query.maxPrice, 10) };
    }
    if (query.college) {
      where.creator = { college: { contains: query.college, mode: "insensitive" } };
    }

    const orderBy = this._parseSortOrder(query.sortBy);

    const [rides, total] = await Promise.all([
      prisma.ride.findMany({
        where,
        select: {
          ...RIDE_SELECT,
          bookings: { where: { status: "CONFIRMED" }, select: { id: true, status: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.ride.count({ where }),
    ]);

    const enriched = enrichRides(rides).map(({ bookings, ...r }) => r);
    return paginatedResponse(enriched, total, { page, limit });
  }

  async getById(rideId, requestingUserId) {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      select: {
        ...RIDE_SELECT,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            college: true,
            collegeVerified: true,
            whatsappNumber: true,
            whatsappVisible: true,
            phone: true,
          },
        },
        bookings: {
          where: { status: { in: ["CONFIRMED", "PENDING"] } },
          select: {
            id: true,
            seatsBooked: true,
            status: true,
            passenger: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true, college: true },
            },
          },
        },
      },
    });

    if (!ride) throw ApiError.notFound("Ride not found");

    const enriched = enrichRide(ride);

    const isOwner = requestingUserId && ride.creator.id === requestingUserId;
    const hasConfirmedBooking = requestingUserId && ride.bookings.some(
      (b) => b.passenger.id === requestingUserId && b.status === "CONFIRMED"
    );
    const canSeeContact = isOwner || hasConfirmedBooking;

    if (!canSeeContact || !ride.creator.whatsappVisible) {
      delete enriched.creator.whatsappNumber;
      delete enriched.creator.phone;
    }

    return enriched;
  }

  async getByCreator(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const where = { creatorId: userId };

    if (query.status) {
      where.status = query.status;
    }

    const [rides, total] = await Promise.all([
      prisma.ride.findMany({
        where,
        select: {
          ...RIDE_SELECT,
          bookings: { where: { status: "CONFIRMED" }, select: { id: true, status: true } },
        },
        orderBy: { departureTime: "desc" },
        skip,
        take: limit,
      }),
      prisma.ride.count({ where }),
    ]);

    const enriched = enrichRides(rides).map(({ bookings, ...r }) => r);
    return paginatedResponse(enriched, total, { page, limit });
  }

  async update(rideId, userId, data) {
    const ride = await this._getOwnedRide(rideId, userId);

    if (ride.status !== "ACTIVE") {
      throw ApiError.badRequest("Can only edit active rides");
    }

    const confirmedBookings = await prisma.booking.count({
      where: { rideId, status: "CONFIRMED" },
    });

    const updateData = {};
    const editable = [
      "fromAddress", "toAddress", "notes", "vehicle", "vehicleNumber",
      "estimatedArrival", "pricePerSeat",
    ];

    for (const key of editable) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    if (data.departureTime) {
      const newTime = new Date(data.departureTime);
      if (newTime <= new Date()) {
        throw ApiError.badRequest("Departure time must be in the future");
      }
      updateData.departureTime = newTime;
    }

    if (data.totalSeats !== undefined) {
      const newTotal = parseInt(data.totalSeats, 10);
      const bookedSeats = ride.totalSeats - ride.availableSeats;
      if (newTotal < bookedSeats) {
        throw ApiError.badRequest(`Cannot reduce seats below ${bookedSeats} (already booked)`);
      }
      updateData.totalSeats = newTotal;
      updateData.availableSeats = newTotal - bookedSeats;
    }

    if (data.pricePerSeat !== undefined) {
      updateData.pricePerSeat = parseInt(data.pricePerSeat, 10);
    }
    if (data.estimatedArrival !== undefined) {
      updateData.estimatedArrival = data.estimatedArrival ? new Date(data.estimatedArrival) : null;
    }

    const updated = await prisma.ride.update({
      where: { id: rideId },
      data: updateData,
      select: RIDE_SELECT,
    });

    if (confirmedBookings > 0) {
      const bookings = await prisma.booking.findMany({
        where: { rideId, status: "CONFIRMED" },
        select: { passengerId: true },
      });
      for (const b of bookings) {
        await notificationService.create({
          userId: b.passengerId,
          type: "SYSTEM",
          title: "Ride updated",
          body: `The ride from ${updated.fromCity} to ${updated.toCity} has been updated.`,
          metadata: { rideId },
        });
      }
    }

    return updated;
  }

  async cancel(rideId, userId) {
    const ride = await this._getOwnedRide(rideId, userId);

    if (ride.status === "CANCELLED" || ride.status === "COMPLETED") {
      throw ApiError.badRequest("Ride is already " + ride.status.toLowerCase());
    }

    await prisma.$transaction(async (tx) => {
      await tx.ride.update({
        where: { id: rideId },
        data: { status: "CANCELLED" },
      });

      const activeBookings = await tx.booking.findMany({
        where: { rideId, status: { in: ["PENDING", "CONFIRMED"] } },
        select: { id: true, passengerId: true },
      });

      if (activeBookings.length > 0) {
        await tx.booking.updateMany({
          where: { id: { in: activeBookings.map((b) => b.id) } },
          data: { status: "CANCELLED" },
        });

        for (const b of activeBookings) {
          await notificationService.createInTx(tx, {
            userId: b.passengerId,
            type: "RIDE_CANCELLED",
            title: "Ride cancelled",
            body: `The ride from ${ride.fromCity} to ${ride.toCity} has been cancelled by the driver.`,
            metadata: { rideId },
          });
        }
      }
    });
  }

  async markDeparted(rideId, userId) {
    const ride = await this._getOwnedRide(rideId, userId);
    if (ride.status !== "ACTIVE" && ride.status !== "FULL") {
      throw ApiError.badRequest("Ride must be active or full to mark as departed");
    }

    return prisma.ride.update({
      where: { id: rideId },
      data: { status: "DEPARTED" },
      select: RIDE_SELECT,
    });
  }

  async markCompleted(rideId, userId) {
    const ride = await this._getOwnedRide(rideId, userId);
    if (ride.status !== "DEPARTED") {
      throw ApiError.badRequest("Ride must be departed to mark as completed");
    }

    await prisma.$transaction(async (tx) => {
      await tx.ride.update({
        where: { id: rideId },
        data: { status: "COMPLETED" },
      });

      await tx.booking.updateMany({
        where: { rideId, status: "CONFIRMED" },
        data: { status: "COMPLETED" },
      });
    });
  }

  async suggest(userId, query) {
    const timeWindowMins = parseInt(query.timeWindowMins, 10) || 45;
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindowMins * 60000);
    const windowEnd = new Date(now.getTime() + 24 * 60 * 60000);

    const baseWhere = {
      status: "ACTIVE",
      departureTime: { gte: windowStart, lte: windowEnd },
      creatorId: { not: userId },
      availableSeats: { gte: 1 },
    };

    if (query.fromCity) {
      baseWhere.fromCity = { contains: query.fromCity, mode: "insensitive" };
    }
    if (query.toCity) {
      baseWhere.toCity = { contains: query.toCity, mode: "insensitive" };
    }

    const suggestSelect = {
      ...RIDE_SELECT,
      bookings: { where: { status: "CONFIRMED" }, select: { id: true, status: true } },
    };

    let rides = await prisma.ride.findMany({
      where: baseWhere,
      select: suggestSelect,
      orderBy: { departureTime: "asc" },
      take: 6,
    });

    if (rides.length === 0 && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { college: true },
      });

      if (user?.college) {
        rides = await prisma.ride.findMany({
          where: {
            status: "ACTIVE",
            departureTime: { gte: now },
            creatorId: { not: userId },
            availableSeats: { gte: 1 },
            creator: { college: { equals: user.college, mode: "insensitive" } },
          },
          select: suggestSelect,
          orderBy: { departureTime: "asc" },
          take: 6,
        });
      }
    }

    return enrichRides(rides).map(({ bookings, ...r }) => r);
  }

  // ── Private helpers ──

  async _getOwnedRide(rideId, userId) {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw ApiError.notFound("Ride not found");
    if (ride.creatorId !== userId) throw ApiError.forbidden("You don't own this ride");
    return ride;
  }

  _parseSortOrder(sortBy) {
    switch (sortBy) {
      case "price_asc":
        return { pricePerSeat: "asc" };
      case "price_desc":
        return { pricePerSeat: "desc" };
      case "departure_asc":
        return { departureTime: "asc" };
      case "departure_desc":
        return { departureTime: "desc" };
      case "newest":
        return { createdAt: "desc" };
      default:
        return { departureTime: "asc" };
    }
  }
}

module.exports = new RideService();
