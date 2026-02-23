require("dotenv").config();

const config = Object.freeze({
  port: parseInt(process.env.PORT, 10),
  nodeEnv: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === "development",

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: "15m",
    refreshExpiresIn: "7d",
  },

  otp: {
    length: 6,
    expiresInMinutes: 10,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || true,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM,
  },

  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
});

function validateEnv() {
  const required = ["DATABASE_URL"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

module.exports = { config, validateEnv };
