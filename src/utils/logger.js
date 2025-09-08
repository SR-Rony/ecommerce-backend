const pino = require('pino');
const pinoHttp = require('pino-http');

let _logger;

function appLogger() {
  if (!_logger) _logger = pino({ level: process.env.LOG_LEVEL || 'info' });
  return _logger;
}

function httpLogger() {
  return pinoHttp({ logger: appLogger() });
}

module.exports = { appLogger, httpLogger };
