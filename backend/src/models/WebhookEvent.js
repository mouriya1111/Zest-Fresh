const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema(
  {
    gateway: { type: String, default: "razorpay", index: true },
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true, index: true },
    processed: { type: Boolean, default: false },
    payload: mongoose.Schema.Types.Mixed,
    processedAt: Date,
    error: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebhookEvent", webhookEventSchema);
