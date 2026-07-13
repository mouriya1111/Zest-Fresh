const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true, index: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gatewayRefundId: { type: String, sparse: true, unique: true },
    amount: { type: Number, required: true, min: 1 },
    amountPaise: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR" },
    reason: String,
    status: {
      type: String,
      enum: ["Requested", "Processing", "Processed", "Failed"],
      default: "Requested",
      index: true
    },
    gatewayPayload: mongoose.Schema.Types.Mixed,
    processedAt: Date
  },
  { timestamps: true }
);

refundSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Refund", refundSchema);
