const mongoose = require("mongoose");

const registrationOtpSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    verifiedAt: Date
  },
  { timestamps: true }
);

registrationOtpSchema.index({ email: 1, phone: 1 });

module.exports = mongoose.model("RegistrationOtp", registrationOtpSchema);
