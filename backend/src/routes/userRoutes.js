const express = require("express");
const { addAddress, listAddresses, toggleFavorite } = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, authorize("user"));
router.get("/addresses", listAddresses);
router.post("/addresses", addAddress);
router.post("/favorites/:productId", toggleFavorite);

module.exports = router;
