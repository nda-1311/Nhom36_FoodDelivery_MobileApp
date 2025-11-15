/**
 * Favorite Routes
 * Routes for favorite restaurant and menu item endpoints
 */

import express from 'express';
import * as favoriteController from '../controllers/favoriteController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ============================================
// RESTAURANT FAVORITES
// ============================================

/**
 * POST /api/v1/favorites/restaurants
 * Add restaurant to favorites
 */
router.post('/restaurants', favoriteController.addFavorite);

/**
 * GET /api/v1/favorites/restaurants
 * Get user's favorite restaurants
 */
router.get('/restaurants', favoriteController.getFavorites);

/**
 * GET /api/v1/favorites/restaurants/check/:restaurantId
 * Check if restaurant is favorited
 */
router.get(
  '/restaurants/check/:restaurantId',
  favoriteController.checkFavorite
);

/**
 * DELETE /api/v1/favorites/restaurants/:restaurantId
 * Remove restaurant from favorites
 */
router.delete('/restaurants/:restaurantId', favoriteController.removeFavorite);

// ============================================
// MENU ITEM FAVORITES (Main use case)
// ============================================

/**
 * POST /api/v1/favorites/menu-items
 * Add menu item to favorites
 */
router.post('/menu-items', favoriteController.addMenuItemFavorite);

/**
 * GET /api/v1/favorites/menu-items
 * Get user's favorite menu items
 */
router.get('/menu-items', favoriteController.getMenuItemFavorites);

/**
 * GET /api/v1/favorites/menu-items/check/:menuItemId
 * Check if menu item is favorited
 */
router.get(
  '/menu-items/check/:menuItemId',
  favoriteController.checkMenuItemFavorite
);

/**
 * DELETE /api/v1/favorites/menu-items/:menuItemId
 * Remove menu item from favorites
 */
router.delete(
  '/menu-items/:menuItemId',
  favoriteController.removeMenuItemFavorite
);

export default router;
