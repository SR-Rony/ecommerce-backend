const { z } = require("zod");
require("dotenv").config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    SERVER_PORT: z.coerce.number().positive().default(4000),

    MONGODB_URL: z
      .string()
      .min(1, "MONGODB_URL is required")
      .refine(
        (url) => /^mongodb(\+srv)?:\/\//i.test(url.trim()),
        "MONGODB_URL must start with mongodb:// or mongodb+srv://"
      ),

    // comma separated origins (e.g. http://localhost:3000,https://app.example.com)
    CLIENT_URL: z
      .string()
      .transform((val) => val.split(",").map((url) => url.trim()).filter(Boolean))
      .refine((urls) => urls.length > 0, { message: "CLIENT_URL must list at least one origin" })
      .refine(
        (urls) => urls.every((url) => /^https?:\/\/.+/.test(url)),
        { message: "CLIENT_URL must contain valid http(s) URLs" }
      ),

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
  cfg.corsOrigins = cfg.CLIENT_URL;

  return cfg;
}

function getCfg() {
  if (!cfg) return validateEnv();
  return cfg;
}

module.exports = { validateEnv, cfg: getCfg() };
