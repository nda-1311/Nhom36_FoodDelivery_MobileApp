/**
 * Restaurant Routes
 *
 * Defines all restaurant-related routes:
 * - GET / - List all restaurants
 * - GET /search - Search restaurants
 * - GET /advanced-search - Advanced search with filters
 * - GET /nearby - Find nearby restaurants by location
 * - GET /:id - Get restaurant details
 * - GET /:id/menu - Get restaurant menu
 * - GET /:id/categories - Get restaurant categories
 */

import { Router } from "express";
import * as restaurantController from "../controllers/restaurantController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

// Public routes (with optional auth for personalization)
// IMPORTANT: Specific routes must come before parameterized routes
router.get("/search", optionalAuth, restaurantController.searchRestaurants);
router.get(
  "/advanced-search",
  optionalAuth,
  restaurantController.advancedSearch
);
router.get("/nearby", optionalAuth, restaurantController.getNearbyRestaurants);
router.get("/:id/menu", optionalAuth, restaurantController.getRestaurantMenu);
router.get("/:id/categories", restaurantController.getRestaurantCategories);
router.get("/:id", optionalAuth, restaurantController.getRestaurantById);
router.get("/", optionalAuth, restaurantController.getRestaurants);

export default router;
