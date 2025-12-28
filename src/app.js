const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");

const { errorRespons } = require("./controller/respones.controller");
const { applySecurity } = require("./middlewares/security");
const { httpLogger } = require("./utils/logger");
const corsMiddleware = require("./middlewares/cors");
const { validateEnv, cfg } = require("./config/env"); // ✅ cfg is object
const route = require("./routers/route");

const app = express();

// 🔐 Validate ENV
validateEnv();

// Logging
app.use(morgan("dev"));

// 🔥 CORS middleware (all normal requests)
app.use(corsMiddleware);

// Apply security headers etc.
applySecurity(app);

// Body parser
app.use(express.json());

// API routes (wrap async with try/catch in route files!)
app.use(route);

// http logger
app.use(httpLogger());

// OTP store
global.forgotPasswordStore = new Map();

// Root route
app.get("/", (req, res) => {
  res.status(200).send("Welcome to my server");
});

// 404 handler
app.use((req, res, next) => {
  next(createError(404, "404 page not found"));
});

// 🔥 Global error handler (CORS safe)
app.use((err, req, res, next) => {
  // Force CORS headers even on errors
  res.header("Access-Control-Allow-Origin", cfg.corsOrigins.join(","));
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

  console.error(err); // full debug
  return errorRespons(res, {
    message: err.message,
    statusCode: err.status || 500,
  });
});

module.exports = app;
