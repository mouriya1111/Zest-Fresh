const REQUIRED_PRODUCTION_VALUES = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CORS_ORIGIN",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET"
];

function missing(name) {
  const value = process.env[name]?.trim();
  return !value || value.includes("replace-with") || value.includes("replace_with");
}

function validateOtpProvider(errors) {
  const provider = process.env.OTP_SMS_PROVIDER?.trim().toLowerCase();

  if (!provider) {
    errors.push("OTP_SMS_PROVIDER must be fast2sms or twilio");
    return;
  }

  if (provider === "fast2sms" && missing("FAST2SMS_API_KEY")) {
    errors.push("FAST2SMS_API_KEY is required when OTP_SMS_PROVIDER=fast2sms");
  } else if (provider === "twilio") {
    for (const name of ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"]) {
      if (missing(name)) errors.push(`${name} is required when OTP_SMS_PROVIDER=twilio`);
    }
  } else if (!["fast2sms", "twilio"].includes(provider)) {
    errors.push("OTP_SMS_PROVIDER must be fast2sms or twilio");
  }
}

function validateEnvironment() {
  if (process.env.NODE_ENV !== "production") return;

  const errors = REQUIRED_PRODUCTION_VALUES.filter(missing).map((name) => `${name} is required`);
  const jwtSecret = process.env.JWT_SECRET?.trim() || "";
  const corsOrigins = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean) || [];

  if (jwtSecret.length < 32) errors.push("JWT_SECRET must contain at least 32 characters");
  if (!corsOrigins.length || corsOrigins.includes("*")) errors.push("CORS_ORIGIN must list explicit HTTPS origins");
  if (corsOrigins.some((origin) => !origin.startsWith("https://"))) errors.push("Every CORS_ORIGIN must use HTTPS");
  if (process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")) errors.push("RAZORPAY_KEY_ID must be a live key in production");

  validateOtpProvider(errors);

  if (errors.length) {
    throw new Error(`Invalid production configuration:\n- ${errors.join("\n- ")}`);
  }
}

module.exports = validateEnvironment;
