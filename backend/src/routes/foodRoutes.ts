/**
 * Food Item Routes
 *
 * Defines all food item-related routes:
 * - GET / - List all food items
 * - GET /search - Search food items
 * - GET /advanced-search - Advanced search with filters
 * - GET /global-search - Search across all restaurants
 * - GET /trending - Get trending/popular food items
 * - GET /popular - Get popular food items
 * - GET /categories - Get all categories
 * - GET /category/:category - Get food by category
 * - GET /:id - Get food item details
 */

import { Router } from 'express';
import * as foodController from '../controllers/foodController';
import { optionalAuth } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();

// Public routes (with optional auth for personalization)
// IMPORTANT: Specific routes must come before parameterized routes
router.get(
  '/search',
  optionalAuth,
  cacheMiddleware({
    ttl: 180,
    keyPrefix: 'food:search',
    varyBy: ['q', 'category', 'price'],
  }),
  foodController.searchFoodItems
);
router.get(
  '/advanced-search',
  optionalAuth,
  cacheMiddleware({
    ttl: 180,
    keyPrefix: 'food:advanced',
    varyBy: ['q', 'filters'],
  }),
  foodController.advancedFoodSearch
);
router.get(
  '/global-search',
  optionalAuth,
  cacheMiddleware({ ttl: 120, keyPrefix: 'food:global', varyBy: ['q'] }),
  foodController.globalSearch
);
router.get(
  '/trending',
  optionalAuth,
  cacheMiddleware({ ttl: 300, keyPrefix: 'food:trending' }),
  foodController.getTrending
);
router.get(
  '/popular',
  optionalAuth,
  cacheMiddleware({ ttl: 300, keyPrefix: 'food:popular' }),
  foodController.getPopularFoodItems
);
router.get(
  '/categories',
  cacheMiddleware({ ttl: 600, keyPrefix: 'food:categories' }),
  foodController.getCategories
);
router.get(
  '/category/:category',
  optionalAuth,
  cacheMiddleware({ ttl: 300, keyPrefix: 'food:category' }),
  foodController.getFoodItemsByCategory
);
router.get(
  '/:id',
  optionalAuth,
  cacheMiddleware({ ttl: 600, keyPrefix: 'food:detail' }),
  foodController.getFoodItemById
);
router.get(
  '/',
  optionalAuth,
  cacheMiddleware({
    ttl: 300,
    keyPrefix: 'food:list',
    varyBy: ['page', 'limit', 'restaurant', 'category', 'search'],
  }),
  foodController.getFoodItems
);

export default router;
