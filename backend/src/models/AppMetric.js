const mongoose = require("mongoose");

const appMetricSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true },
    downloads: { type: Number, default: 0 },
    dailyActiveUsers: { type: Number, default: 0 },
    newRegistrations: { type: Number, default: 0 },
    activeUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppMetric", appMetricSchema);
