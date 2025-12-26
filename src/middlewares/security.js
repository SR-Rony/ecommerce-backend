const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const { cfg } = require('../config/env');

function applySecurity(app) {
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: true, limit: '200kb' }));
  app.use(cookieParser());

  const allowlist = new Set(cfg.corsOrigins);
  console.log("CORS Allowlist:", allowlist);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowlist.has(origin)) return callback(null, true);
        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
      allowedHeaders: ["Content-Type","Authorization"]
    })
  );

  app.use(helmet());
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(compression());

  // Rate limiting
  app.use(rateLimit({
    windowMs: 15*60*1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  }));

  // Stricter limit for auth endpoints
  app.use('/api/auth/login', rateLimit({
    windowMs: 5*60*1000,
    max: 20
  }));
}

module.exports = { applySecurity };
