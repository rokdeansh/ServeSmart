const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { sendOtpEmail } = require("../utils/mailer");

const router = express.Router();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getOtpExpiry() {
  return new Date(Date.now() + 10 * 60 * 1000);
}

router.post("/register", async (req, res) => {

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    const user = new User({
      username,
      email,
      password: hashed,
      isVerified: false,
      otpHash,
      otpExpiresAt: getOtpExpiry()
    });

    await user.save();

    try {
      await sendOtpEmail({ to: email, otp });
    } catch (mailErr) {
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.json({ message: "OTP sent to your email. Please verify.", needsOtp: true });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }

});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.json({ message: "Email already verified" });
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const match = await bcrypt.compare(otp, user.otpHash || "");
    if (!match) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) {
      return res.json({ message: "Email already verified" });
    }

    const otp = generateOtp();
    user.otpHash = await bcrypt.hash(otp, 10);
    user.otpExpiresAt = getOtpExpiry();
    await user.save();

    await sendOtpEmail({ to: email, otp });
    res.json({ message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to resend OTP" });
  }
});

router.post("/login", async (req, res) => {

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ message: "Wrong password" });

    res.json({ message: "Login success", userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }

});

module.exports = router;
