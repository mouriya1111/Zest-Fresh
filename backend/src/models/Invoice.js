const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    name: String,
    unit: String,
    quantity: Number,
    price: Number,
    total: Number
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: String,
    paymentStatus: String,
    currency: { type: String, default: "INR" },
    issuedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
