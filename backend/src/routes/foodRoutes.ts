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

import { Router } from "express";
import * as foodController from "../controllers/foodController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

// Public routes (with optional auth for personalization)
// IMPORTANT: Specific routes must come before parameterized routes
router.get("/search", optionalAuth, foodController.searchFoodItems);
router.get("/advanced-search", optionalAuth, foodController.advancedFoodSearch);
router.get("/global-search", optionalAuth, foodController.globalSearch);
router.get("/trending", optionalAuth, foodController.getTrending);
router.get("/popular", optionalAuth, foodController.getPopularFoodItems);
router.get("/categories", foodController.getCategories);
router.get(
  "/category/:category",
  optionalAuth,
  foodController.getFoodItemsByCategory
);
router.get("/:id", optionalAuth, foodController.getFoodItemById);
router.get("/", optionalAuth, foodController.getFoodItems);

export default router;
