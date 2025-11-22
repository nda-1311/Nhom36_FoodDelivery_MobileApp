/**
 * Authentication Service
 *
 * Handles all authentication business logic including:
 * - User registration with password hashing
 * - User login with JWT token generation
 * - Token refresh mechanism
 * - User profile retrieval
 */

import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { config } from '../config/environment';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// JWT Payload interface
interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

// Registration data interface
interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string; // Support both phone and phoneNumber
}

// Login data interface
interface LoginData {
  email: string;
  password: string;
}

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT access token
 */
const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpire,
  } as jwt.SignOptions);
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire,
  } as jwt.SignOptions);
};

/**
 * Register new user
 */
export const register = async (data: RegisterData) => {
  const { email, password, fullName, phone, phoneNumber } = data;

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    logger.warn(`Registration attempt with existing email: ${email}`);
    throw createError('Email already registered', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user - use phoneNumber if provided, fallback to phone
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName: fullName && fullName.trim() ? fullName.trim() : 'User',
      phoneNumber:
        (phoneNumber && phoneNumber.trim()) || (phone && phone.trim()) || null,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  });

  logger.info(`New user registered: ${user.id} - ${email}`);

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
export const login = async (data: LoginData) => {
  const { email, password } = data;

  // Find user with password
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    logger.warn(`Login attempt with non-existent email: ${email}`);
    throw createError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    logger.warn(`Failed login attempt for email: ${email}`);
    throw createError('Invalid email or password', 401);
  }

  logger.info(`User logged in: ${user.id} - ${email}`);

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    // Verify refresh token
    const payload = jwt.verify(
      refreshToken,
      config.jwt.refreshSecret
    ) as JWTPayload;

    // Check if user still exists
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        avatar: true,
        role: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`Access token refreshed for user: ${user.id}`);

    return {
      accessToken: newAccessToken,
      user,
    };
  } catch (error) {
    logger.error('Refresh token error:', error);
    throw createError('Invalid or expired refresh token', 401);
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      avatar: true,
      role: true, // Add role field
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  return user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  data: Partial<Pick<User, 'fullName' | 'phoneNumber' | 'avatar'>>
) => {
  const user = await db.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      avatar: true,
      updatedAt: true,
    },
  });

  logger.info(`User profile updated: ${userId}`);

  return user;
};

/**
 * Change user password
 */
export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  // Get user with password
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Verify old password
  const isOldPasswordValid = await comparePassword(oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw createError('Current password is incorrect', 401);
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  await db.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  logger.info(`Password changed for user: ${userId}`);

  return { message: 'Password changed successfully' };
};

/**
 * Generate random 6-digit token
 */
const generateResetToken = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Forgot password - Send reset token via email
 */
export const forgotPassword = async (email: string) => {
  // Check if user exists
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists or not for security
    logger.warn(`Password reset requested for non-existent email: ${email}`);
    return { message: 'If the email exists, a reset token has been sent' };
  }

  // Generate reset token (6-digit number)
  const resetToken = generateResetToken();

  // Set expiration time (1 hour from now)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Delete any existing unused tokens for this email
  await db.passwordResetToken.deleteMany({
    where: {
      email,
      used: false,
    },
  });

  // Create new reset token
  await db.passwordResetToken.create({
    data: {
      email,
      token: resetToken,
      expiresAt,
    },
  });

  // Send email with reset token
  const { sendPasswordResetEmail } = await import('../utils/emailService');
  await sendPasswordResetEmail(email, resetToken);

  // Log OTP for development (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('\n🔐 ========================================');
    console.log(`📧 Password Reset OTP for: ${email}`);
    console.log(`🔢 OTP Code: ${resetToken}`);
    console.log(`⏰ Expires at: ${expiresAt.toLocaleString()}`);
    console.log('🔐 ========================================\n');
  }

  logger.info(`Password reset token generated for: ${email}`);

  return { message: 'If the email exists, a reset token has been sent' };
};

/**
 * Reset password using token
 */
export const resetPassword = async (token: string, newPassword: string) => {
  // Find valid token
  const resetToken = await db.passwordResetToken.findFirst({
    where: {
      token,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!resetToken) {
    throw createError('Invalid or expired reset token', 400);
  }

  // Find user
  const user = await db.user.findUnique({
    where: { email: resetToken.email },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await db.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Mark token as used
  await db.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used: true },
  });

  logger.info(`Password reset successful for: ${user.email}`);

  return { message: 'Password reset successfully' };
};

/**
 * Verify reset token
 */
export const verifyResetToken = async (token: string) => {
  const resetToken = await db.passwordResetToken.findFirst({
    where: {
      token,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!resetToken) {
    throw createError('Invalid or expired reset token', 400);
  }

  return { valid: true, email: resetToken.email };
};
