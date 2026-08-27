const express = require("express");
const { overview, sales, recordDownload } = require("../controllers/analyticsController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/download", recordDownload);
router.get("/overview", authenticate, authorize("master"), overview);
router.get("/sales", authenticate, authorize("master"), sales);

module.exports = router;
