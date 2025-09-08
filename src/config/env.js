// src/config/env.js
const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SERVER_PORT: z.coerce.number().positive().default(4000),

  // Mongo
  MONGODB_URL: z.string().url({ message: "MONGODB_URL must be a valid MongoDB URI" }),

  // JWT
  JWT_ACTIVATION_KEY: z.string().min(16),
  JWT_ACCESS_KEY: z.string().min(32),
  JWT_REFRESH_KEY: z.string().min(32),
  JWT_RESET_PASSWORD_KEY: z.string().min(16),

  // SMTP
  SMTP_USERNAME: z.string().email(),
  SMTP_PASSWORD: z.string().min(8),

  // Client
  CLIENT_URL: z.string().url(),

  // Cloudinary
  CLOUDINARY_NAME: z.string(),
  CLOUDINARY_API: z.string(),
  CLOUDINARY_SECRET_KEY: z.string(),
});

let cfg;

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.format());
    throw new Error("Environment validation failed");
  }
  cfg = parsed.data;
  return cfg;
}

function getCfg() {
  if (!cfg) {
    return validateEnv();
  }
  return cfg;
}

module.exports = { validateEnv, cfg: getCfg() };
