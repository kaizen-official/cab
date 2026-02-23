const crypto = require("crypto");
const { config } = require("../config");

function generateOTP() {
  const digits = config.otp.length;
  const max = Math.pow(10, digits);
  const min = Math.pow(10, digits - 1);
  const num = crypto.randomInt(min, max);
  return num.toString();
}

function otpExpiresAt() {
  return new Date(Date.now() + config.otp.expiresInMinutes * 60 * 1000);
}

module.exports = { generateOTP, otpExpiresAt };
