const express = require("express");
const {
  createOrder,
  listMyOrders,
  listAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  trackOrder
} = require("../controllers/orderController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
router.post("/", authorize("user"), createOrder);
router.get("/mine", authorize("user"), listMyOrders);
router.get("/all", authorize("master"), listAllOrders);
router.get("/:id/track", authorize("user"), trackOrder);
router.patch("/:id/status", authorize("master"), updateOrderStatus);
router.patch("/:id/payment", authorize("master"), updatePaymentStatus);

module.exports = router;
