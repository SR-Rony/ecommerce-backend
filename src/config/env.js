const { z } = require("zod");
require("dotenv").config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development','production','test']).default('development'),
  SERVER_PORT: z.coerce.number().positive().default(4000),
  CLIENT_URL: z.string().url(), // single URL
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

  // Convert single URL to array for CORS
  cfg.corsOrigins = [cfg.CLIENT_URL];

  return cfg;
}

function getCfg() {
  if (!cfg) return validateEnv();
  return cfg;
}

module.exports = { validateEnv, cfg: getCfg() };
