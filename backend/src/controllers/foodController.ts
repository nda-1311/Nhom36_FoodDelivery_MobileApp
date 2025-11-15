/**
 * Food Item Controller
 *
 * Handles HTTP requests for food item endpoints:
 * - GET /food - List all food items
 * - GET /food/:id - Get food item details
 * - GET /food/search - Search food items
 * - GET /food/popular - Get popular food items
 * - GET /food/categories - Get all categories
 * - GET /food/category/:category - Get food by category
 */

import { NextFunction, Request, Response } from "express";
import "../types/express"; // Import type extensions
import Joi from "joi";
import { asyncHandler } from "../middleware/errorHandler";
import * as foodService from "../services/foodService";

// ============================================
// Validation Schemas
// ============================================

const getFoodItemsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  category: Joi.string().optional(),
  restaurantId: Joi.string().uuid().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  minRating: Joi.number().min(0).max(5).optional(),
  sortBy: Joi.string().valid("name", "price", "rating", "createdAt").optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
});

const searchSchema = Joi.object({
  q: Joi.string().required().messages({
    "any.required": "Search query is required",
  }),
});

const popularSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).optional().default(10),
});

const categoryLimitSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

// ============================================
// Controllers
// ============================================

/**
 * Get all food items with filters
 * GET /api/v1/food
 */
export const getFoodItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate query params
    const { error, value } = getFoodItemsSchema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    // Call service
    const result = await foodService.getFoodItems(value);

    // Send response
    res.status(200).json({
      success: true,
      message: "Food items retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  }
);

/**
 * Get food item by ID
 * GET /api/v1/food/:id
 */
export const getFoodItemById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Call service
    const foodItem = await foodService.getFoodItemById(id);

    // Send response
    res.status(200).json({
      success: true,
      message: "Food item retrieved successfully",
      data: foodItem,
    });
  }
);

/**
 * Search food items
 * GET /api/v1/food/search?q=query
 */
export const searchFoodItems = asyncHandler(
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
    const foodItems = await foodService.searchFoodItems(value.q);

    // Send response
    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: foodItems,
      count: foodItems.length,
    });
  }
);

/**
 * Get popular food items
 * GET /api/v1/food/popular?limit=10
 */
export const getPopularFoodItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate query params
    const { error, value } = popularSchema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    // Call service
    const foodItems = await foodService.getPopularFoodItems(value.limit);

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
 * Get all categories
 * GET /api/v1/food/categories
 */
export const getCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Call service
    const categories = await foodService.getCategories();

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
 * Get food items by category
 * GET /api/v1/food/category/:category?limit=20
 */
export const getFoodItemsByCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.params;

    // Validate query params
    const { error, value } = categoryLimitSchema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    // Call service
    const foodItems = await foodService.getFoodItemsByCategory(
      category,
      value.limit
    );

    // Send response
    res.status(200).json({
      success: true,
      message: `Food items in category "${category}" retrieved successfully`,
      data: foodItems,
      count: foodItems.length,
    });
  }
);

/**
 * Advanced search for food items
 * GET /api/v1/food/advanced-search?query=pizza&category=Main&minPrice=5&maxPrice=20&isVegetarian=true&isSpicy=false&maxCalories=800&maxPreparationTime=30&page=1&limit=20
 */
export const advancedFoodSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validation schema
    const schema = Joi.object({
      query: Joi.string().optional().allow(""),
      category: Joi.string().optional().allow(""),
      restaurantId: Joi.string().optional().allow(""),
      minPrice: Joi.number().min(0).optional(),
      maxPrice: Joi.number().min(0).optional(),
      isVegetarian: Joi.boolean().optional(),
      isSpicy: Joi.boolean().optional(),
      maxCalories: Joi.number().min(0).optional(),
      maxPreparationTime: Joi.number().min(0).optional(),
      page: Joi.number().integer().min(1).default(1),
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
    const result = await foodService.advancedSearchFoodItems({
      query: value.query,
      category: value.category,
      restaurantId: value.restaurantId,
      minPrice: value.minPrice,
      maxPrice: value.maxPrice,
      isVegetarian: value.isVegetarian,
      isSpicy: value.isSpicy,
      maxCalories: value.maxCalories,
      maxPreparationTime: value.maxPreparationTime,
      page: value.page,
      limit: value.limit,
    });

    // Send response
    res.status(200).json({
      success: true,
      message: "Food items search completed successfully",
      data: result.foodItems,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }
);

/**
 * Global food search across all restaurants
 * GET /api/v1/food/global-search?query=burger&limit=20
 */
export const globalSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validation schema
    const schema = Joi.object({
      query: Joi.string().required().min(1),
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
    const foodItems = await foodService.globalFoodSearch(
      value.query,
      value.limit
    );

    // Send response
    res.status(200).json({
      success: true,
      message: "Global food search completed successfully",
      data: foodItems,
      count: foodItems.length,
    });
  }
);

/**
 * Get trending/popular food items
 * GET /api/v1/food/trending?limit=10
 */
export const getTrending = asyncHandler(
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
    const foodItems = await foodService.getTrendingFoodItems(value.limit);

    // Send response
    res.status(200).json({
      success: true,
      message: "Trending food items retrieved successfully",
      data: foodItems,
      count: foodItems.length,
    });
  }
);
