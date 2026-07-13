const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Refund = require("../models/Refund");
const Transaction = require("../models/Transaction");
const {
  createRazorpayOrder,
  processRazorpayWebhook,
  refundPayment,
  retryPayment,
  verifyRazorpayPayment
} = require("../services/paymentService");

function paymentScope(user) {
  return user.role === "master" ? {} : { user: user._id };
}

function gatewayPayload(razorpayOrder) {
  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency
  };
}

async function createOrder(request, response, next) {
  try {
    const result = await createRazorpayOrder({
      user: request.user,
      items: request.body.items,
      deliveryAddress: request.body.deliveryAddress,
      paymentMethod: request.body.paymentMethod
    });

    response.status(201).json({
      success: true,
      order: result.order,
      payment: result.payment,
      gateway: gatewayPayload(result.razorpayOrder)
    });
  } catch (error) {
    next(error);
  }
}

async function verify(request, response, next) {
  try {
    const result = await verifyRazorpayPayment({
      user: request.user,
      localOrderId: request.body.localOrderId,
      localPaymentId: request.body.localPaymentId,
      razorpayOrderId: request.body.razorpayOrderId || request.body.razorpay_order_id,
      razorpayPaymentId: request.body.razorpayPaymentId || request.body.razorpay_payment_id,
      razorpaySignature: request.body.razorpaySignature || request.body.razorpay_signature
    });

    response.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function retry(request, response, next) {
  try {
    const result = await retryPayment({
      user: request.user,
      orderId: request.params.orderId
    });

    response.json({
      success: true,
      order: result.order,
      payment: result.payment,
      gateway: gatewayPayload(result.razorpayOrder)
    });
  } catch (error) {
    next(error);
  }
}

async function listPayments(request, response, next) {
  try {
    const payments = await Payment.find(paymentScope(request.user))
      .populate("order", "total status paymentStatus createdAt")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .limit(100);

    response.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
}

async function listTransactions(request, response, next) {
  try {
    const transactions = await Transaction.find(paymentScope(request.user))
      .populate("order", "total status paymentStatus createdAt")
      .populate("payment", "status method gatewayPaymentId")
      .populate("user", "name email phone")
      .sort({ occurredAt: -1 })
      .limit(100);

    response.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
}

async function listRefunds(_request, response, next) {
  try {
    const refunds = await Refund.find()
      .populate("order", "total status paymentStatus createdAt")
      .populate("payment", "status method gatewayPaymentId")
      .populate("requestedBy", "name email phone")
      .sort({ createdAt: -1 })
      .limit(100);

    response.json({ success: true, refunds });
  } catch (error) {
    next(error);
  }
}

async function refund(request, response, next) {
  try {
    const result = await refundPayment({
      masterUser: request.user,
      paymentId: request.params.paymentId,
      amount: request.body.amount,
      reason: request.body.reason
    });

    response.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function getInvoice(request, response, next) {
  try {
    const query = { order: request.params.orderId };
    if (request.user.role !== "master") {
      query.user = request.user._id;
    }

    const invoice = await Invoice.findOne(query)
      .populate("order", "total status paymentStatus createdAt")
      .populate("payment", "status method gatewayPaymentId");

    if (!invoice) {
      return response.status(404).json({ success: false, message: "Invoice not found" });
    }

    return response.json({ success: true, invoice });
  } catch (error) {
    return next(error);
  }
}

async function webhook(request, response, next) {
  try {
    const result = await processRazorpayWebhook({
      rawBody: request.body,
      signature: request.headers["x-razorpay-signature"],
      eventId: request.headers["x-razorpay-event-id"]
    });

    response.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getInvoice,
  listPayments,
  listRefunds,
  listTransactions,
  refund,
  retry,
  verify,
  webhook
};
