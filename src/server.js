
require("dotenv").config();
const { validateEnv, cfg } = require("./config/env");
const app = require("./app");
const connectDB = require("./config/db");

// ✅ validate environment first (fail fast if invalid)
validateEnv();

app.listen(cfg.SERVER_PORT, async () => {
  console.log(`✅ Server is running at http://localhost:${cfg.SERVER_PORT}`);

  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // exit if DB fails
  }
});
