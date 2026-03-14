const nodemailer = require("nodemailer");

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function createTransport() {
  const host = getRequiredEnv("EMAIL_HOST");
  const port = Number(getRequiredEnv("EMAIL_PORT"));
  const user = getRequiredEnv("EMAIL_USER");
  const pass = getRequiredEnv("EMAIL_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function sendOtpEmail({ to, otp }) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  if (!from) {
    throw new Error("Missing EMAIL_FROM or EMAIL_USER for sender");
  }

  const transporter = createTransport();

  const subject = "Your ServeSmart OTP Code";
  const text = `Your OTP code is ${otp}. It expires in 10 minutes.`;

  await transporter.sendMail({ from, to, subject, text });
}

module.exports = { sendOtpEmail };
