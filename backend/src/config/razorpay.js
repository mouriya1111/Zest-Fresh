const Razorpay = require("razorpay");

let razorpayClient = null;

function getRazorpayClient() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (
    !RAZORPAY_KEY_ID ||
    !RAZORPAY_KEY_SECRET ||
    RAZORPAY_KEY_ID.includes("replace") ||
    RAZORPAY_KEY_SECRET.includes("replace")
  ) {
    const error = new Error("Razorpay credentials are not configured");
    error.statusCode = 503;
    throw error;
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
  }

  return razorpayClient;
}

module.exports = { getRazorpayClient };
