import { NextFunction, Request, Response } from 'express';

/**
 * Error Handler Middleware
 *
 * Centralized error handling for the Express application.
 * Catches and processes all errors, providing consistent error responses.
 */

// Custom error interface
export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: string;
}

// Error response interface
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  stack?: string;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * Create a custom error
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode < 500 ? 'fail' : 'error';
  error.isOperational = true;
  error.code = code;

  return error;
};

/**
 * Handle different types of errors
 */
const handleDatabaseError = (error: any): AppError => {
  let message = 'Database operation failed';
  let statusCode = 500;

  // PostgreSQL/Prisma specific errors
  if (error.code === 'P2002') {
    message = 'Duplicate entry. This record already exists.';
    statusCode = 409;
  } else if (error.code === 'P2025') {
    message = 'Record not found.';
    statusCode = 404;
  } else if (error.code === 'P2003') {
    message = 'Foreign key constraint violation.';
    statusCode = 400;
  } else if (error.code === '23505') {
    message = 'Duplicate entry detected.';
    statusCode = 409;
  } else if (error.code === '23503') {
    message = 'Referenced record does not exist.';
    statusCode = 400;
  }

  return createError(message, statusCode, error.code);
};

const handleJWTError = (): AppError => {
  return createError(
    'Invalid token. Please log in again.',
    401,
    'INVALID_TOKEN'
  );
};

const handleJWTExpiredError = (): AppError => {
  return createError(
    'Token has expired. Please log in again.',
    401,
    'TOKEN_EXPIRED'
  );
};

const handleValidationError = (error: any): AppError => {
  const message = error.details
    ? error.details.map((detail: any) => detail.message).join('. ')
    : 'Validation failed';

  return createError(message, 400, 'VALIDATION_ERROR');
};

const handleMulterError = (error: any): AppError => {
  let message = 'File upload failed';

  if (error.code === 'LIMIT_FILE_SIZE') {
    message = 'File size too large';
  } else if (error.code === 'LIMIT_FILE_COUNT') {
    message = 'Too many files uploaded';
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Unexpected file field';
  }

  return createError(message, 400, error.code);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err: AppError, req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    error: err.name || 'Error',
    message: err.message,
    statusCode: err.statusCode || 500,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  res.status(err.statusCode || 500).json(errorResponse);
};

/**
 * Send error response in production
 */
const sendErrorProd = (err: AppError, req: Request, res: Response): void => {
  // Operational errors: send message to client
  if (err.isOperational) {
    const errorResponse: Omit<ErrorResponse, 'stack'> = {
      error: err.status || 'error',
      message: err.message,
      statusCode: err.statusCode || 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    };

    res.status(err.statusCode || 500).json(errorResponse);
  } else {
    // Programming errors: don't leak error details
    console.error('ERROR:', err);

    res.status(500).json({
      error: 'error',
      message: 'Something went wrong!',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific error types
  if (err.name === 'PrismaClientKnownRequestError') {
    err = handleDatabaseError(err);
  } else if (err.name === 'JsonWebTokenError') {
    err = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  } else if (err.name === 'ValidationError' || err.isJoi) {
    err = handleValidationError(err);
  } else if (err.name === 'MulterError') {
    err = handleMulterError(err);
  } else if (err.type === 'entity.parse.failed') {
    err = createError(
      'Invalid JSON format in request body',
      400,
      'INVALID_JSON'
    );
  } else if (err.name === 'SyntaxError' && err.status === 400) {
    err = createError('Invalid JSON format', 400, 'SYNTAX_ERROR');
  }

  // Send appropriate error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    sendErrorProd(err, req, res);
  }
};

/**
 * Async error wrapper
 * Catches async errors and passes them to the error handler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = createError(
    `Route ${req.originalUrl} not found`,
    404,
    'NOT_FOUND'
  );
  next(error);
};
