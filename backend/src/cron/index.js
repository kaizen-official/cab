const cron = require("node-cron");
const { prisma } = require("../config/database");
const notificationService = require("../modules/notification/notification.service");

function registerCronJobs() {
  // Every 15 minutes: auto-expire past rides that are still ACTIVE
  cron.schedule("*/15 * * * *", async () => {
    try {
      const result = await prisma.ride.updateMany({
        where: {
          status: { in: ["ACTIVE", "FULL"] },
          departureTime: { lt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        },
        data: { status: "DEPARTED" },
      });
      if (result.count > 0) {
        console.log(`[cron] auto-expired ${result.count} past rides`);
      }
    } catch (err) {
      console.error("[cron] ride expiry error:", err.message);
    }
  });

  // Every hour: send reminders for rides departing in the next 2 hours
  cron.schedule("0 * * * *", async () => {
    try {
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const oneHourFromNow = new Date(Date.now() + 1 * 60 * 60 * 1000);

      const upcomingRides = await prisma.ride.findMany({
        where: {
          status: { in: ["ACTIVE", "FULL"] },
          departureTime: { gte: oneHourFromNow, lte: twoHoursFromNow },
        },
        include: {
          bookings: {
            where: { status: "CONFIRMED" },
            select: { passengerId: true },
          },
        },
      });

      for (const ride of upcomingRides) {
        const userIds = [ride.creatorId, ...ride.bookings.map((b) => b.passengerId)];
        for (const userId of userIds) {
          await notificationService.create({
            userId,
            type: "RIDE_REMINDER",
            title: "Ride departing soon",
            body: `Your ride from ${ride.fromCity} to ${ride.toCity} departs in about 1-2 hours.`,
            metadata: { rideId: ride.id },
          });
        }
      }

      if (upcomingRides.length > 0) {
        console.log(`[cron] sent reminders for ${upcomingRides.length} upcoming rides`);
      }
    } catch (err) {
      console.error("[cron] ride reminder error:", err.message);
    }
  });

  // Daily at 3 AM: clean up expired OTPs
  cron.schedule("0 3 * * *", async () => {
    try {
      const result = await prisma.oTP.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      if (result.count > 0) {
        console.log(`[cron] cleaned ${result.count} expired OTPs`);
      }
    } catch (err) {
      console.error("[cron] OTP cleanup error:", err.message);
    }
  });

  // Daily at 4 AM: auto-complete rides that departed 24+ hours ago
  cron.schedule("0 4 * * *", async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const departedRides = await prisma.ride.findMany({
        where: {
          status: "DEPARTED",
          departureTime: { lt: oneDayAgo },
        },
        select: { id: true },
      });

      for (const ride of departedRides) {
        await prisma.$transaction(async (tx) => {
          await tx.ride.update({
            where: { id: ride.id },
            data: { status: "COMPLETED" },
          });
          await tx.booking.updateMany({
            where: { rideId: ride.id, status: "CONFIRMED" },
            data: { status: "COMPLETED" },
          });
        });
      }

      if (departedRides.length > 0) {
        console.log(`[cron] auto-completed ${departedRides.length} rides`);
      }
    } catch (err) {
      console.error("[cron] auto-complete error:", err.message);
    }
  });

  console.log("[cron] all jobs registered");
}

module.exports = { registerCronJobs };
