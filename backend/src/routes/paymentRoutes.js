const express = require("express");
const {
  createOrder,
  getInvoice,
  listPayments,
  listRefunds,
  listTransactions,
  refund,
  retry,
  verify,
  webhook
} = require("../controllers/paymentController");
const { authenticate, authorize } = require("../middleware/auth");

const paymentRoutes = express.Router();
const paymentWebhookRoutes = express.Router();

paymentWebhookRoutes.post("/razorpay", express.raw({ type: "application/json" }), webhook);

paymentRoutes.use(authenticate);
paymentRoutes.post("/create-order", authorize("user"), createOrder);
paymentRoutes.post("/verify", authorize("user"), verify);
paymentRoutes.post("/retry/:orderId", authorize("user"), retry);
paymentRoutes.get("/", listPayments);
paymentRoutes.get("/transactions", listTransactions);
paymentRoutes.get("/refunds", authorize("master"), listRefunds);
paymentRoutes.post("/:paymentId/refund", authorize("master"), refund);
paymentRoutes.get("/invoices/:orderId", getInvoice);

module.exports = { paymentRoutes, paymentWebhookRoutes };
