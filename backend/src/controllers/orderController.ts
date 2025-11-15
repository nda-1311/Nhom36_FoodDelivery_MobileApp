/**
 * Order Controller
 * HTTP request handlers for order operations
 */

import { NextFunction, Request, Response } from "express";
import "../types/express"; // Import type extensions
import Joi from "joi";
import { asyncHandler } from "../middleware/errorHandler";
import * as orderService from "../services/orderService";

// ============================================
// Validation Schemas
// ============================================

const createOrderSchema = Joi.object({
  addressId: Joi.string().required().messages({
    "any.required": "Address ID is required",
  }),
  paymentMethod: Joi.string()
    .valid("CASH", "CREDIT_CARD", "DEBIT_CARD", "ONLINE_BANKING", "E_WALLET")
    .required()
    .messages({
      "any.required": "Payment method is required",
      "any.only": "Invalid payment method",
    }),
  specialInstructions: Joi.string().optional().allow(""),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED"
    )
    .required()
    .messages({
      "any.required": "Status is required",
      "any.only": "Invalid status",
    }),
  message: Joi.string().optional().allow(""),
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().required().min(10).messages({
    "any.required": "Cancellation reason is required",
    "string.min": "Reason must be at least 10 characters",
  }),
});

// ============================================
// Controller Functions
// ============================================

/**
 * Create order from cart
 * POST /api/v1/orders
 */
export const createOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validate request body
    const { error, value } = createOrderSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    const order = await orderService.createOrder(userId, value);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  }
);

/**
 * Get user's orders
 * GET /api/v1/orders
 */
export const getUserOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const result = await orderService.getUserOrders(
      userId,
      page,
      limit,
      status as any
    );

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      ...result,
    });
  }
);

/**
 * Get order by ID
 * GET /api/v1/orders/:id
 */
export const getOrderById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const order = await orderService.getOrderById(id, userId);

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  }
);

/**
 * Update order status (admin/restaurant only)
 * PUT /api/v1/orders/:id/status
 */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Add admin/restaurant authorization middleware
    const { id } = req.params;

    // Validate request body
    const { error, value } = updateStatusSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    const order = await orderService.updateOrderStatus(
      id,
      value.status,
      value.message
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  }
);

/**
 * Cancel order
 * POST /api/v1/orders/:id/cancel
 */
export const cancelOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    // Validate request body
    const { error, value } = cancelOrderSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    const order = await orderService.cancelOrder(id, userId, value.reason);

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  }
);

/**
 * Get order tracking
 * GET /api/v1/orders/:id/tracking
 */
export const getOrderTracking = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const tracking = await orderService.getOrderTracking(id, userId);

    res.status(200).json({
      success: true,
      message: "Order tracking retrieved successfully",
      data: tracking,
    });
  }
);
