const mongoose = require("mongoose");
const { cfg } = require("./env"); // ✅ load from env.js

const connectDB = async () => {
  try {
    await mongoose.connect(cfg.MONGODB_URL, {
      serverSelectionTimeoutMS: 10000, // avoid infinite wait
    });

    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error.message);
    });
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit if DB connection fails
  }
};

module.exports = connectDB;
