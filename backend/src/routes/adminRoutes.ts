/**
 * Admin Routes
 *
 * Defines all admin-related routes:
 * - GET /dashboard - Dashboard overview statistics
 * - GET /revenue - Revenue statistics with date range
 * - GET /restaurants/top - Top performing restaurants
 * - GET /food/popular - Popular food items
 * - GET /orders/recent - Recent orders
 * - GET /users/growth - User growth statistics
 */

import { Router } from "express";
import * as adminController from "../controllers/adminController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

// All admin routes require authentication and admin role
router.get(
  "/dashboard",
  authenticateToken,
  requireAdmin,
  adminController.getDashboardStats
);
router.get(
  "/revenue",
  authenticateToken,
  requireAdmin,
  adminController.getRevenueStats
);
router.get(
  "/restaurants/top",
  authenticateToken,
  requireAdmin,
  adminController.getTopRestaurants
);
router.get(
  "/food/popular",
  authenticateToken,
  requireAdmin,
  adminController.getPopularFoodItems
);
router.get(
  "/orders/recent",
  authenticateToken,
  requireAdmin,
  adminController.getRecentOrders
);
router.get(
  "/users/growth",
  authenticateToken,
  requireAdmin,
  adminController.getUserGrowthStats
);

export default router;
