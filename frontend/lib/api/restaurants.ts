import { apiClient, ApiResponse } from "./client";

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
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
  minOrderAmount: number;
  preparationTime: number;
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
    return apiClient.get<Restaurant[]>("/restaurants", filters as any);
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
      search: query,
      ...filters,
    } as any);
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
}

export const restaurantService = new RestaurantService();
