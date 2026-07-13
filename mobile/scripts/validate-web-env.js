const fs = require("fs");
const path = require("path");

function readLocalApiUrl() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return "";

  const line = fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith("EXPO_PUBLIC_API_URL="));

  return line ? line.slice(line.indexOf("=") + 1).trim() : "";
}

const apiUrl = process.env.EXPO_PUBLIC_API_URL || readLocalApiUrl();

if (!apiUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is required. Add it to Vercel before deploying.");
}

const parsed = new URL(apiUrl);
const isLocal = ["localhost", "127.0.0.1", "10.0.2.2"].includes(parsed.hostname) || /^192\.168\./.test(parsed.hostname);

if (process.env.VERCEL && (parsed.protocol !== "https:" || isLocal)) {
  throw new Error("Vercel requires EXPO_PUBLIC_API_URL to be a public HTTPS backend URL.");
}

console.log(`Web API target validated: ${parsed.origin}`);
