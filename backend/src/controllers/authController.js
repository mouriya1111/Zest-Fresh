const User = require("../models/User");
const AppMetric = require("../models/AppMetric");
const { signToken } = require("../utils/jwt");

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

async function register(request, response, next) {
  try {
    const { name, email, phone, password } = request.body;
    const normalizedPhone = phone?.replace(/\D/g, "");
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !password || !normalizedPhone) {
      return response.status(400).json({ message: "Name, phone number, and password are required" });
    }

    const existingPhoneUser = await User.findOne({ phone: normalizedPhone }).select("_id");
    if (existingPhoneUser) {
      return response.status(409).json({ message: "This phone number is already registered" });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail || undefined,
      phone: normalizedPhone,
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
    const { identifier, password, fcmToken } = request.body;

    if (!identifier || !password) {
      return response.status(400).json({ message: "Identifier and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }]
    });

    if (!user || !(await user.comparePassword(password))) {
      return response.status(401).json({ message: "Invalid login credentials" });
    }

    if (fcmToken && !user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
    }

    user.lastActiveAt = new Date();
    await user.save();

    return response.json({
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

module.exports = { register, login, me };
