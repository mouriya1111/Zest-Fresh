const express = require("express");
const multer = require("multer");
const {
  listProducts,
  listProductHome,
  listInventory,
  createProduct,
  updateProduct,
  duplicateProduct,
  archiveProduct,
  deleteProduct,
  uploadProductImage
} = require("../controllers/productController");
const { authenticate, authorize } = require("../middleware/auth");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/", listProducts);
router.get("/home", listProductHome);
router.get("/inventory", authenticate, authorize("master"), listInventory);
router.post("/", authenticate, authorize("master"), createProduct);
router.post("/:id/duplicate", authenticate, authorize("master"), duplicateProduct);
router.patch("/:id/archive", authenticate, authorize("master"), archiveProduct);
router.patch("/:id", authenticate, authorize("master"), updateProduct);
router.delete("/:id", authenticate, authorize("master"), deleteProduct);
router.post("/:id/image", authenticate, authorize("master"), upload.single("image"), uploadProductImage);

module.exports = router;
