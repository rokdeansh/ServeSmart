const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  otpHash: String,
  otpExpiresAt: Date
});

module.exports = mongoose.model("User", userSchema);
