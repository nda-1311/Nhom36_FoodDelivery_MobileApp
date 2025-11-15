/**
 * Review Service
 * Business logic for restaurant reviews and ratings
 */

import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface CreateReviewData {
  orderId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

interface UpdateReviewData {
  rating?: number;
  comment?: string;
  images?: string[];
}

/**
 * Create a review for a completed order
 */
export const createReview = async (
  userId: string,
  data: CreateReviewData
): Promise<any> => {
  const { orderId, rating, comment, images } = data;

  // Verify order exists and belongs to user
  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  // Only allow reviews for delivered orders
  if (order.status !== 'DELIVERED') {
    throw createError('Can only review delivered orders', 400);
  }

  // Check if review already exists
  const existingReview = await db.review.findUnique({
    where: { orderId },
  });

  if (existingReview) {
    throw createError('Review already exists for this order', 400);
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw createError('Rating must be between 1 and 5', 400);
  }

  // Create review
  const review = await db.review.create({
    data: {
      id: `review_${orderId}_${Date.now()}`,
      userId,
      restaurantId: order.restaurantId,
      orderId,
      rating,
      comment,
      images: images || [],
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      restaurant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Update restaurant rating
  await updateRestaurantRating(order.restaurantId);

  logger.info(
    `Review created for order ${orderId} by user ${userId}, rating: ${rating}`
  );

  return review;
};

/**
 * Get reviews for a restaurant with pagination
 */
export const getRestaurantReviews = async (
  restaurantId: string,
  page: number = 1,
  limit: number = 10,
  rating?: number
): Promise<any> => {
  const skip = (page - 1) * limit;

  const where: any = { restaurantId };
  if (rating) {
    where.rating = rating;
  }

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            orderDate: true,
          },
        },
      },
    }),
    db.review.count({ where }),
  ]);

  // Get rating statistics
  const stats = await db.review.groupBy({
    by: ['rating'],
    where: { restaurantId },
    _count: {
      rating: true,
    },
  });

  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  stats.forEach((stat: any) => {
    ratingDistribution[stat.rating as keyof typeof ratingDistribution] =
      stat._count.rating;
  });

  const avgRating = await db.review.aggregate({
    where: { restaurantId },
    _avg: {
      rating: true,
    },
  });

  logger.info(
    `Retrieved ${reviews.length} reviews for restaurant ${restaurantId} (page ${page}/${Math.ceil(total / limit)})`
  );

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    statistics: {
      averageRating: avgRating._avg.rating || 0,
      totalReviews: total,
      ratingDistribution,
    },
  };
};

/**
 * Get user's reviews
 */
export const getUserReviews = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<any> => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            orderDate: true,
          },
        },
      },
    }),
    db.review.count({ where: { userId } }),
  ]);

  logger.info(
    `Retrieved ${reviews.length} reviews by user ${userId} (page ${page}/${Math.ceil(total / limit)})`
  );

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get review by ID
 */
export const getReviewById = async (
  reviewId: string,
  userId: string
): Promise<any> => {
  const review = await db.review.findFirst({
    where: {
      id: reviewId,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      restaurant: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          orderDate: true,
        },
      },
    },
  });

  if (!review) {
    throw createError('Review not found', 404);
  }

  return review;
};

/**
 * Update review
 */
export const updateReview = async (
  reviewId: string,
  userId: string,
  data: UpdateReviewData
): Promise<any> => {
  // Verify review exists and belongs to user
  const existingReview = await db.review.findFirst({
    where: {
      id: reviewId,
      userId,
    },
  });

  if (!existingReview) {
    throw createError('Review not found', 404);
  }

  // Validate rating if provided
  if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
    throw createError('Rating must be between 1 and 5', 400);
  }

  // Update review
  const updatedReview = await db.review.update({
    where: { id: reviewId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      restaurant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Update restaurant rating if rating changed
  if (data.rating !== undefined && data.rating !== existingReview.rating) {
    await updateRestaurantRating(existingReview.restaurantId);
  }

  logger.info(`Review ${reviewId} updated by user ${userId}`);

  return updatedReview;
};

/**
 * Delete review
 */
export const deleteReview = async (
  reviewId: string,
  userId: string
): Promise<void> => {
  // Verify review exists and belongs to user
  const review = await db.review.findFirst({
    where: {
      id: reviewId,
      userId,
    },
  });

  if (!review) {
    throw createError('Review not found', 404);
  }

  // Delete review
  await db.review.delete({
    where: { id: reviewId },
  });

  // Update restaurant rating
  await updateRestaurantRating(review.restaurantId);

  logger.info(`Review ${reviewId} deleted by user ${userId}`);
};

/**
 * Helper: Update restaurant's average rating
 */
async function updateRestaurantRating(restaurantId: string): Promise<void> {
  const avgRating = await db.review.aggregate({
    where: { restaurantId },
    _avg: {
      rating: true,
    },
  });

  await db.restaurant.update({
    where: { id: restaurantId },
    data: {
      rating: avgRating._avg.rating || 0,
      updatedAt: new Date(),
    },
  });

  logger.info(
    `Restaurant ${restaurantId} rating updated to ${avgRating._avg.rating || 0}`
  );
}
