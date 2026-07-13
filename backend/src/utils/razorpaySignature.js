const crypto = require("crypto");

function hmacSha256(body, secret) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const expected = hmacSha256(`${orderId}|${paymentId}`, process.env.RAZORPAY_KEY_SECRET);
  return safeEqual(expected, signature);
}

function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is required");
  }

  const expected = hmacSha256(rawBody, secret);
  return safeEqual(expected, signature);
}

module.exports = { verifyPaymentSignature, verifyWebhookSignature };
