const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppMetric = require("../models/AppMetric");

const onlineUserSockets = new Map();

function todayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

async function markDailyActive(userId) {
  await AppMetric.updateOne(
    { date: todayStart() },
    {
      $addToSet: { activeUserIds: userId },
      $setOnInsert: { downloads: 0, newRegistrations: 0 }
    },
    { upsert: true }
  ).catch(() => null);

  const metric = await AppMetric.findOne({ date: todayStart() }).catch(() => null);
  if (metric?.activeUserIds) {
    metric.dailyActiveUsers = metric.activeUserIds.length;
    await metric.save();
  }
}

function emitPresence(io) {
  io.to("masters").emit("presence:update", {
    onlineUsers: onlineUserSockets.size,
    userIds: Array.from(onlineUserSockets.keys())
  });
}

function registerPresence(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Missing socket token"));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub);

      if (!user) {
        return next(new Error("Invalid socket user"));
      }

      socket.user = user;
      return next();
    } catch (error) {
      return next(error);
    }
  });

  io.on("connection", async (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    socket.join(`user:${userId}`);

    if (user.role === "master") {
      socket.join("masters");
    } else {
      const sockets = onlineUserSockets.get(userId) || new Set();
      sockets.add(socket.id);
      onlineUserSockets.set(userId, sockets);
      await User.updateOne({ _id: user._id }, { isOnline: true, lastActiveAt: new Date() });
      await markDailyActive(user._id);
      emitPresence(io);
    }

    socket.on("heartbeat", async () => {
      await User.updateOne({ _id: user._id }, { lastActiveAt: new Date(), lastSeenAt: new Date() });
    });

    socket.on("disconnect", async () => {
      if (user.role === "master") {
        return;
      }

      const sockets = onlineUserSockets.get(userId);
      sockets?.delete(socket.id);

      if (!sockets || sockets.size === 0) {
        onlineUserSockets.delete(userId);
        await User.updateOne({ _id: user._id }, { isOnline: false, lastSeenAt: new Date() });
      }

      emitPresence(io);
    });
  });
}

module.exports = registerPresence;
