/**
 * Restaurant Controller
 *
 * Handles HTTP requests for restaurant endpoints:
 * - GET /restaurants - List all restaurants
 * - GET /restaurants/:id - Get restaurant details
 * - GET /restaurants/:id/menu - Get restaurant menu
 * - GET /restaurants/search - Search restaurants
 * - GET /restaurants/:id/categories - Get restaurant categories
 */

import { NextFunction, Request, Response } from "express";
import "../types/express"; // Import type extensions
import Joi from "joi";
import { asyncHandler } from "../middleware/errorHandler";
import * as restaurantService from "../services/restaurantService";

// ============================================
// Validation Schemas
// ============================================

const getRestaurantsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string().valid("name", "rating", "createdAt").optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
  minRating: Joi.number().min(0).max(5).optional(),
  isOpen: Joi.boolean().optional(),
});

const getMenuSchema = Joi.object({
  category: Joi.string().optional(),
  search: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
});

const searchSchema = Joi.object({
  q: Joi.string().required().messages({
    "any.required": "Search query is required",
  }),
});

// ============================================
// Controllers
// ============================================

/**
 * Get all restaurants with filters
 * GET /api/v1/restaurants
 */
export const getRestaurants = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate query params
    const { error, value } = getRestaurantsSchema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    // Call service
    const result = await restaurantService.getRestaurants(value);

    // Send response
    res.status(200).json({
      success: true,
      message: "Restaurants retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  }
);

/**
 * Get restaurant by ID
 * GET /api/v1/restaurants/:id
 */
export const getRestaurantById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Call service
    const restaurant = await restaurantService.getRestaurantById(id);

    // Send response
    res.status(200).json({
      success: true,
      message: "Restaurant retrieved successfully",
      data: restaurant,
    });
  }
);

/**
 * Get restaurant menu
 * GET /api/v1/restaurants/:id/menu
 */
export const getRestaurantMenu = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validate query params
    const { error, value } = getMenuSchema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    // Call service
    const result = await restaurantService.getRestaurantMenu(id, value);

    // Send response
    res.status(200).json({
      success: true,
      message: "Restaurant menu retrieved successfully",
      data: result,
    });
  }
);

/**
 * Search restaurants
 * GET /api/v1/restaurants/search?q=query
 */
export const searchRestaurants = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate query params
    const { error, value } = searchSchema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    // Call service
    const restaurants = await restaurantService.searchRestaurants(value.q);

    // Send response
    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: restaurants,
      count: restaurants.length,
    });
  }
);

/**
 * Get restaurant categories
 * GET /api/v1/restaurants/:id/categories
 */
export const getRestaurantCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Call service
    const categories = await restaurantService.getRestaurantCategories(id);

    // Send response
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
      count: categories.length,
    });
  }
);

/**
 * Advanced search restaurants
 * GET /api/v1/restaurants/advanced-search
 */
export const advancedSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      query: Joi.string().optional(),
      minRating: Joi.number().min(0).max(5).optional(),
      maxDeliveryFee: Joi.number().min(0).optional(),
      minOrderAmount: Joi.number().min(0).optional(),
      maxPreparationTime: Joi.number().min(0).optional(),
      isOpen: Joi.boolean().optional(),
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
      radius: Joi.number().min(1).max(50).optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const result = await restaurantService.advancedSearchRestaurants(value);

    res.json({
      success: true,
      message: "Advanced search completed successfully",
      ...result,
    });
  }
);

/**
 * Get nearby restaurants
 * GET /api/v1/restaurants/nearby
 */
export const getNearbyRestaurants = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      radius: Joi.number().min(1).max(50).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const { latitude, longitude, radius, limit } = value;

    const restaurants = await restaurantService.getNearbyRestaurants(
      latitude,
      longitude,
      radius,
      limit
    );

    res.json({
      success: true,
      message: "Nearby restaurants retrieved successfully",
      data: restaurants,
      count: restaurants.length,
    });
  }
);
