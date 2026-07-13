const User = require("../models/User");
const RegistrationOtp = require("../models/RegistrationOtp");
const AppMetric = require("../models/AppMetric");
const { signToken } = require("../utils/jwt");
const crypto = require("crypto");

function todayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

async function incrementRegistrationMetric() {
  await AppMetric.updateOne(
    { date: todayStart() },
    { $inc: { newRegistrations: 1 }, $setOnInsert: { downloads: 0, dailyActiveUsers: 0 } },
    { upsert: true }
  );
}

function normalizeEmail(email) {
  return email ? email.trim().toLowerCase() : undefined;
}

function normalizePhone(phone) {
  return phone ? phone.replace(/\D/g, "") : undefined;
}

function hashOtp(otp) {
  return crypto
    .createHash("sha256")
    .update(`${otp}:${process.env.JWT_SECRET || "zest-fresh-dev-secret"}`)
    .digest("hex");
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function isValidEmail(email) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return !phone || /^[6-9]\d{9}$/.test(phone);
}

function responseBody(success, message, extra = {}) {
  return { success, message, ...extra };
}

async function sendRegistrationOtp({ email, phone, otp }) {
  const provider = process.env.OTP_SMS_PROVIDER?.toLowerCase();

  if (phone && provider === "fast2sms" && process.env.FAST2SMS_API_KEY) {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: process.env.FAST2SMS_ROUTE || "otp",
        variables_values: otp,
        numbers: phone
      })
    });

    if (!response.ok) {
      const error = new Error("Could not send OTP to mobile number");
      error.statusCode = 502;
      throw error;
    }

    return;
  }

  if (phone && provider === "twilio" && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        From: process.env.TWILIO_FROM_NUMBER,
        To: `${process.env.TWILIO_COUNTRY_CODE || "+91"}${phone}`,
        Body: `Your Zest Fresh verification OTP is ${otp}. It expires in 5 minutes.`
      })
    });

    if (!response.ok) {
      const error = new Error("Could not send OTP to mobile number");
      error.statusCode = 502;
      throw error;
    }

    return;
  }

  // Development fallback: no real SMS/email gateway is configured.
  console.log(`Registration OTP for ${phone || email}: ${otp}`);
}

async function findExistingUser({ email, phone }) {
  const conditions = [];
  if (phone) conditions.push({ phone });
  if (email) conditions.push({ email });
  return conditions.length ? User.findOne({ $or: conditions }) : null;
}

