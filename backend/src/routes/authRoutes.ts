/**
 * Authentication Routes
 *
 * Defines all authentication-related routes:
 * - POST /register - Register new user
 * - POST /login - Login user
 * - POST /refresh - Refresh access token
 * - GET /profile - Get current user profile (protected)
 * - PUT /profile - Update user profile (protected)
 * - POST /change-password - Change password (protected)
 */

import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-reset-token', authController.verifyResetToken);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post(
  '/change-password',
  authenticateToken,
  authController.changePassword
);

export default router;
