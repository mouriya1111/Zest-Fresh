const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const { createInvoiceForOrder } = require("../services/invoiceService");

const ACTIVE_STATUSES = ["Pending", "Accepted", "Packed", "Out for Delivery"];

async function createOrder(request, response, next) {
  try {
    const { items, deliveryAddress, paymentMethod } = request.body;

    if (!Array.isArray(items) || items.length === 0) {
      return response.status(400).json({ message: "Order must include at least one item" });
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return response.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (!product.isPurchasable) {
        return response.status(409).json({ message: `${product.name} is currently unavailable` });
      }

      if (product.remainingStock < item.quantity) {
        return response.status(409).json({ message: `${product.name} is out of stock` });
      }

      const orderPrice = product.effectivePrice ?? product.price;
      const lineTotal = orderPrice * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        unit: product.unit,
        quantity: item.quantity,
        price: orderPrice,
        imageUrl: product.imageUrl
      });
    }

    const deliveryFee = subtotal >= 499 ? 0 : 29;
    const order = await Order.create({
      user: request.user._id,
      items: orderItems,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      deliveryAddress,
      paymentMethod,
      paymentStatus: "Pending",
      paymentStatusHistory: [{ status: "Pending", changedBy: request.user._id }],
      statusHistory: [{ status: "Pending", changedBy: request.user._id }]
    });
    const payment = await Payment.create({
      order: order._id,
      user: request.user._id,
      gateway: "cod",
      gatewayOrderId: `cod_${order._id}`,
      amount: order.total,
      amountPaise: Math.round(order.total * 100),
      currency: process.env.PAYMENT_CURRENCY || "INR",
      method: "COD",
      status: "Pending"
    });
    order.payment = payment._id;
    await order.save();
    await Transaction.create({
      order: order._id,
      payment: payment._id,
      user: request.user._id,
      gateway: "cod",
      type: "order_created",
      amount: order.total,
      currency: payment.currency,
      status: "Pending",
      payload: { paymentMethod: "COD" }
    });

    const populatedOrder = await order.populate("user", "name email phone");
    request.app.get("io")?.to("masters").emit("order:new", { order: populatedOrder });

    response.status(201).json({ order: populatedOrder });
  } catch (error) {
    next(error);
  }
}

async function updatePaymentStatus(request, response, next) {
  try {
    const { paymentStatus, paymentReference } = request.body;
    const validStatuses = ["Pending", "Paid", "Failed", "Refunded", "Partially Refunded"];

    if (!validStatuses.includes(paymentStatus)) {
      return response.status(400).json({ message: "Invalid payment status" });
    }

    const order = await Order.findById(request.params.id);

    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    if (paymentStatus === "Paid" && order.paymentMethod === "COD" && order.status !== "Delivered") {
      return response.status(409).json({ message: "COD payment can only be confirmed after delivery" });
    }

    if (paymentStatus === "Refunded" && order.paymentStatus !== "Paid") {
      return response.status(409).json({ message: "Only a paid order can be refunded" });
    }

    order.paymentStatus = paymentStatus;
    order.paymentReference = paymentReference || order.paymentReference;
    order.paidAt = paymentStatus === "Paid" ? new Date() : undefined;
    order.paymentStatusHistory.push({
      status: paymentStatus,
      changedBy: request.user._id,
      reference: paymentReference
    });
    await order.save();
    const payment = await Payment.findById(order.payment);

    if (payment) {
      payment.status = paymentStatus;
      payment.gatewayPaymentId = paymentReference || payment.gatewayPaymentId;
      payment.paidAt = paymentStatus === "Paid" ? new Date() : payment.paidAt;
      payment.verifiedAt = paymentStatus === "Paid" ? new Date() : payment.verifiedAt;
      await payment.save();

      await Transaction.create({
        order: order._id,
        payment: payment._id,
        user: order.user,
        gateway: payment.gateway,
        gatewayPaymentId: payment.gatewayPaymentId,
        type: paymentStatus === "Paid" ? "payment_captured" : "payment_failed",
        amount: order.total,
        currency: payment.currency,
        status: paymentStatus,
        payload: { changedBy: request.user._id, reference: paymentReference }
      });

      if (paymentStatus === "Paid") {
        await createInvoiceForOrder(order, payment, await order.populate("user", "name email phone").then((item) => item.user));
      }
    }

    request.app.get("io")?.to(`user:${order.user}`).emit("order:payment", {
      orderId: order._id,
      paymentStatus: order.paymentStatus
    });
    request.app.get("io")?.to("masters").emit("order:payment", {
      orderId: order._id,
      paymentStatus: order.paymentStatus
    });

    return response.json({ order });
  } catch (error) {
    return next(error);
  }
}

async function listMyOrders(request, response, next) {
  try {
    const orders = await Order.find({ user: request.user._id }).sort({ createdAt: -1 });
    response.json({ orders });
  } catch (error) {
    next(error);
  }
}

async function listAllOrders(request, response, next) {
  try {
    const filter = request.query.status ? { status: request.query.status } : {};
    const orders = await Order.find(filter).populate("user", "name email phone").sort({ createdAt: -1 });
    response.json({ orders });
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(request, response, next) {
  try {
    const { status, rejectedReason } = request.body;
    const validStatuses = ["Pending", "Accepted", "Packed", "Out for Delivery", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return response.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(request.params.id);

    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    if (status === "Accepted" && order.status === "Pending") {
      for (const item of order.items) {
        await Product.updateOne({ _id: item.product }, { $inc: { quantitySold: item.quantity } });
      }
    }

    order.status = status;
    order.rejectedReason = status === "Cancelled" ? rejectedReason : undefined;
    order.statusHistory.push({ status, changedBy: request.user._id });
    await order.save();

    request.app.get("io")?.to(`user:${order.user}`).emit("order:status", {
      orderId: order._id,
      status: order.status
    });

    return response.json({ order });
  } catch (error) {
    return next(error);
  }
}

async function trackOrder(request, response, next) {
  try {
    const order = await Order.findOne({
      _id: request.params.id,
      user: request.user._id,
      status: { $in: ACTIVE_STATUSES.concat(["Delivered", "Cancelled"]) }
    });

    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    return response.json({ order });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  listMyOrders,
  listAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  trackOrder
};