async function requestRegistrationOtp(request, response, next) {
  try {
    const name = request.body.name?.trim();
    const email = normalizeEmail(request.body.email);
    const phone = normalizePhone(request.body.phone);
    const { password } = request.body;

    if (!name || !password || (!email && !phone)) {
      return response.status(400).json(responseBody(false, "Name, password, and email or mobile number are required"));
    }

    if (!isValidEmail(email)) {
      return response.status(400).json(responseBody(false, "Enter a valid email address"));
    }

    if (!isValidPhone(phone)) {
      return response.status(400).json(responseBody(false, "Enter a valid 10 digit mobile number"));
    }

    const existingUser = await findExistingUser({ email, phone });

    if (existingUser?.phone === phone && existingUser.name?.trim().toLowerCase() !== name.toLowerCase()) {
      return response.status(409).json(responseBody(false, "This mobile number is already linked to another account."));
    }

    if (existingUser?.phone === phone) {
      return response.status(409).json(responseBody(false, "Mobile number already taken."));
    }

    if (existingUser?.email === email) {
      return response.status(409).json(responseBody(false, "Email already registered."));
    }

    const otp = generateOtp();
    const passwordHash = await User.hashPassword(password);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await RegistrationOtp.findOneAndUpdate(
      { $or: [{ phone }, { email }].filter((condition) => Object.values(condition)[0]) },
      {
        name,
        email,
        phone,
        passwordHash,
        otpHash: hashOtp(otp),
        attempts: 0,
        expiresAt,
        verifiedAt: null
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendRegistrationOtp({ email, phone, otp });

    return response.status(200).json(responseBody(true, "OTP sent successfully", {
      expiresInSeconds: 300,
      ...(process.env.NODE_ENV === "production" ? {} : { devOtp: otp })
    }));
  } catch (error) {
    return next(error);
  }
}

async function verifyRegistrationOtp(request, response, next) {
  try {
    const email = normalizeEmail(request.body.email);
    const phone = normalizePhone(request.body.phone);
    const otp = request.body.otp?.trim();

    if (!otp || (!email && !phone)) {
      return response.status(400).json(responseBody(false, "OTP and email or mobile number are required"));
    }

    const pending = await RegistrationOtp.findOne({
      $or: [{ phone }, { email }].filter((condition) => Object.values(condition)[0])
    });

    if (!pending) {
      return response.status(404).json(responseBody(false, "OTP expired"));
    }

    if (pending.expiresAt < new Date()) {
      await RegistrationOtp.deleteOne({ _id: pending._id });
      return response.status(410).json(responseBody(false, "OTP expired"));
    }

    if (pending.attempts >= 5) {
      await RegistrationOtp.deleteOne({ _id: pending._id });
      return response.status(429).json(responseBody(false, "Too many incorrect OTP attempts. Request a new OTP."));
    }

    if (pending.otpHash !== hashOtp(otp)) {
      pending.attempts += 1;
      await pending.save();
      return response.status(401).json(responseBody(false, "Invalid OTP"));
    }

    const existingUser = await findExistingUser({ email: pending.email, phone: pending.phone });
    if (existingUser?.phone === pending.phone) {
      return response.status(409).json(responseBody(false, "Mobile number already taken."));
    }
    if (existingUser?.email === pending.email) {
      return response.status(409).json(responseBody(false, "Email already registered."));
    }

    const user = await User.create({
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      passwordHash: pending.passwordHash,
      role: "user"
    });

    await RegistrationOtp.deleteMany({
      $or: [{ phone: pending.phone }, { email: pending.email }].filter((condition) => Object.values(condition)[0])
    });
    await incrementRegistrationMetric();

    return response.status(201).json(responseBody(true, "Account verified successfully.", {
      user,
      redirectTo: "Login"
    }));
  } catch (error) {
    return next(error);
  }
}

async function resendRegistrationOtp(request, response, next) {
  try {
    const email = normalizeEmail(request.body.email);
    const phone = normalizePhone(request.body.phone);

    const pending = await RegistrationOtp.findOne({
      $or: [{ phone }, { email }].filter((condition) => Object.values(condition)[0])
    });

    if (!pending || pending.expiresAt < new Date()) {
      if (pending) await RegistrationOtp.deleteOne({ _id: pending._id });
      return response.status(410).json(responseBody(false, "OTP expired"));
    }

    const otp = generateOtp();
    pending.otpHash = hashOtp(otp);
    pending.attempts = 0;
    pending.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await pending.save();

    await sendRegistrationOtp({ email: pending.email, phone: pending.phone, otp });

    return response.status(200).json(responseBody(true, "OTP sent successfully", {
      expiresInSeconds: 300,
      ...(process.env.NODE_ENV === "production" ? {} : { devOtp: otp })
    }));
  } catch (error) {
    return next(error);
  }
}

async function register(request, response, next) {
  return requestRegistrationOtp(request, response, next);
}

async function legacyRegister(request, response, next) {
  try {
    const { name, email, phone, password } = request.body;
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: "user"
    });

    await incrementRegistrationMetric();

    return response.status(201).json({
      token: signToken(user),
      user,
      redirectTo: "UserHome"
    });
  } catch (error) {
    return next(error);
  }
}

async function login(request, response, next) {
  try {
    const identifier = request.body.identifier?.trim();
    const { password, fcmToken } = request.body;

    if (!identifier || !password) {
      return response.status(400).json(responseBody(false, "Identifier and password are required"));
    }

    const email = normalizeEmail(identifier);
    const phone = normalizePhone(identifier);
    const identifiers = [{ email }];

    if (phone) {
      identifiers.push({ phone });
    }

    const user = await User.findOne({ $or: identifiers });

    if (!user) {
      return response.status(404).json(responseBody(false, "User not found"));
    }

    if (!(await user.comparePassword(password))) {
      return response.status(401).json(responseBody(false, "Wrong password"));
    }

    if (fcmToken && !user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
    }

    user.lastActiveAt = new Date();
    await user.save();

    return response.json({
      success: true,
      message: "Login successful",
      token: signToken(user),
      user,
      redirectTo: user.role === "master" ? "MasterDashboard" : "UserHome"
    });
  } catch (error) {
    return next(error);
  }
}

async function me(request, response) {
  response.json({ user: request.user });
}

module.exports = {
  register,
  requestRegistrationOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  me
};
