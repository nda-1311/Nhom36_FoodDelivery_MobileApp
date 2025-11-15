/**
 * Authentication Controller
 *
 * Handles HTTP requests for authentication endpoints:
 * - POST /auth/register - Register new user
 * - POST /auth/login - Login user
 * - POST /auth/refresh - Refresh access token
 * - GET /auth/profile - Get current user profile
 * - PUT /auth/profile - Update user profile
 * - POST /auth/change-password - Change password
 */

import { NextFunction, Request, Response } from 'express';
import '../types/express'; // Import type extensions
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';
import * as authService from '../services/authService';
import { logger } from '../utils/logger';

// ============================================
// Validation Schemas
// ============================================

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  fullName: Joi.string().optional().allow(''),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be 10-11 digits',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().optional().allow(''),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be 10-11 digits',
    }),
  avatarUrl: Joi.string().uri().optional().allow(''),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required',
  }),
});

const verifyResetTokenSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
});

// ============================================
// Controllers
// ============================================

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    // Call service
    const result = await authService.register(value);

    logger.info(`User registered successfully: ${result.user.email}`);

    // Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  }
);

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    // Call service
    const result = await authService.login(value);

    logger.info(`User logged in successfully: ${result.user.email}`);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  }
);

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    const { error, value } = refreshTokenSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    // Call service
    const result = await authService.refreshAccessToken(value.refreshToken);

    logger.info(`Token refreshed successfully for user: ${result.user.email}`);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  }
);

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 */
export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get userId from authenticated request
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Call service
    const user = await authService.getUserProfile(userId);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    });
  }
);

/**
 * Update user profile
 * PUT /api/v1/auth/profile
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get userId from authenticated request
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Validate request body
    const { error, value } = updateProfileSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    // Call service
    const user = await authService.updateUserProfile(userId, value);

    logger.info(`Profile updated successfully for user: ${userId}`);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  }
);

/**
 * Change user password
 * POST /api/v1/auth/change-password
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get userId from authenticated request
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Validate request body
    const { error, value } = changePasswordSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    // Call service
    const result = await authService.changePassword(
      userId,
      value.oldPassword,
      value.newPassword
    );

    logger.info(`Password changed successfully for user: ${userId}`);

    // Send response
    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

/**
 * Forgot password - Request reset token
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    const { error, value } = forgotPasswordSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    // Call service
    const result = await authService.forgotPassword(value.email);

    logger.info(`Password reset requested for: ${value.email}`);

    // Send response
    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

/**
 * Reset password with token
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    const { error, value } = resetPasswordSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    // Call service
    const result = await authService.resetPassword(
      value.token,
      value.newPassword
    );

    logger.info(`Password reset successful with token: ${value.token}`);

    // Send response
    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

/**
 * Verify reset token
 * POST /api/v1/auth/verify-reset-token
 */
export const verifyResetToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    const { error, value } = verifyResetTokenSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    // Call service
    const result = await authService.verifyResetToken(value.token);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: result,
    });
  }
);
