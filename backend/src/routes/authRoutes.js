const express = require("express");
const {
  register,
  requestRegistrationOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  me
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/register/request-otp", requestRegistrationOtp);
router.post("/register/verify-otp", verifyRegistrationOtp);
router.post("/resend-otp", resendRegistrationOtp);
router.post("/login", login);
router.get("/me", authenticate, me);

module.exports = router;
