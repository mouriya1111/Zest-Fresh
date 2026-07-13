const Order = require("../models/Order");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const Refund = require("../models/Refund");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const WebhookEvent = require("../models/WebhookEvent");
const { getRazorpayClient } = require("../config/razorpay");
const { verifyPaymentSignature, verifyWebhookSignature } = require("../utils/razorpaySignature");
const { createInvoiceForOrder } = require("./invoiceService");

const ONLINE_METHODS = ["UPI", "Card", "NetBanking", "Wallet", "EMI"];
const RAZORPAY_METHOD_MAP = {
  upi: "UPI",
  card: "Card",
  netbanking: "NetBanking",
  wallet: "Wallet",
  emi: "EMI"
};

function toPaise(amount) {
  return Math.round(Number(amount) * 100);
}

function fromPaise(amount) {
  return Math.round(Number(amount || 0)) / 100;
}

function validateObjectId(id, label) {
  if (!id || !String(id).match(/^[a-f\d]{24}$/i)) {
    const error = new Error(`${label} is invalid`);
    error.statusCode = 400;
    throw error;
  }
}

async function buildOrderSnapshot(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Order must include at least one item");
    error.statusCode = 400;
    throw error;
  }

  for (const item of items) {
    validateObjectId(item.productId, "productId");
    if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
      const error = new Error("Every item quantity must be at least 1");
      error.statusCode = 400;
      throw error;
    }
  }

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    const quantity = Number(item.quantity);

    if (!product) {
      const error = new Error(`Product not found: ${item.productId}`);
      error.statusCode = 404;
      throw error;
    }

    if (!product.isPurchasable) {
      const error = new Error(`${product.name} is currently unavailable`);
      error.statusCode = 409;
      throw error;
    }

    if (product.remainingStock < quantity) {
      const error = new Error(`${product.name} is out of stock`);
      error.statusCode = 409;
      throw error;
    }

    const orderPrice = product.effectivePrice ?? product.price;
    subtotal += orderPrice * quantity;
    orderItems.push({
      product: product._id,
      name: product.name,
      unit: product.unit,
      quantity,
      price: orderPrice,
      imageUrl: product.imageUrl
    });
  }

  const deliveryFee = subtotal >= 499 ? 0 : 29;
  const total = subtotal + deliveryFee;

  return { orderItems, subtotal, deliveryFee, total };
}

function validateDeliveryAddress(deliveryAddress) {
  if (
    !deliveryAddress ||
    !deliveryAddress.line1 ||
    !deliveryAddress.city ||
    !deliveryAddress.state ||
    !deliveryAddress.postalCode
  ) {
    const error = new Error("Complete delivery address is required");
    error.statusCode = 400;
    throw error;
  }
}

async function createRazorpayOrder({ user, items, deliveryAddress, paymentMethod }) {
  if (!ONLINE_METHODS.includes(paymentMethod)) {
    const error = new Error("Online payment method must be UPI, Card, NetBanking, Wallet, or EMI");
    error.statusCode = 400;
    throw error;
  }

  const razorpay = getRazorpayClient();
  validateDeliveryAddress(deliveryAddress);
  const snapshot = await buildOrderSnapshot(items);
  const order = await Order.create({
    user: user._id,
    items: snapshot.orderItems,
    subtotal: snapshot.subtotal,
    deliveryFee: snapshot.deliveryFee,
    total: snapshot.total,
    deliveryAddress,
    paymentMethod,
    paymentStatus: "Pending",
    paymentStatusHistory: [{ status: "Pending", changedBy: user._id }],
    statusHistory: [{ status: "Pending", changedBy: user._id }]
  });

  const currency = process.env.PAYMENT_CURRENCY || "INR";
  const razorpayOrder = await razorpay.orders.create({
    amount: toPaise(order.total),
    currency,
    receipt: order._id.toString(),
    notes: {
      localOrderId: order._id.toString(),
      userId: user._id.toString()
    }
  });

  const payment = await Payment.create({
    order: order._id,
    user: user._id,
    gateway: "razorpay",
    gatewayOrderId: razorpayOrder.id,
    amount: order.total,
    amountPaise: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    method: paymentMethod,
    status: "Created",
    gatewayPayload: razorpayOrder
  });

  order.payment = payment._id;
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  await Transaction.create({
    order: order._id,
    payment: payment._id,
    user: user._id,
    gatewayPaymentId: null,
    type: "order_created",
    amount: order.total,
    currency,
    status: "Created",
    payload: razorpayOrder
  });

  return { order, payment, razorpayOrder };
}

