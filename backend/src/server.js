require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const createApp = require("./app");
const connectDatabase = require("./config/db");
const registerPresence = require("./socket/presence");

const PORT = process.env.PORT || 5000;
const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true
  }
});

app.set("io", io);
registerPresence(io);

connectDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Zest Fresh API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
