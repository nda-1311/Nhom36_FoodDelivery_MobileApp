import { apiClient, ApiResponse } from "./client";

export interface FavoriteMenuItem {
  id: string;
  userId: string;
  menuItemId: string;
  createdAt: string;
  updatedAt: string;
  menuItem: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    price: number;
    discountPrice?: number;
    status: string;
    isVegetarian: boolean;
    isSpicy: boolean;
    restaurantId: string;
    restaurant: {
      id: string;
      name: string;
      logo?: string;
    };
  };
}

export interface FavoriteRestaurant {
  id: string;
  userId: string;
  restaurantId: string;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    logo?: string;
    coverImage?: string;
    address: string;
    rating: number;
    deliveryFee: number;
    minOrderAmount: number;
    preparationTime: number;
    isOpen: boolean;
  };
}

export interface FavoritesListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class FavoriteService {
  // ============================================
  // MENU ITEM FAVORITES (Main use case)
  // ============================================

  /**
   * Add menu item to favorites
   */
  async addMenuItemToFavorites(
    menuItemId: string
  ): Promise<ApiResponse<FavoriteMenuItem>> {
    return apiClient.post<FavoriteMenuItem>("/favorites/menu-items", {
      menuItemId,
    });
  }

  /**
   * Remove menu item from favorites
   */
  async removeMenuItemFromFavorites(
    menuItemId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete(`/favorites/menu-items/${menuItemId}`);
  }

  /**
   * Get user's favorite menu items
   */
  async getMenuItemFavorites(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<FavoritesListResponse<FavoriteMenuItem>>> {
    return apiClient.get<FavoritesListResponse<FavoriteMenuItem>>(
      `/favorites/menu-items?page=${page}&limit=${limit}`
    );
  }

  /**
   * Check if menu item is in favorites
   */
  async isMenuItemFavorite(
    menuItemId: string
  ): Promise<ApiResponse<{ isFavorite: boolean; menuItemId: string }>> {
    return apiClient.get<{ isFavorite: boolean; menuItemId: string }>(
      `/favorites/menu-items/check/${menuItemId}`
    );
  }

  // ============================================
  // RESTAURANT FAVORITES
  // ============================================

  /**
   * Add restaurant to favorites
   */
  async addRestaurantToFavorites(
    restaurantId: string
  ): Promise<ApiResponse<FavoriteRestaurant>> {
    return apiClient.post<FavoriteRestaurant>("/favorites/restaurants", {
      restaurantId,
    });
  }

  /**
   * Remove restaurant from favorites
   */
  async removeRestaurantFromFavorites(
    restaurantId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete(`/favorites/restaurants/${restaurantId}`);
  }

  /**
   * Get user's favorite restaurants
   */
  async getRestaurantFavorites(
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<FavoritesListResponse<FavoriteRestaurant>>> {
    return apiClient.get<FavoritesListResponse<FavoriteRestaurant>>(
      `/favorites/restaurants?page=${page}&limit=${limit}`
    );
  }

  /**
   * Check if restaurant is in favorites
   */
  async isRestaurantFavorite(
    restaurantId: string
  ): Promise<ApiResponse<{ isFavorite: boolean; restaurantId: string }>> {
    return apiClient.get<{ isFavorite: boolean; restaurantId: string }>(
      `/favorites/restaurants/check/${restaurantId}`
    );
  }
}

export const favoriteService = new FavoriteService();
