const mongoose = require("mongoose");
const User = require("../models/User");

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  await User.collection.dropIndex("email_1").catch((error) => {
    if (error.codeName !== "IndexNotFound" && error.code !== 27) {
      console.warn("Could not remove old email uniqueness rule", error.message);
    }
  });
  console.log("MongoDB connected");
}

module.exports = connectDatabase;
