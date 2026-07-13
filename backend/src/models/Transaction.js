const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    gateway: { type: String, default: "razorpay" },
    gatewayEventId: { type: String, sparse: true, index: true },
    gatewayPaymentId: { type: String, index: true },
    type: {
      type: String,
      enum: ["order_created", "payment_authorized", "payment_captured", "payment_failed", "refund_created", "refund_processed", "refund_failed"],
      required: true,
      index: true
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    status: { type: String, required: true, index: true },
    payload: mongoose.Schema.Types.Mixed,
    occurredAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

transactionSchema.index({ occurredAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
