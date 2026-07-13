const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    gateway: { type: String, enum: ["razorpay", "cod"], default: "razorpay", index: true },
    gatewayOrderId: { type: String, required: true, unique: true },
    gatewayPaymentId: { type: String, sparse: true, unique: true },
    gatewaySignature: String,
    amount: { type: Number, required: true, min: 0 },
    amountPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    method: {
      type: String,
      enum: ["UPI", "Card", "NetBanking", "Wallet", "EMI", "COD", "Unknown"],
      default: "Unknown",
      index: true
    },
    status: {
      type: String,
      enum: ["Created", "Pending", "Authorized", "Paid", "Failed", "Refunded", "Partially Refunded"],
      default: "Created",
      index: true
    },
    attempts: { type: Number, default: 0 },
    failureCode: String,
    failureReason: String,
    gatewayPayload: mongoose.Schema.Types.Mixed,
    verifiedAt: Date,
    paidAt: Date
  },
  { timestamps: true }
);

paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
