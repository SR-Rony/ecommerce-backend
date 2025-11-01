const { z } = require("zod");
require("dotenv").config();

// Define schema
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    SERVER_PORT: z.coerce.number().positive().default(4000),

    // Mongo
    MONGODB_URL: z.string().url({ message: "MONGODB_URL must be a valid MongoDB URI" }),

    // JWT
    JWT_ACTIVATION_KEY: z.string().min(16, "JWT_ACTIVATION_KEY must be at least 16 characters"),
    JWT_ACCESS_KEY: z.string().min(32, "JWT_ACCESS_KEY must be at least 32 characters"),
    JWT_REFRESH_KEY: z.string().min(32, "JWT_REFRESH_KEY must be at least 32 characters"),
    JWT_RESET_PASSWORD_KEY: z.string().min(16, "JWT_RESET_PASSWORD_KEY must be at least 16 characters"),

    // SMTP
    SMTP_USERNAME: z.string().email("SMTP_USERNAME must be a valid email"),
    SMTP_PASSWORD: z.string().min(8, "SMTP_PASSWORD must be at least 8 characters"),

    // CORS origins
    ADMIN_DASHBOARD: z.string().url("ADMIN_DASHBOARD must be a valid URL"),
    CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),

    // Cloudinary
    CLOUDINARY_NAME: z.string(),
    CLOUDINARY_API: z.string(),
    CLOUDINARY_SECRET_KEY: z.string(),
  })
  .passthrough(); // 👈 allows extra env vars

let cfg;

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1); // graceful exit
  }

  cfg = parsed.data;

  // ✅ Setup CORS origins
  cfg.corsOrigins = [
    cfg.ADMIN_DASHBOARD,
    cfg.CLIENT_URL,
  ].filter(Boolean);

  return cfg;
}

function getCfg() {
  if (!cfg) {
    return validateEnv();
  }
  return cfg;
}

module.exports = { validateEnv, cfg: getCfg() };
