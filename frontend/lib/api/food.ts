import { apiClient, ApiResponse } from "./client";

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId?: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  discountPrice?: number;
  status: string;
  isVegetarian: boolean;
  isSpicy: boolean;
  calories?: number;
  preparationTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuFilters {
  restaurantId?: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  status?: string;
  sortBy?: "price" | "name" | "popularity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

class FoodService {
  /**
   * Get menu items with filters
   */
  async getMenuItems(filters?: MenuFilters): Promise<ApiResponse<MenuItem[]>> {
    return apiClient.get<MenuItem[]>("/food", filters);
  }

  /**
   * Get menu item by ID
   */
  async getMenuItemById(id: string): Promise<ApiResponse<MenuItem>> {
    return apiClient.get<MenuItem>(`/food/${id}`);
  }

  /**
   * Get menu items by restaurant
   */
  async getRestaurantMenu(
    restaurantId: string,
    filters?: MenuFilters
  ): Promise<ApiResponse<MenuItem[]>> {
    return apiClient.get<MenuItem[]>(
      `/restaurants/${restaurantId}/menu`,
      filters
    );
  }

  /**
   * Search menu items
   */
  async searchMenuItems(
    query: string,
    filters?: MenuFilters
  ): Promise<ApiResponse<MenuItem[]>> {
    return apiClient.get<MenuItem[]>("/food/search", {
      q: query,
      ...filters,
    });
  }

  /**
   * Get popular menu items
   */
  async getPopularItems(limit?: number): Promise<ApiResponse<MenuItem[]>> {
    return apiClient.get<MenuItem[]>("/food/popular", { limit });
  }

  /**
   * Get food categories
   */
  async getCategories(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>("/food/categories");
  }
}

export const foodService = new FoodService();
