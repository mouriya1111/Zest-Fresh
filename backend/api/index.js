require("dotenv").config();

const createApp = require("../src/app");
const connectDatabase = require("../src/config/db");
const validateEnvironment = require("../src/config/validateEnv");

let app;
let databasePromise;

function getApp() {
  if (!app) {
    validateEnvironment();
    app = createApp();
  }

  return app;
}

async function ensureDatabase() {
  if (!databasePromise) {
    databasePromise = connectDatabase();
  }

  return databasePromise;
}

module.exports = async function handler(request, response) {
  await ensureDatabase();
  return getApp()(request, response);
};
