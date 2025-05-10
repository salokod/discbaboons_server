import pino from 'pino';
import config from '../config/index.js';

const logger = pino({
  level: process.env.LOG_LEVEL || config.logLevel || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export default logger;
