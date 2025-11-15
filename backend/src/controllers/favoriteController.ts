/**
 * Favorite Controller
 * HTTP request handlers for favorite restaurant and menu item endpoints
 */

import { NextFunction, Request, Response } from 'express';
import '../types/express'; // Import type extensions
import Joi from 'joi';
import * as favoriteService from '../services/favoriteService';

/**
 * POST /api/v1/favorites
 * Add restaurant to favorites
 */
export const addFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      restaurantId: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const favorite = await favoriteService.addFavorite(
      userId,
      value.restaurantId
    );

    res.status(201).json({
      success: true,
      message: 'Restaurant added to favorites',
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/favorites/:restaurantId
 * Remove restaurant from favorites
 */
export const removeFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      restaurantId: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.params);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    await favoriteService.removeFavorite(userId, value.restaurantId);

    res.json({
      success: true,
      message: 'Restaurant removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/favorites
 * Get user's favorite restaurants
 */
export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(10),
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const result = await favoriteService.getFavorites(
      userId,
      value.page,
      value.limit
    );

    res.json({
      success: true,
      message: 'Favorites retrieved successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/favorites/check/:restaurantId
 * Check if restaurant is favorited
 */
export const checkFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      restaurantId: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.params);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const isFavorite = await favoriteService.isFavorite(
      userId,
      value.restaurantId
    );

    res.json({
      success: true,
      data: {
        isFavorite,
        restaurantId: value.restaurantId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// MENU ITEM FAVORITES
// ============================================

/**
 * POST /api/v1/favorites/menu-items
 * Add menu item to favorites
 */
export const addMenuItemFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      menuItemId: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const favorite = await favoriteService.addMenuItemFavorite(
      userId,
      value.menuItemId
    );

    res.status(201).json({
      success: true,
      message: 'Menu item added to favorites',
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/favorites/menu-items/:menuItemId
 * Remove menu item from favorites
 */
export const removeMenuItemFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      menuItemId: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.params);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    await favoriteService.removeMenuItemFavorite(userId, value.menuItemId);

    res.json({
      success: true,
      message: 'Menu item removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/favorites/menu-items
 * Get user's favorite menu items
 */
export const getMenuItemFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(20),
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const result = await favoriteService.getMenuItemFavorites(
      userId,
      value.page,
      value.limit
    );

    res.json({
      success: true,
      message: 'Menu item favorites retrieved successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/favorites/menu-items/check/:menuItemId
 * Check if menu item is favorited
 */
export const checkMenuItemFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      menuItemId: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.params);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const isFavorite = await favoriteService.isMenuItemFavorite(
      userId,
      value.menuItemId
    );

    res.json({
      success: true,
      data: {
        isFavorite,
        menuItemId: value.menuItemId,
      },
    });
  } catch (error) {
    next(error);
  }
};
