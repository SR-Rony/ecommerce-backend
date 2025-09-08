const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');
const route = require("./routers/route");
const { errorRespons } = require('./controller/respones.controller');
const { applySecurity } = require('./middlewares/security');
const { httpLogger } = require('./utils/logger');

const app = express();

// Apply logging first
app.use(morgan("dev"));

// Apply all security middlewares (CORS, Helmet, Rate-limit, Sanitizers, etc.)
applySecurity(app);

// API routes
app.use(route);

// http logger
app.use(httpLogger());

// Root route
app.get("/", (req, res) => {
    res.status(200).send('Welcome to my server');
});

// 404 handler
app.use((req, res, next) => {
    next(createError(404, "404 page not found"));
});

// Global error handler
app.use((err, req, res, next) => {
    return errorRespons(res, {
        message: err.message,
        statusCode: err.status || 500
    });
});

module.exports = app;
