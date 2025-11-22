/**
 * Food Item Service
 *
 * Handles all food item-related business logic:
 * - List food items with filters
 * - Get food item details
 * - Search food items
 * - Get popular food items
 */

import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Query parameters interface
interface FoodQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  restaurantId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all food items with filters and pagination
 */
export const getFoodItems = async (params: FoodQueryParams) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    restaurantId,
    minPrice,
    maxPrice,
    minRating,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  // Build where clause
  const where: any = {
    status: 'AVAILABLE',
  };

  // Search by name or description
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by category name
  if (category) {
    where.category = {
      name: category,
    };
  }

  // Filter by restaurant
  if (restaurantId) {
    where.restaurantId = restaurantId;
  }

  // Filter by price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const [foodItems, total] = await Promise.all([
    db.menuItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            logo: true,
            rating: true,
            isOpen: true,
            deliveryFee: true,
            preparationTime: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.menuItem.count({ where }),
  ]);

  logger.info(
    `Retrieved ${foodItems.length} food items (page ${page}/${Math.ceil(total / limit)})`
  );

  return {
    data: foodItems,
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
 * Get food item by ID with full details
 */
export const getFoodItemById = async (id: string) => {
  const foodItem = await db.menuItem.findUnique({
    where: { id },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          logo: true,
          address: true,
          phoneNumber: true,
          rating: true,
          isOpen: true,
          openingHours: true,
          deliveryFee: true,
          minOrderAmount: true,
          preparationTime: true,
        },
      },
    },
  });

  if (!foodItem) {
    throw createError('Food item not found', 404);
  }

  if (!foodItem.status) {
    logger.warn(`Attempted to access unavailable food item: ${id}`);
  }

  logger.info(`Retrieved food item: ${id} - ${foodItem.name}`);

  return foodItem;
};

/**
 * Search food items (simplified search)
 */
export const searchFoodItems = async (query: string) => {
  const foodItems = await db.menuItem.findMany({
    where: {
      status: 'AVAILABLE',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 30,
    orderBy: { createdAt: 'desc' },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          logo: true,
          isOpen: true,
          deliveryFee: true,
        },
      },
    },
  });

  logger.info(
    `Search query "${query}" returned ${foodItems.length} food items`
  );

  return foodItems;
};

/**
 * Get popular food items
 */
export const getPopularFoodItems = async (limit: number = 10) => {
  const foodItems = await db.menuItem.findMany({
    where: { status: 'AVAILABLE' },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          logo: true,
          isOpen: true,
          deliveryFee: true,
        },
      },
    },
  });

  logger.info(`Retrieved ${foodItems.length} popular food items`);

  return foodItems;
};

/**
 * Get all available categories
 */
export const getCategories = async () => {
  const categories = await db.restaurantCategory.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: { name: 'asc' },
  });

  const categoryList = categories.map(item => item.name).filter(Boolean);

  logger.info(`Retrieved ${categoryList.length} food categories`);

  return categoryList;
};

/**
 * Get food items by category
 */
export const getFoodItemsByCategory = async (
  category: string,
  limit: number = 20
) => {
  const foodItems = await db.menuItem.findMany({
    where: {
      categoryId: category,
      status: 'AVAILABLE',
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          logo: true,
          isOpen: true,
        },
      },
    },
  });

  logger.info(
    `Retrieved ${foodItems.length} food items in category: ${category}`
  );

  return foodItems;
};

/**
 * Advanced search for food items
 */
interface AdvancedFoodSearchParams {
  query?: string;
  category?: string;
  restaurantId?: string;
  minPrice?: number;
  maxPrice?: number;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  maxCalories?: number;
  maxPreparationTime?: number;
  page?: number;
  limit?: number;
}

export const advancedSearchFoodItems = async (
  params: AdvancedFoodSearchParams
): Promise<any> => {
  const {
    query,
    category,
    restaurantId,
    minPrice,
    maxPrice,
    isVegetarian,
    isSpicy,
    maxCalories,
    maxPreparationTime,
    page = 1,
    limit = 20,
  } = params;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    status: 'AVAILABLE',
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (restaurantId) {
    where.restaurantId = restaurantId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (isVegetarian !== undefined) {
    where.isVegetarian = isVegetarian;
  }

  if (isSpicy !== undefined) {
    where.isSpicy = isSpicy;
  }

  if (maxCalories !== undefined) {
    where.calories = { lte: maxCalories };
  }

  if (maxPreparationTime !== undefined) {
    where.preparationTime = { lte: maxPreparationTime };
  }

  const [foodItems, total] = await Promise.all([
    db.menuItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ discountPrice: 'asc' }, { price: 'asc' }],
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            logo: true,
            rating: true,
            isOpen: true,
            deliveryFee: true,
          },
        },
      },
    }),
    db.menuItem.count({ where }),
  ]);

  logger.info(
    `Advanced food search returned ${foodItems.length} items (page ${page}/${Math.ceil(total / limit)})`
  );

  return {
    data: foodItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Search food items across all restaurants
 */
export const globalFoodSearch = async (
  query: string,
  limit: number = 20
): Promise<any[]> => {
  const foodItems = await db.menuItem.findMany({
    where: {
      status: 'AVAILABLE',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    orderBy: [{ discountPrice: 'asc' }, { price: 'asc' }],
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          logo: true,
          rating: true,
          address: true,
          isOpen: true,
          deliveryFee: true,
        },
      },
    },
  });

  logger.info(
    `Global food search for "${query}" returned ${foodItems.length} items`
  );

  return foodItems;
};

/**
 * Get trending/popular food items
 */
export const getTrendingFoodItems = async (
  limit: number = 10
): Promise<any[]> => {
  // This would typically use order data to determine popularity
  // For now, we'll use items with discounts and high ratings
  const foodItems = await db.menuItem.findMany({
    where: {
      status: 'AVAILABLE',
      discountPrice: { not: null },
    },
    take: limit,
    orderBy: [{ createdAt: 'desc' }],
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          logo: true,
          rating: true,
          isOpen: true,
        },
      },
    },
  });

  logger.info(`Retrieved ${foodItems.length} trending food items`);

  return foodItems;
};
