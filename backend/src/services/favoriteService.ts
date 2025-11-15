/**
 * Favorite Service
 * Business logic for managing user's favorite restaurants and menu items
 */

import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Add restaurant to favorites
 */
export const addFavorite = async (
  userId: string,
  restaurantId: string
): Promise<any> => {
  // Check if restaurant exists
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    throw createError('Restaurant not found', 404);
  }

  // Check if already favorited
  const existingFavorite = await db.favoriteRestaurant.findFirst({
    where: {
      userId,
      restaurantId,
    },
  });

  if (existingFavorite) {
    throw createError('Restaurant already in favorites', 400);
  }

  // Add to favorites
  const favorite = await db.favoriteRestaurant.create({
    data: {
      id: `fav_${userId}_${restaurantId}_${Date.now()}`,
      userId,
      restaurantId,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          logo: true,
          coverImage: true,
          address: true,
          rating: true,
          deliveryFee: true,
          minOrderAmount: true,
          preparationTime: true,
          isOpen: true,
        },
      },
    },
  });

  logger.info(`User ${userId} added restaurant ${restaurantId} to favorites`);

  return favorite;
};

/**
 * Remove restaurant from favorites
 */
export const removeFavorite = async (
  userId: string,
  restaurantId: string
): Promise<void> => {
  // Find favorite
  const favorite = await db.favoriteRestaurant.findFirst({
    where: {
      userId,
      restaurantId,
    },
  });

  if (!favorite) {
    throw createError('Restaurant not in favorites', 404);
  }

  // Remove from favorites
  await db.favoriteRestaurant.delete({
    where: { id: favorite.id },
  });

  logger.info(
    `User ${userId} removed restaurant ${restaurantId} from favorites`
  );
};

/**
 * Get user's favorite restaurants
 */
export const getFavorites = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<any> => {
  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    db.favoriteRestaurant.findMany({
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
            coverImage: true,
            address: true,
            rating: true,
            deliveryFee: true,
            minOrderAmount: true,
            preparationTime: true,
            isOpen: true,
          },
        },
      },
    }),
    db.favoriteRestaurant.count({ where: { userId } }),
  ]);

  logger.info(
    `Retrieved ${favorites.length} favorites for user ${userId} (page ${page}/${Math.ceil(total / limit)})`
  );

  return {
    data: favorites,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Check if restaurant is favorited by user
 */
export const isFavorite = async (
  userId: string,
  restaurantId: string
): Promise<boolean> => {
  const favorite = await db.favoriteRestaurant.findFirst({
    where: {
      userId,
      restaurantId,
    },
  });

  return !!favorite;
};

/**
 * Get favorite IDs for user (helper for bulk checks)
 */
export const getFavoriteIds = async (userId: string): Promise<string[]> => {
  const favorites = await db.favoriteRestaurant.findMany({
    where: { userId },
    select: { restaurantId: true },
  });

  return favorites.map((f: any) => f.restaurantId);
};

// ============================================
// MENU ITEM FAVORITES
// ============================================

/**
 * Add menu item to favorites
 */
export const addMenuItemFavorite = async (
  userId: string,
  menuItemId: string
): Promise<any> => {
  // Check if menu item exists
  const menuItem = await db.menuItem.findUnique({
    where: { id: menuItemId },
  });

  if (!menuItem) {
    throw createError('Menu item not found', 404);
  }

  // Check if already favorited
  const existingFavorite = await db.favoriteMenuItem.findFirst({
    where: {
      userId,
      menuItemId,
    },
  });

  if (existingFavorite) {
    throw createError('Menu item already in favorites', 400);
  }

  // Add to favorites
  const favorite = await db.favoriteMenuItem.create({
    data: {
      id: `fav_menu_${userId}_${menuItemId}_${Date.now()}`,
      userId,
      menuItemId,
    },
    include: {
      menuItem: {
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          price: true,
          discountPrice: true,
          status: true,
          isVegetarian: true,
          isSpicy: true,
          restaurantId: true,
          restaurant: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      },
    },
  });

  logger.info(`User ${userId} added menu item ${menuItemId} to favorites`);

  return favorite;
};

/**
 * Remove menu item from favorites
 */
export const removeMenuItemFavorite = async (
  userId: string,
  menuItemId: string
): Promise<void> => {
  // Find favorite
  const favorite = await db.favoriteMenuItem.findFirst({
    where: {
      userId,
      menuItemId,
    },
  });

  if (!favorite) {
    throw createError('Menu item not in favorites', 404);
  }

  // Remove from favorites
  await db.favoriteMenuItem.delete({
    where: { id: favorite.id },
  });

  logger.info(`User ${userId} removed menu item ${menuItemId} from favorites`);
};

/**
 * Get user's favorite menu items
 */
export const getMenuItemFavorites = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<any> => {
  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    db.favoriteMenuItem.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        menuItem: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            price: true,
            discountPrice: true,
            status: true,
            isVegetarian: true,
            isSpicy: true,
            restaurantId: true,
            restaurant: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    }),
    db.favoriteMenuItem.count({ where: { userId } }),
  ]);

  logger.info(
    `Retrieved ${favorites.length} menu item favorites for user ${userId} (page ${page}/${Math.ceil(total / limit)})`
  );

  return {
    data: favorites,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Check if menu item is favorited by user
 */
export const isMenuItemFavorite = async (
  userId: string,
  menuItemId: string
): Promise<boolean> => {
  const favorite = await db.favoriteMenuItem.findFirst({
    where: {
      userId,
      menuItemId,
    },
  });

  return !!favorite;
};

/**
 * Get favorite menu item IDs for user (helper for bulk checks)
 */
export const getFavoriteMenuItemIds = async (
  userId: string
): Promise<string[]> => {
  const favorites = await db.favoriteMenuItem.findMany({
    where: { userId },
    select: { menuItemId: true },
  });

  return favorites.map((f: any) => f.menuItemId);
};
