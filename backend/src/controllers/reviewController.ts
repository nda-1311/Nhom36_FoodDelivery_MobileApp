/**
 * Review Controller
 * HTTP request handlers for review endpoints
 */

import { NextFunction, Request, Response } from 'express';
import "../types/express"; // Import type extensions
import Joi from 'joi';
import * as reviewService from '../services/reviewService';

/**
 * POST /api/v1/reviews
 * Create a review for an order
 */
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      orderId: Joi.string().required(),
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().allow('').max(1000).optional(),
      images: Joi.array().items(Joi.string().uri()).max(5).optional(),
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
    const review = await reviewService.createReview(userId, value);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/restaurants/:restaurantId/reviews
 * Get reviews for a restaurant
 */
export const getRestaurantReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      restaurantId: Joi.string().required(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(10),
      rating: Joi.number().integer().min(1).max(5).optional(),
    });

    const { error, value } = schema.validate({
      restaurantId: req.params.restaurantId,
      ...req.query,
    });

    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const result = await reviewService.getRestaurantReviews(
      value.restaurantId,
      value.page,
      value.limit,
      value.rating
    );

    res.json({
      success: true,
      message: 'Restaurant reviews retrieved successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reviews/my-reviews
 * Get user's reviews
 */
export const getMyReviews = async (
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
    const result = await reviewService.getUserReviews(
      userId,
      value.page,
      value.limit
    );

    res.json({
      success: true,
      message: 'User reviews retrieved successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reviews/:id
 * Get review by ID
 */
export const getReviewById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
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
    const review = await reviewService.getReviewById(value.id, userId);

    res.json({
      success: true,
      message: 'Review retrieved successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/reviews/:id
 * Update review
 */
export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const paramsSchema = Joi.object({
      id: Joi.string().required(),
    });

    const bodySchema = Joi.object({
      rating: Joi.number().integer().min(1).max(5).optional(),
      comment: Joi.string().allow('').max(1000).optional(),
      images: Joi.array().items(Joi.string().uri()).max(5).optional(),
    }).min(1);

    const paramsValidation = paramsSchema.validate(req.params);
    const bodyValidation = bodySchema.validate(req.body);

    if (paramsValidation.error) {
      res.status(400).json({
        success: false,
        message: paramsValidation.error.details[0].message,
      });
      return;
    }

    if (bodyValidation.error) {
      res.status(400).json({
        success: false,
        message: bodyValidation.error.details[0].message,
      });
      return;
    }

    const userId = req.user!.userId;
    const review = await reviewService.updateReview(
      paramsValidation.value.id,
      userId,
      bodyValidation.value
    );

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/reviews/:id
 * Delete review
 */
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
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
    await reviewService.deleteReview(value.id, userId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
