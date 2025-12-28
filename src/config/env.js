const { z } = require("zod");
require("dotenv").config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SERVER_PORT: z.coerce.number().positive().default(4000),

  // comma separated URLs
  CLIENT_URL: z
    .string()
    .transform((val) => val.split(",").map((url) => url.trim()))
    .refine(
      (urls) => urls.every((url) => /^https?:\/\/.+/.test(url)),
      { message: "CLIENT_URL must contain valid URLs" }
    ),
}).passthrough();

let cfg;

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  cfg = parsed.data;

  // 🔥 Already array, perfect for CORS
  cfg.corsOrigins = cfg.CLIENT_URL;

  return cfg;
}

function getCfg() {
  if (!cfg) return validateEnv();
  return cfg;
}

module.exports = { validateEnv, cfg: getCfg() };
