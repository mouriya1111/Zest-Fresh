const express = require("express");
const multer = require("multer");
const {
  listProducts,
  listInventory,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} = require("../controllers/productController");
const { authenticate, authorize } = require("../middleware/auth");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/", listProducts);
router.get("/inventory", authenticate, authorize("master"), listInventory);
router.post("/", authenticate, authorize("master"), createProduct);
router.patch("/:id", authenticate, authorize("master"), updateProduct);
router.delete("/:id", authenticate, authorize("master"), deleteProduct);
router.post("/:id/image", authenticate, authorize("master"), upload.single("image"), uploadProductImage);

module.exports = router;
