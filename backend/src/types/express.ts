/**
 * Express Request Type Extensions
 *
 * Extends the Express Request interface to include custom properties
 */

import { Request } from 'express';

// User payload from JWT token
export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export {};
