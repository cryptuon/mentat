import winston from 'winston';
import { config } from './config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) =>
      `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`
  )
);

export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

export function createChildLogger(component: string) {
  return logger.child({ component });
}
