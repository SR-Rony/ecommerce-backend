const cors = require("cors");
const { cfg } = require("../config/env"); // cfg is object now

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // server-to-server requests

    if (cfg.corsOrigins.includes(origin)) { // ✅ object access
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // cookie support
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

module.exports = cors(corsOptions);
