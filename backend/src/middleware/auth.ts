import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import '../types/express'; // Import type extensions
import { jwt as jwtConfig } from '../config/environment';

/**
 * Authentication Middleware
 *
 * Handles JWT token validation and user authentication.
 */

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * JWT Authentication middleware
 * Validates JWT tokens and attaches user to request
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    const decoded = jwt.verify(token, jwtConfig.secret) as JWTPayload;

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Admin authorization middleware
 * Checks if user has admin privileges
 */
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Placeholder implementation
  // TODO: Check user role from JWT payload

  next();
};

/**
 * Optional authentication middleware
 * Continues even if no token is provided
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Placeholder implementation
  // TODO: Validate token if present, but don't require it

  next();
};

// Export aliases for compatibility
export const authenticateToken = authMiddleware;
export const requireAdmin = adminMiddleware;
