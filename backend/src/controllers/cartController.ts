/**
 * Cart Controller
 *
 * Handles HTTP requests for cart endpoints:
 * - GET /cart - Get user's cart
 * - POST /cart - Add item to cart
 * - PUT /cart/:id - Update cart item quantity
 * - DELETE /cart/:id - Remove item from cart
 * - DELETE /cart - Clear entire cart
 * - GET /cart/count - Get cart item count
 */

import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';
import * as cartService from '../services/cartService';
import '../types/express'; // Import type extensions

// ============================================
// Validation Schemas
// ============================================

const addToCartSchema = Joi.object({
  menuItemId: Joi.string().required().messages({
    'any.required': 'Menu item ID is required',
  }),
  quantity: Joi.number().integer().min(1).optional().default(1).messages({
    'number.min': 'Quantity must be at least 1',
  }),
  specialInstructions: Joi.string().optional().allow(''),
});

const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required',
  }),
});

// ============================================
// Controllers
// ============================================

/**
 * Get user's cart
 * GET /api/v1/cart
 */
export const getCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    console.log('🛒 Get cart request - User ID:', userId);

    if (!userId) {
      console.log('❌ No user ID - Unauthorized');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const cart = await cartService.getUserCart(userId);
    console.log('📦 Cart retrieved:', {
      itemCount: cart.items.length,
      totalQty: cart.summary.totalQuantity,
    });

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart,
    });
  }
);

/**
 * Add item to cart
 * POST /api/v1/cart
 */
export const addToCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Validate request body
    const { error, value } = addToCartSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    const cartItem = await cartService.addToCart(
      userId,
      value.menuItemId,
      value.quantity,
      value.specialInstructions
    );

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: cartItem,
    });
  }
);

/**
 * Update cart item quantity
 * PUT /api/v1/cart/:id
 */
export const updateCartItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Validate request body
    const { error, value } = updateQuantitySchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    const cartItem = await cartService.updateCartItemQuantity(
      userId,
      id,
      value.quantity
    );

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cartItem,
    });
  }
);

/**
 * Remove item from cart
 * DELETE /api/v1/cart/:id
 */
export const removeFromCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const result = await cartService.removeFromCart(userId, id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

/**
 * Clear entire cart
 * DELETE /api/v1/cart
 */
export const clearCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const result = await cartService.clearCart(userId);

    res.status(200).json({
      success: true,
      message: result.message,
      itemsRemoved: result.itemsRemoved,
    });
  }
);

/**
 * Get cart item count
 * GET /api/v1/cart/count
 */
export const getCartCount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const count = await cartService.getCartItemCount(userId);

    res.status(200).json({
      success: true,
      data: { count },
    });
  }
);
