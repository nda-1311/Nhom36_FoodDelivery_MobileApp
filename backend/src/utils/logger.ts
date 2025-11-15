import winston from 'winston';

/**
 * Logger configuration using Winston
 *
 * Provides structured logging with different levels and outputs.
 * Supports both console and file logging with proper formatting.
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),

  // File transport for combined logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

/**
 * Stream object for Morgan HTTP request logging
 */
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

/**
 * Logger utility functions
 */
const loggerUtils = {
  /**
   * Log an error with stack trace
   */
  logError: (error: Error, context?: string) => {
    const message = context ? `${context}: ${error.message}` : error.message;

    logger.error(message, {
      stack: error.stack,
      context,
    });
  },

  /**
   * Log API request/response
   */
  logApiCall: (
    method: string,
    url: string,
    statusCode: number,
    duration: number
  ) => {
    logger.http(`${method} ${url} ${statusCode} - ${duration}ms`);
  },

  /**
   * Log database operation
   */
  logDbOperation: (operation: string, table: string, duration?: number) => {
    const message = duration
      ? `DB ${operation} on ${table} - ${duration}ms`
      : `DB ${operation} on ${table}`;

    logger.debug(message);
  },

  /**
   * Log authentication event
   */
  logAuth: (event: string, userId?: string, email?: string) => {
    logger.info(`Auth: ${event}`, { userId, email });
  },

  /**
   * Log business logic event
   */
  logBusiness: (event: string, data?: any) => {
    logger.info(`Business: ${event}`, data);
  },

  /**
   * Log WebSocket event
   */
  logSocket: (event: string, socketId: string, data?: any) => {
    logger.debug(`Socket: ${event}`, { socketId, ...data });
  },
};

export { logger, loggerUtils, stream };
