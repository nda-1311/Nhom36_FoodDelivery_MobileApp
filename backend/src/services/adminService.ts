/**
 * Admin Service
 *
 * Business logic for admin dashboard and statistics
 */

import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Get dashboard statistics overview
 */
export const getDashboardStats = async () => {
  try {
    // Get counts in parallel for performance
    const [
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalReviews,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    ] = await Promise.all([
      db.user.count(),
      db.restaurant.count(),
      db.order.count(),
      db.review.count(),
      db.order.count({ where: { status: 'PENDING' } }),
      db.order.count({ where: { status: 'DELIVERED' } }),
      db.order.count({ where: { status: 'CANCELLED' } }),
    ]);

    // Calculate total revenue from completed orders
    const revenueData = await db.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: {
        total: true,
        deliveryFee: true,
      },
    });

    const totalRevenue = revenueData._sum.total || 0;
    const deliveryRevenue = revenueData._sum.deliveryFee || 0;

    return {
      overview: {
        totalUsers,
        totalRestaurants,
        totalOrders,
        totalReviews,
        totalRevenue,
        deliveryRevenue,
      },
      orders: {
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
    };
  } catch (error: any) {
    logger.error('Error getting dashboard stats:', error);
    throw createError('Failed to get dashboard statistics', 500);
  }
}; /**
 * Get revenue statistics by date range
 */
export const getRevenueStats = async (
  startDate?: Date,
  endDate?: Date
): Promise<any> => {
  try {
    const whereClause: any = {
      status: 'DELIVERED',
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Get revenue totals
    const revenueData = await db.order.aggregate({
      where: whereClause,
      _sum: {
        total: true,
        deliveryFee: true,
        discount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalRevenue = revenueData._sum.total || 0;
    const deliveryFee = revenueData._sum.deliveryFee || 0;
    const discount = revenueData._sum.discount || 0;
    const orderCount = revenueData._count.id;

    // Get daily revenue breakdown
    const orders = await db.order.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        total: true,
        deliveryFee: true,
        discount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const dailyRevenue: any = {};
    orders.forEach((order: any) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = {
          date,
          revenue: 0,
          orders: 0,
          deliveryFee: 0,
          discount: 0,
        };
      }
      dailyRevenue[date].revenue += order.total;
      dailyRevenue[date].deliveryFee += order.deliveryFee;
      dailyRevenue[date].discount += order.discount || 0;
      dailyRevenue[date].orders += 1;
    });

    const dailyBreakdown = Object.values(dailyRevenue);

    return {
      summary: {
        totalRevenue,
        deliveryFee,
        discount,
        netRevenue: totalRevenue - discount,
        orderCount,
        averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
      },
      dailyBreakdown,
    };
  } catch (error: any) {
    logger.error('Error getting revenue stats:', error);
    throw createError('Failed to get revenue statistics', 500);
  }
};

/**
 * Get top performing restaurants by order count
 */
export const getTopRestaurants = async (limit: number = 10) => {
  try {
    const restaurants = await db.restaurant.findMany({
      include: {
        orders: {
          where: {
            status: 'DELIVERED',
          },
          select: {
            id: true,
            total: true,
          },
        },
      },
    });

    // Calculate metrics for each restaurant
    const restaurantStats = restaurants.map((restaurant: any) => {
      const orderCount = restaurant.orders.length;
      const totalRevenue = restaurant.orders.reduce(
        (sum: number, order: any) => sum + order.total,
        0
      );

      return {
        id: restaurant.id,
        name: restaurant.name,
        logo: restaurant.logo,
        rating: restaurant.rating,
        orderCount,
        totalRevenue,
        averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
      };
    });

    // Sort by order count and limit
    const topRestaurants = restaurantStats
      .sort((a: any, b: any) => b.orderCount - a.orderCount)
      .slice(0, limit);

    return topRestaurants;
  } catch (error: any) {
    logger.error('Error getting top restaurant:', error);
    throw createError('Failed to get top restaurants', 500);
  }
};

/**
 * Get popular food items across all restaurants
 */
export const getPopularFoodItems = async (limit: number = 10) => {
  try {
    // Get all order items with food details
    const orderItems = await db.orderItem.groupBy({
      by: ['menuItemId'],
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    // Get full food item details
    const foodItemIds = orderItems.map((item: any) => item.menuItemId);
    const foodItems = await db.menuItem.findMany({
      where: {
        id: { in: foodItemIds },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    // Combine data
    const popularItems = orderItems.map((orderItem: any) => {
      const foodItem: any = foodItems.find(
        (item: any) => item.id === orderItem.menuItemId
      );

      return {
        id: foodItem.id,
        name: foodItem.name,
        image: foodItem.image,
        price: foodItem.price,
        restaurant: foodItem.restaurants,
        timesOrdered: orderItem._count.id,
        totalQuantity: orderItem._sum.quantity,
        totalRevenue: orderItem._sum.price,
      };
    });

    return popularItems;
  } catch (error: any) {
    logger.error('Error getting popular food items:', error);
    throw createError('Failed to get popular food items', 500);
  }
};

/**
 * Get recent orders with details
 */
export const getRecentOrders = async (limit: number = 20) => {
  try {
    const orders = await db.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return orders;
  } catch (error: any) {
    logger.error('Error getting recent orders:', error);
    throw createError('Failed to get recent orders', 500);
  }
};

/**
 * Get user growth statistics
 */
export const getUserGrowthStats = async (days: number = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await db.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const dailyUsers: any = {};
    users.forEach((user: any) => {
      const date = user.createdAt.toISOString().split('T')[0];
      if (!dailyUsers[date]) {
        dailyUsers[date] = { date, count: 0 };
      }
      dailyUsers[date].count += 1;
    });

    const dailyGrowth = Object.values(dailyUsers);

    // Get total user count
    const totalUsers = await db.user.count();

    return {
      totalUsers,
      newuser: users.length,
      dailyGrowth,
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
    };
  } catch (error: any) {
    logger.error('Error getting user growth stats:', error);
    throw createError('Failed to get user growth statistics', 500);
  }
};
