const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const AppMetric = require("../models/AppMetric");
const Payment = require("../models/Payment");
const Refund = require("../models/Refund");

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function overview(_request, response, next) {
  try {
    const [
      totalUsers,
      onlineUsers,
      metrics,
      paidOrders,
      pendingPayments,
      lowStockProducts,
      paymentStats,
      failedTransactions,
      refunds
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", isOnline: true }),
      AppMetric.find({ date: { $gte: daysAgo(30) } }).sort({ date: 1 }),
      Order.find({ paymentStatus: "Paid", paidAt: { $gte: daysAgo(30) } }),
      Order.find({
        paymentStatus: { $in: ["Pending", null] },
        status: { $nin: ["Cancelled"] }
      }),
      Product.find().then((products) => products.filter((product) => product.isLowStock))
      ,
      Payment.aggregate([
        { $match: { createdAt: { $gte: daysAgo(30) } } },
        { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } }
      ]),
      Payment.countDocuments({ status: "Failed", createdAt: { $gte: daysAgo(30) } }),
      Refund.aggregate([
        { $match: { createdAt: { $gte: daysAgo(30) } } },
        { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } }
      ])
    ]);

    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
    const pendingPaymentAmount = pendingPayments.reduce((sum, order) => sum + order.total, 0);
    const downloads = metrics.reduce((sum, metric) => sum + metric.downloads, 0);
    const dailyActiveUsers = metrics.at(-1)?.dailyActiveUsers || 0;
    const newRegistrations = metrics.at(-1)?.newRegistrations || 0;
    const paidPaymentStats = paymentStats.find((item) => item._id === "Paid");
    const createdPaymentCount = paymentStats.reduce((sum, item) => sum + item.count, 0);
    const successfulPaymentCount = paidPaymentStats?.count || 0;
    const paymentSuccessRate = createdPaymentCount
      ? Math.round((successfulPaymentCount / createdPaymentCount) * 1000) / 10
      : 0;
    const refundAmount = refunds.reduce((sum, item) => sum + item.amount, 0);
    const refundCount = refunds.reduce((sum, item) => sum + item.count, 0);

    response.json({
      totalUsers,
      downloads,
      onlineUsers,
      dailyActiveUsers,
      newRegistrations,
      totalRevenue,
      onlineRevenue: paidPaymentStats?.amount || 0,
      pendingPaymentCount: pendingPayments.length,
      pendingPaymentAmount,
      paymentSuccessRate,
      failedTransactions,
      refundCount,
      refundAmount,
      lowStockProducts
    });
  } catch (error) {
    next(error);
  }
}

async function sales(_request, response, next) {
  try {
    const since = daysAgo(180);
    const paidMatch = { paymentStatus: "Paid", paidAt: { $gte: since } };

    const [dailySales, monthlySales, bestSellers, userGrowth, paymentMethods, refunds] = await Promise.all([
      Order.aggregate([
        { $match: paidMatch },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: paidMatch },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$paidAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: paidMatch },
        { $unwind: "$items" },
        { $group: { _id: "$items.product", name: { $first: "$items.name" }, quantity: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } } } },
        { $sort: { quantity: -1 } },
        { $limit: 10 }
      ]),
      User.aggregate([
        { $match: { role: "user", createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, users: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Payment.aggregate([
        { $match: { status: { $in: ["Paid", "Refunded", "Partially Refunded"] }, createdAt: { $gte: since } } },
        { $group: { _id: "$method", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
        { $sort: { amount: -1 } }
      ]),
      Refund.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: "$amount" }, refunds: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    response.json({ dailySales, monthlySales, bestSellers, userGrowth, paymentMethods, refunds });
  } catch (error) {
    next(error);
  }
}

async function recordDownload(_request, response, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await AppMetric.updateOne(
      { date: today },
      { $inc: { downloads: 1 }, $setOnInsert: { dailyActiveUsers: 0, newRegistrations: 0 } },
      { upsert: true }
    );

    response.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = { overview, sales, recordDownload };
