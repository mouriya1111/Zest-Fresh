const Invoice = require("../models/Invoice");

function invoiceNumberFor(order) {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = order._id.toString().slice(-8).toUpperCase();
  return `ZF-${yyyymmdd}-${suffix}`;
}

async function createInvoiceForOrder(order, payment, user) {
  const existing = await Invoice.findOne({ order: order._id });

  if (existing) {
    return existing;
  }

  const invoice = await Invoice.create({
    invoiceNumber: invoiceNumberFor(order),
    order: order._id,
    payment: payment?._id,
    user: user?._id || order.user,
    customerName: user?.name,
    customerEmail: user?.email,
    customerPhone: user?.phone,
    items: order.items.map((item) => ({
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    gstAmount: 0,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    currency: payment?.currency || "INR"
  });

  order.invoice = invoice._id;
  order.invoiceNumber = invoice.invoiceNumber;
  await order.save();

  return invoice;
}

module.exports = { createInvoiceForOrder, invoiceNumberFor };
