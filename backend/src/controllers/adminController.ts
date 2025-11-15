/**
 * Admin Controller
 *
 * Handles admin dashboard and statistics endpoints
 */

import { NextFunction, Request, Response } from "express";
import "../types/express"; // Import type extensions
import Joi from "joi";
import { asyncHandler } from "../middleware/errorHandler";
import * as adminService from "../services/adminService";

/**
 * Get dashboard overview statistics
 * GET /api/v1/admin/dashboard
 */
export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Call service
    const stats = await adminService.getDashboardStats();

    // Send response
    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: stats,
    });
  }
);

/**
 * Get revenue statistics
 * GET /api/v1/admin/revenue?startDate=2024-01-01&endDate=2024-12-31
 */
export const getRevenueStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validation schema
    const schema = Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional().greater(Joi.ref("startDate")),
    });

    // Validate
    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    // Call service
    const stats = await adminService.getRevenueStats(
      value.startDate ? new Date(value.startDate) : undefined,
      value.endDate ? new Date(value.endDate) : undefined
    );

    // Send response
    res.status(200).json({
      success: true,
      message: "Revenue statistics retrieved successfully",
      data: stats,
    });
  }
);

/**
 * Get top performing restaurants
 * GET /api/v1/admin/restaurants/top?limit=10
 */
export const getTopRestaurants = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validation schema
    const schema = Joi.object({
      limit: Joi.number().integer().min(1).max(50).default(10),
    });

    // Validate
    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    // Call service
    const restaurants = await adminService.getTopRestaurants(value.limit);

    // Send response
    res.status(200).json({
      success: true,
      message: "Top restaurants retrieved successfully",
      data: restaurants,
      count: restaurants.length,
    });
  }
);

/**
 * Get popular food items
 * GET /api/v1/admin/food/popular?limit=10
 */
export const getPopularFoodItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validation schema
    const schema = Joi.object({
      limit: Joi.number().integer().min(1).max(50).default(10),
    });

    // Validate
    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    // Call service
    const foodItems = await adminService.getPopularFoodItems(value.limit);

    // Send response
    res.status(200).json({
      success: true,
      message: "Popular food items retrieved successfully",
      data: foodItems,
      count: foodItems.length,
    });
  }
);

/**
 * Get recent orders
 * GET /api/v1/admin/orders/recent?limit=20
 */
export const getRecentOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validation schema
    const schema = Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(20),
    });

    // Validate
    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    // Call service
    const orders = await adminService.getRecentOrders(value.limit);

    // Send response
    res.status(200).json({
      success: true,
      message: "Recent orders retrieved successfully",
      data: orders,
      count: orders.length,
    });
  }
);

/**
 * Get user growth statistics
 * GET /api/v1/admin/users/growth?days=30
 */
export const getUserGrowthStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validation schema
    const schema = Joi.object({
      days: Joi.number().integer().min(1).max(365).default(30),
    });

    // Validate
    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    // Call service
    const stats = await adminService.getUserGrowthStats(value.days);

    // Send response
    res.status(200).json({
      success: true,
      message: "User growth statistics retrieved successfully",
      data: stats,
    });
  }
);
