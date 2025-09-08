const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const express = require('express');
const { cfg } = require('../config/env');

function applySecurity(app) {
  app.disable('x-powered-by');

  // Trust proxy if behind reverse proxy (e.g., Vercel, Nginx)
  app.set('trust proxy', 1);

  // Body parsers
  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: true, limit: '200kb' }));
  app.use(cookieParser());

  // CORS with allowlist
  const allowlist = new Set(cfg.corsOrigins);
  app.use(cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // non-browser clients
      if (allowlist.size === 0 || allowlist.has(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Helmet (with basic CSP example commented)
  app.use(helmet());
  // app.use(helmet.contentSecurityPolicy({
  //   useDefaults: true,
  //   directives: {
  //     "img-src": ["'self'", "data:", "https:"],
  //   },
  // }));

  // Sanitizers
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(compression());

  // Global rate limit
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // Stricter limit for auth endpoints
  app.use(['/api/auth/login', '/api/auth/refresh-token'], rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20,
  }));
}

module.exports = { applySecurity };
