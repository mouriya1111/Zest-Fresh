const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticate(request, response, next) {
  const header = request.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return response.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      return response.status(401).json({ message: "Invalid session" });
    }

    request.user = user;
    return next();
  } catch (error) {
    return response.status(401).json({ message: "Invalid or expired token" });
  }
}

function authorize(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return response.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

module.exports = { authenticate, authorize };