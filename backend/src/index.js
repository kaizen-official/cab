const express = require("express");
const cors = require("cors");
const { config, validateEnv } = require("./config");
const { db } = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");
const { registerCronJobs } = require("./cron");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const rideRoutes = require("./modules/ride/ride.routes");
const bookingRoutes = require("./modules/booking/booking.routes");
const reviewRoutes = require("./modules/review/review.routes");
const notificationRoutes = require("./modules/notification/notification.routes");
const uploadRoutes = require("./modules/upload/upload.routes");

validateEnv();

const app = express();

// ── Global middleware ──
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimiter.middleware(config.rateLimit.windowMs, config.rateLimit.max));

// ── Health check ──
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API routes ──
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/uploads", uploadRoutes);

// ── 404 handler ──
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Error handler ──
app.use(errorHandler);

// ── Start server ──
async function start() {
  try {
    await db.connect();
    registerCronJobs();

    app.listen(config.port, () => {
      console.log(`[server] running on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (err) {
    console.error("[server] failed to start:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  console.log("[server] shutting down...");
  rateLimiter.destroy();
  await db.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[server] shutting down...");
  rateLimiter.destroy();
  await db.disconnect();
  process.exit(0);
});

start();