async function verifyRazorpayPayment({ user, localOrderId, localPaymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  validateObjectId(localOrderId, "localOrderId");
  validateObjectId(localPaymentId, "localPaymentId");

  const payment = await Payment.findOne({
    _id: localPaymentId,
    order: localOrderId,
    user: user._id,
    gatewayOrderId: razorpayOrderId
  });

  if (!payment) {
    const error = new Error("Payment record not found");
    error.statusCode = 404;
    throw error;
  }

  if (payment.status === "Paid") {
    const order = await Order.findById(localOrderId);
    return { order, payment, alreadyVerified: true };
  }

  if (!verifyPaymentSignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature })) {
    payment.status = "Failed";
    payment.failureReason = "Invalid Razorpay signature";
    await payment.save();
    const error = new Error("Invalid payment signature");
    error.statusCode = 400;
    throw error;
  }

  const razorpay = getRazorpayClient();
  const gatewayPayment = await razorpay.payments.fetch(razorpayPaymentId);

  if (!["authorized", "captured"].includes(gatewayPayment.status)) {
    payment.status = "Failed";
    payment.failureCode = gatewayPayment.error_code;
    payment.failureReason = gatewayPayment.error_description || `Payment status: ${gatewayPayment.status}`;
    payment.gatewayPayload = gatewayPayment;
    await payment.save();
    const error = new Error(payment.failureReason || "Payment is not successful");
    error.statusCode = 409;
    throw error;
  }

  await markPaymentPaid({
    payment,
    gatewayPayment,
    signature: razorpaySignature,
    eventType: gatewayPayment.status === "captured" ? "payment_captured" : "payment_authorized"
  });

  const order = await Order.findById(localOrderId).populate("user", "name email phone");
  return { order, payment };
}

async function markPaymentPaid({ payment, gatewayPayment, signature, eventType = "payment_captured", eventId }) {
  const order = await Order.findById(payment.order);
  const user = await User.findById(payment.user);

  if (!order) {
    return null;
  }

  payment.gatewayPaymentId = gatewayPayment.id;
  payment.gatewaySignature = signature || payment.gatewaySignature;
  payment.method = RAZORPAY_METHOD_MAP[gatewayPayment.method] || payment.method || "Unknown";
  payment.status = gatewayPayment.status === "authorized" ? "Authorized" : "Paid";
  payment.gatewayPayload = gatewayPayment;
  payment.verifiedAt = new Date();
  payment.paidAt = gatewayPayment.status === "captured" ? new Date() : payment.paidAt;
  payment.attempts += 1;
  await payment.save();

  if (gatewayPayment.status === "captured" || gatewayPayment.captured) {
    order.paymentStatus = "Paid";
    order.paidAt = new Date();
    order.paymentReference = gatewayPayment.id;
    order.paymentStatusHistory.push({
      status: "Paid",
      changedBy: payment.user,
      reference: gatewayPayment.id
    });
    await order.save();
    await createInvoiceForOrder(order, payment, user);
  }

  await Transaction.create({
    order: order._id,
    payment: payment._id,
    user: payment.user,
    gatewayEventId: eventId,
    gatewayPaymentId: gatewayPayment.id,
    type: eventType,
    amount: fromPaise(gatewayPayment.amount || payment.amountPaise),
    currency: gatewayPayment.currency || payment.currency,
    status: payment.status,
    payload: gatewayPayment
  });

  return order;
}

async function markPaymentFailed({ payment, gatewayPayment, eventId }) {
  const order = await Order.findById(payment.order);
  payment.gatewayPaymentId = gatewayPayment.id || payment.gatewayPaymentId;
  payment.status = "Failed";
  payment.failureCode = gatewayPayment.error_code;
  payment.failureReason = gatewayPayment.error_description || gatewayPayment.error_reason || "Payment failed";
  payment.gatewayPayload = gatewayPayment;
  payment.attempts += 1;
  await payment.save();

  if (order && order.paymentStatus !== "Paid") {
    order.paymentStatus = "Failed";
    order.paymentStatusHistory.push({
      status: "Failed",
      changedBy: payment.user,
      reference: gatewayPayment.id
    });
    await order.save();
  }

  await Transaction.create({
    order: payment.order,
    payment: payment._id,
    user: payment.user,
    gatewayEventId: eventId,
    gatewayPaymentId: gatewayPayment.id,
    type: "payment_failed",
    amount: fromPaise(gatewayPayment.amount || payment.amountPaise),
    currency: gatewayPayment.currency || payment.currency,
    status: "Failed",
    payload: gatewayPayment
  });
}

async function retryPayment({ user, orderId }) {
  validateObjectId(orderId, "orderId");
  const order = await Order.findOne({ _id: orderId, user: user._id });

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (order.paymentStatus === "Paid") {
    const error = new Error("Order is already paid");
    error.statusCode = 409;
    throw error;
  }

  const razorpay = getRazorpayClient();
  const currency = process.env.PAYMENT_CURRENCY || "INR";
  const razorpayOrder = await razorpay.orders.create({
    amount: toPaise(order.total),
    currency,
    receipt: order._id.toString(),
    notes: {
      localOrderId: order._id.toString(),
      userId: user._id.toString(),
      retry: "true"
    }
  });

  const payment = await Payment.create({
    order: order._id,
    user: user._id,
    gateway: "razorpay",
    gatewayOrderId: razorpayOrder.id,
    amount: order.total,
    amountPaise: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    method: order.paymentMethod === "COD" ? "UPI" : order.paymentMethod,
    status: "Created",
    gatewayPayload: razorpayOrder
  });

  order.payment = payment._id;
  order.razorpayOrderId = razorpayOrder.id;
  order.paymentStatus = "Pending";
  await order.save();

  return { order, payment, razorpayOrder };
}

