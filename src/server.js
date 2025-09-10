require("dotenv").config();
const { validateEnv, cfg } = require("./config/env");
const app = require("./app");
const connectDB = require("./config/db");

// ✅ validate environment first (fail fast if invalid)
validateEnv();

const startServer = async (port) => {
  const server = app.listen(port, async () => {
    console.log(`✅ Server is running at http://localhost:${port}`);

    try {
      await connectDB();
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err.message);
      process.exit(1); // exit if DB fails
    }
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`⚠️ Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1); // retry with next port
    } else {
      throw err;
    }
  });
};

// Start with env port
startServer(cfg.SERVER_PORT);
