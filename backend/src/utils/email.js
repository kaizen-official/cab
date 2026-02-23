const nodemailer = require("nodemailer");
const { config } = require("../config");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { host, port, secure, user, pass, from } = config.smtp;

  if (!host || !user || !pass) {
    console.warn("[email] SMTP not configured. OTPs will be logged to console.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: port || (secure ? 465 : 587),
    secure: !!secure,
    auth: { user, pass },
  });

  return transporter;
}

async function sendOTP(email, code, purpose) {
  const subject =
    purpose === "EMAIL_VERIFICATION"
      ? "Verify your drift account"
      : "Reset your drift password";

  const body =
    purpose === "EMAIL_VERIFICATION"
      ? `Your verification code is: ${code}\n\nIt expires in 10 minutes.`
      : `Your password reset code is: ${code}\n\nIt expires in 10 minutes. If you didn't request this, you can ignore this email.`;

  const transport = getTransporter();

  if (!transport) {
    console.log(`[email] OTP for ${email}: ${code}`);
    return;
  }

  try {
    await transport.sendMail({
      from: config.smtp.from || config.smtp.user,
      to: email,
      subject: `[drift] ${subject}`,
      text: body,
    });
  } catch (err) {
    console.error("[email] failed to send OTP:", err.message);
    throw err;
  }
}

module.exports = { sendOTP };
