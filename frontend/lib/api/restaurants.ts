import { apiClient, ApiResponse } from "./client";

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  image?: string; // Alias for coverImage
  imageUrl?: string; // Legacy field
  address: string;
  latitude?: number;
  longitude?: number;
  phoneNumber: string;
  email?: string;
  openingHours: any;
  rating: number;
  totalReviews: number;
  status: string;
  isOpen: boolean;
  deliveryFee: number;
  deliveryTime?: string; // Formatted delivery time
  minOrderAmount: number;
  preparationTime: number;
  cuisine?: string; // Restaurant cuisine type
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  search?: string;
  category?: string;
  minRating?: number;
  maxDeliveryFee?: number;
  isOpen?: boolean;
  sortBy?: "rating" | "deliveryFee" | "preparationTime";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

class RestaurantService {
  /**
   * Get all restaurants with optional filters
   */
  async getRestaurants(
    filters?: SearchFilters
  ): Promise<ApiResponse<Restaurant[]>> {
    return apiClient.get<Restaurant[]>("/restaurants", filters);
  }

  /**
   * Get restaurant by ID
   */
  async getRestaurantById(id: string): Promise<ApiResponse<Restaurant>> {
    return apiClient.get<Restaurant>(`/restaurants/${id}`);
  }

  /**
   * Search restaurants
   */
  async searchRestaurants(
    query: string,
    filters?: SearchFilters
  ): Promise<ApiResponse<Restaurant[]>> {
    return apiClient.get<Restaurant[]>("/restaurants/search", {
      q: query,
      ...filters,
    });
  }

  /**
   * Get restaurant categories
   */
  async getCategories(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>("/restaurants/categories");
  }

  /**
   * Get nearby restaurants
   */
  async getNearbyRestaurants(
    latitude: number,
    longitude: number,
    radius?: number
  ): Promise<ApiResponse<Restaurant[]>> {
    return apiClient.get<Restaurant[]>("/restaurants/nearby", {
      latitude,
      longitude,
      radius,
    } as any);
  }

  /**
   * Get restaurant menu items
   */
  async getRestaurantMenu(restaurantId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/restaurants/${restaurantId}/menu`);
  }

  /**
   * Get restaurant reviews
   */
  async getRestaurantReviews(
    restaurantId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/restaurants/${restaurantId}/reviews`, {
      page,
      limit,
    } as any);
  }
}

export const restaurantService = new RestaurantService();
