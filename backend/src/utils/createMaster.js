require("dotenv").config();

const connectDatabase = require("../config/db");
const User = require("../models/User");

async function createMaster() {
  const [, , email, password, name = "Zest Fresh Owner"] = process.argv;

  if (!email || !password) {
    throw new Error("Usage: node src/utils/createMaster.js owner@example.com password \"Owner Name\"");
  }

  await connectDatabase();

  const passwordHash = await User.hashPassword(password);
  const master = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email: email.toLowerCase(), passwordHash, role: "master" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Master user ready: ${master.email}`);
  process.exit(0);
}

createMaster().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