async function refundPayment({ masterUser, paymentId, amount, reason }) {
  validateObjectId(paymentId, "paymentId");
  const payment = await Payment.findById(paymentId);

  if (!payment || payment.status !== "Paid") {
    const error = new Error("Only paid payments can be refunded");
    error.statusCode = 409;
    throw error;
  }

  const refundAmount = amount ? Number(amount) : payment.amount;

  if (refundAmount < 1 || refundAmount > payment.amount) {
    const error = new Error("Refund amount is invalid");
    error.statusCode = 400;
    throw error;
  }

  const razorpay = getRazorpayClient();
  const gatewayRefund = await razorpay.payments.refund(payment.gatewayPaymentId, {
    amount: toPaise(refundAmount),
    notes: { reason: reason || "Admin refund" }
  });

  const refund = await Refund.create({
    order: payment.order,
    payment: payment._id,
    requestedBy: masterUser._id,
    gatewayRefundId: gatewayRefund.id,
    amount: refundAmount,
    amountPaise: gatewayRefund.amount,
    currency: gatewayRefund.currency || payment.currency,
    reason,
    status: gatewayRefund.status === "processed" ? "Processed" : "Processing",
    gatewayPayload: gatewayRefund,
    processedAt: gatewayRefund.status === "processed" ? new Date() : undefined
  });

  payment.status = refundAmount === payment.amount ? "Refunded" : "Partially Refunded";
  await payment.save();

  const order = await Order.findById(payment.order);
  if (order) {
    order.paymentStatus = payment.status;
    order.paymentStatusHistory.push({
      status: payment.status,
      changedBy: masterUser._id,
      reference: gatewayRefund.id
    });
    await order.save();
  }

  await Transaction.create({
    order: payment.order,
    payment: payment._id,
    user: payment.user,
    gatewayPaymentId: payment.gatewayPaymentId,
    type: gatewayRefund.status === "processed" ? "refund_processed" : "refund_created",
    amount: refundAmount,
    currency: refund.currency,
    status: refund.status,
    payload: gatewayRefund
  });

  return { refund, payment, order };
}

async function processRazorpayWebhook({ rawBody, signature, eventId }) {
  if (!verifyWebhookSignature(rawBody, signature)) {
    const error = new Error("Invalid webhook signature");
    error.statusCode = 400;
    throw error;
  }

  const payload = JSON.parse(rawBody.toString("utf8"));
  const eventType = payload.event;
  let webhookEvent;

  try {
    webhookEvent = await WebhookEvent.create({
      eventId,
      eventType,
      payload,
      gateway: "razorpay"
    });
  } catch (error) {
    if (error.code === 11000) {
      return { ok: true, duplicate: true };
    }

    throw error;
  }

  try {
    await applyWebhookPayload({ payload, eventId });
    webhookEvent.processed = true;
    webhookEvent.processedAt = new Date();
    await webhookEvent.save();
  } catch (error) {
    webhookEvent.error = error.message;
    await webhookEvent.save();
    throw error;
  }

  return { ok: true, duplicate: false };
}

async function applyWebhookPayload({ payload, eventId }) {
  const entity = payload.payload?.payment?.entity || payload.payload?.refund?.entity;

  if (!entity) {
    return;
  }

  if (payload.event?.startsWith("payment.")) {
    const payment = await Payment.findOne({ gatewayOrderId: entity.order_id });

    if (!payment) {
      return;
    }

    if (payload.event === "payment.captured" || payload.event === "payment.authorized") {
      await markPaymentPaid({
        payment,
        gatewayPayment: entity,
        eventType: payload.event === "payment.captured" ? "payment_captured" : "payment_authorized",
        eventId
      });
    }

    if (payload.event === "payment.failed") {
      await markPaymentFailed({ payment, gatewayPayment: entity, eventId });
    }
  }

  if (payload.event?.startsWith("refund.")) {
    const refund = await Refund.findOne({ gatewayRefundId: entity.id });

    if (!refund) {
      return;
    }

    refund.status = entity.status === "processed" ? "Processed" : "Failed";
    refund.gatewayPayload = entity;
    refund.processedAt = entity.status === "processed" ? new Date() : refund.processedAt;
    await refund.save();
  }
}

module.exports = {
  ONLINE_METHODS,
  buildOrderSnapshot,
  createRazorpayOrder,
  verifyRazorpayPayment,
  retryPayment,
  refundPayment,
  processRazorpayWebhook
};
