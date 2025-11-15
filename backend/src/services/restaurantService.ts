/**
 * Restaurant Service
 *
 * Handles all restaurant-related business logic:
 * - List restaurants with filters and pagination
 * - Get restaurant details
 * - Search restaurants
 * - Get restaurant menu (food items)
 */

import { Prisma } from '@prisma/client';
import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Query parameters interface
interface RestaurantQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  minRating?: number;
  isOpen?: boolean;
}

/**
 * Get all restaurants with filters and pagination
 */
export const getRestaurants = async (params: RestaurantQueryParams) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    minRating,
    isOpen,
  } = params;

  // Build where clause
  const where: Prisma.RestaurantWhereInput = {};

  // Search by name or address
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by minimum rating
  if (minRating !== undefined) {
    where.rating = { gte: minRating };
  }

  // Filter by open status
  if (isOpen !== undefined) {
    where.isOpen = isOpen;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const [restaurants, total] = await Promise.all([
    db.restaurant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        logo: true,
        coverImage: true,
        address: true,
        phoneNumber: true,
        rating: true,
        isOpen: true,
        openingHours: true,
        deliveryFee: true,
        minOrderAmount: true,
        preparationTime: true,
        createdAt: true,
      },
    }),
    db.restaurant.count({ where }),
  ]);

  logger.info(
    `Retrieved ${restaurants.length} restaurants (page ${page}/${Math.ceil(total / limit)})`
  );

  return {
    data: restaurants,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

/**
 * Get restaurant by ID with full details
 */
export const getRestaurantById = async (id: string) => {
  const restaurant = await db.restaurant.findUnique({
    where: { id },
    include: {
      menuItems: {
        where: { status: 'AVAILABLE' },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          categoryId: true,
          status: true,
        },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!restaurant) {
    throw createError('Restaurant not found', 404);
  }

  logger.info(`Retrieved restaurant: ${id} - ${restaurant.name}`);

  return restaurant;
};

/**
 * Get restaurant menu (food items only)
 */
export const getRestaurantMenu = async (
  restaurantId: string,
  params: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }
) => {
  const { category, search, minPrice, maxPrice } = params;

  // Verify restaurant exists
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, name: true },
  });

  if (!restaurant) {
    throw createError('Restaurant not found', 404);
  }

  // Build where clause
  const where: any = {
    restaurantId,
    status: 'AVAILABLE',
  };

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  const foodItems = await db.menuItem.findMany({
    where,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      categoryId: true,
      status: true,
      isVegetarian: true,
      isSpicy: true,
      calories: true,
      preparationTime: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  logger.info(
    `Retrieved ${foodItems.length} food items for restaurant: ${restaurantId}`
  );

  return {
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
    },
    foodItems,
    count: foodItems.length,
  };
};

/**
 * Search restaurants (simplified search endpoint)
 */
export const searchRestaurants = async (query: string) => {
  const restaurants = await db.restaurant.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 20,
    orderBy: { rating: 'desc' },
    select: {
      id: true,
      name: true,
      logo: true,
      address: true,
      rating: true,
      isOpen: true,
      deliveryFee: true,
      preparationTime: true,
    },
  });

  logger.info(`Search query "${query}" returned ${restaurants.length} results`);

  return restaurants;
};

/**
 * Get restaurant categories (unique categories from food items)
 */
export const getRestaurantCategories = async (restaurantId: string) => {
  const categories = await db.restaurantCategory.findMany({
    where: { restaurantId },
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: { name: 'asc' },
  });

  return categories;
};

/**
 * Search restaurants with advanced filters
 */
interface AdvancedSearchParams {
  query?: string;
  minRating?: number;
  maxDeliveryFee?: number;
  minOrderAmount?: number;
  maxPreparationTime?: number;
  isOpen?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
  page?: number;
  limit?: number;
}

export const advancedSearchRestaurants = async (
  params: AdvancedSearchParams
): Promise<any> => {
  const {
    query,
    minRating,
    maxDeliveryFee,
    minOrderAmount,
    maxPreparationTime,
    isOpen,
    latitude,
    longitude,
    radius = 10,
    page = 1,
    limit = 20,
  } = params;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { address: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (minRating !== undefined) {
    where.rating = { gte: minRating };
  }

  if (maxDeliveryFee !== undefined) {
    where.deliveryFee = { lte: maxDeliveryFee };
  }

  if (minOrderAmount !== undefined) {
    where.minOrderAmount = { lte: minOrderAmount };
  }

  if (maxPreparationTime !== undefined) {
    where.preparationTime = { lte: maxPreparationTime };
  }

  if (isOpen !== undefined) {
    where.isOpen = isOpen;
  }

  // Get all restaurants matching criteria
  const [restaurants, total] = await Promise.all([
    db.restaurant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        coverImage: true,
        address: true,
        latitude: true,
        longitude: true,
        rating: true,
        totalReviews: true,
        isOpen: true,
        deliveryFee: true,
        minOrderAmount: true,
        preparationTime: true,
      },
    }),
    db.restaurant.count({ where }),
  ]);

  // Filter by distance if coordinates provided
  let filteredRestaurants = restaurants;
  if (latitude !== undefined && longitude !== undefined) {
    filteredRestaurants = restaurants.filter((restaurant: any) => {
      if (restaurant.latitude === null || restaurant.longitude === null) {
        return false;
      }

      const distance = calculateDistance(
        latitude,
        longitude,
        restaurant.latitude,
        restaurant.longitude
      );

      return distance <= radius;
    });
  }

  logger.info(
    `Advanced search returned ${filteredRestaurants.length} restaurants (page ${page}/${Math.ceil(total / limit)})`
  );

  return {
    data: filteredRestaurants,
    pagination: {
      page,
      limit,
      total: filteredRestaurants.length,
      totalPages: Math.ceil(filteredRestaurants.length / limit),
    },
  };
};

/**
 * Get nearby restaurants by coordinates
 */
export const getNearbyRestaurants = async (
  latitude: number,
  longitude: number,
  radius: number = 5, // km
  limit: number = 20
): Promise<any[]> => {
  // Get all active restaurants with coordinates
  const restaurants = await db.restaurant.findMany({
    where: {
      isOpen: true,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      name: true,
      logo: true,
      address: true,
      latitude: true,
      longitude: true,
      rating: true,
      totalReviews: true,
      deliveryFee: true,
      minOrderAmount: true,
      preparationTime: true,
      isOpen: true,
    },
  });

  // Calculate distance and filter
  const restaurantsWithDistance = restaurants
    .map((restaurant: any) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        restaurant.latitude!,
        restaurant.longitude!
      );

      return {
        ...restaurant,
        distance: parseFloat(distance.toFixed(2)),
      };
    })
    .filter((r: any) => r.distance <= radius)
    .sort((a: any, b: any) => a.distance - b.distance)
    .slice(0, limit);

  logger.info(
    `Found ${restaurantsWithDistance.length} restaurants within ${radius}km`
  );

  return restaurantsWithDistance;
};

/**
 * Helper: Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
