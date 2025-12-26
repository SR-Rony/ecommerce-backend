const { z } = require("zod");
require("dotenv").config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development','production','test']).default('development'),
  SERVER_PORT: z.coerce.number().positive().default(4000),
  CLIENT_URLS: z.string().min(1),
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

  // Split comma separated URLs
  cfg.corsOrigins = cfg.CLIENT_URLS.split(',').map(url => url.trim());
  return cfg;
}

function getCfg() {
  if (!cfg) return validateEnv();
  return cfg;
}

module.exports = { validateEnv, cfg: getCfg() };
