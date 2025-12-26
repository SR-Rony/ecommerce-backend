const { z } = require("zod");
require("dotenv").config();

// Define schema
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    SERVER_PORT: z.coerce.number().positive().default(4000),

    MONGODB_URL: z.string().url(),

    JWT_ACTIVATION_KEY: z.string().min(16),
    JWT_ACCESS_KEY: z.string().min(32),
    JWT_REFRESH_KEY: z.string().min(32),
    JWT_RESET_PASSWORD_KEY: z.string().min(16),

    SMTP_USERNAME: z.string().email(),
    SMTP_PASSWORD: z.string().min(8),

    // CORS origins (comma separated)
    CLIENT_URLS: z.string().min(1), 

    CLOUDINARY_NAME: z.string(),
    CLOUDINARY_API: z.string(),
    CLOUDINARY_SECRET_KEY: z.string(),
  })
  .passthrough();

let cfg;

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  cfg = parsed.data;

  // ✅ Split CLIENT_URLS by comma and trim spaces
  cfg.corsOrigins = cfg.CLIENT_URLS.split(",").map(url => url.trim());

  return cfg;
}

function getCfg() {
  if (!cfg) {
    return validateEnv();
  }
  return cfg;
}

module.exports = { validateEnv, cfg: getCfg() };
