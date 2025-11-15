import { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';

/**
 * Request Logger Middleware
 *
 * Logs HTTP requests using Morgan with custom format.
 * Provides detailed request/response logging for debugging and monitoring.
 */

// Custom token for response time
morgan.token('response-time-colored', (req: Request, res: Response) => {
  const responseTime = parseFloat((res as any).responseTime || '0');

  if (responseTime < 100) {
    return `\x1b[32m${responseTime}ms\x1b[0m`; // Green for fast
  } else if (responseTime < 500) {
    return `\x1b[33m${responseTime}ms\x1b[0m`; // Yellow for moderate
  } else {
    return `\x1b[31m${responseTime}ms\x1b[0m`; // Red for slow
  }
});

// Custom token for status code colors
morgan.token('status-colored', (req: Request, res: Response) => {
  const status = res.statusCode;

  if (status >= 200 && status < 300) {
    return `\x1b[32m${status}\x1b[0m`; // Green for success
  } else if (status >= 300 && status < 400) {
    return `\x1b[36m${status}\x1b[0m`; // Cyan for redirect
  } else if (status >= 400 && status < 500) {
    return `\x1b[33m${status}\x1b[0m`; // Yellow for client error
  } else {
    return `\x1b[31m${status}\x1b[0m`; // Red for server error
  }
});

// Custom token for method colors
morgan.token('method-colored', (req: Request) => {
  const method = req.method;

  switch (method) {
    case 'GET':
      return `\x1b[32m${method}\x1b[0m`; // Green
    case 'POST':
      return `\x1b[33m${method}\x1b[0m`; // Yellow
    case 'PUT':
      return `\x1b[34m${method}\x1b[0m`; // Blue
    case 'PATCH':
      return `\x1b[35m${method}\x1b[0m`; // Magenta
    case 'DELETE':
      return `\x1b[31m${method}\x1b[0m`; // Red
    default:
      return `\x1b[37m${method}\x1b[0m`; // White
  }
});

// Custom format for development
const devFormat =
  ':method-colored :url :status-colored :res[content-length] bytes - :response-time-colored :user-agent';

// Custom format for production
const prodFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Skip logging for health checks and static files
const skip = (req: Request, res: Response): boolean => {
  // Skip health check endpoint
  if (req.url === '/health') return true;

  // Skip static files
  if (req.url.startsWith('/uploads/')) return true;

  // Skip successful requests in production
  if (process.env.NODE_ENV === 'production' && res.statusCode < 400) {
    return true;
  }

  return false;
};

/**
 * Request logger middleware for development
 */
export const requestLoggerDev = morgan(devFormat, {
  skip,
  immediate: false,
});

/**
 * Request logger middleware for production
 */
export const requestLoggerProd = morgan(prodFormat, {
  skip,
  immediate: false,
});

/**
 * Main request logger middleware
 * Chooses appropriate format based on environment
 */
export const requestLogger =
  process.env.NODE_ENV === 'production' ? requestLoggerProd : requestLoggerDev;

/**
 * Custom request logging middleware with additional context
 */
export const customRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Add request ID for tracing
  req.id = Math.random().toString(36).substr(2, 9);

  // Log request start
  if (process.env.NODE_ENV === 'development' && !skip(req, res)) {
    console.log(`\n🚀 Request ${req.id}: ${req.method} ${req.url}`);

    if (Object.keys(req.query).length > 0) {
      console.log(`📋 Query:`, req.query);
    }

    if (req.body && Object.keys(req.body).length > 0) {
      // Don't log sensitive data
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
      if (sanitizedBody.token) sanitizedBody.token = '[HIDDEN]';

      console.log(`📦 Body:`, sanitizedBody);
    }
  }

  // Intercept response to log completion
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;

    if (process.env.NODE_ENV === 'development' && !skip(req, res)) {
      console.log(`✅ Response ${req.id}: ${res.statusCode} in ${duration}ms`);
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Error request logger
 * Logs requests that result in errors
 */
export const errorRequestLogger = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();

  console.error(`
❌ ERROR Request [${timestamp}]:
   Method: ${req.method}
   URL: ${req.url}
   IP: ${req.ip}
   User-Agent: ${req.get('User-Agent')}
   Error: ${err.message}
   Stack: ${err.stack}
  `);

  next(err);
};

// Extend Request interface to include id
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
