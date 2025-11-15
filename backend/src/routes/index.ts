/**
 * API Routes Index
 *
 * Main entry point for all API routes.
 * Mounts all route modules under their respective base paths.
 */

import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import addressRoutes from './addressRoutes';
import adminRoutes from './adminRoutes';
import authRoutes from './authRoutes';
import cartRoutes from './cartRoutes';
import favoriteRoutes from './favoriteRoutes';
import foodRoutes from './foodRoutes';
import orderRoutes from './orderRoutes';
import restaurantRoutes from './restaurantRoutes';
import reviewRoutes from './reviewRoutes';
import setupRoutes from './setupRoutes';

const router = Router();

console.log('📍 Routes index loaded');
console.log('📍 authRoutes type:', typeof authRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  console.log('✅ Health check endpoint hit');
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
console.log('📍 Mounting auth routes...');
router.use('/auth', authRoutes);
console.log('📍 Mounting restaurant routes...');
router.use('/restaurants', restaurantRoutes);

// Restaurant reviews endpoint (before general reviews routes)
console.log('📍 Mounting restaurant reviews routes...');
router.get(
  '/restaurants/:restaurantId/reviews',
  reviewController.getRestaurantReviews
);

console.log('📍 Mounting food routes...');
router.use('/food', foodRoutes);
console.log('📍 Mounting cart routes...');
router.use('/cart', cartRoutes);
console.log('📍 Mounting order routes...');
router.use('/orders', orderRoutes);
console.log('📍 Mounting review routes...');
router.use('/reviews', reviewRoutes);
console.log('📍 Mounting favorite routes...');
router.use('/favorites', favoriteRoutes);
console.log('📍 Mounting address routes...');
router.use('/addresses', addressRoutes);
console.log('📍 Mounting admin routes...');
router.use('/admin', adminRoutes);
console.log('📍 Mounting setup routes (TEMPORARY)...');
router.use('/setup', setupRoutes);
console.log('✅ All routes mounted successfully');

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

export default router;
