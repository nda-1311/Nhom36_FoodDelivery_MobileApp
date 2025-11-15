import { apiClient, ApiResponse } from "./client";

export interface Review {
  id: string;
  userId: string;
  orderId: string;
  restaurantId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  orderId: string;
  restaurantId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

class ReviewService {
  /**
   * Create new review
   */
  async createReview(data: CreateReviewData): Promise<ApiResponse<Review>> {
    return apiClient.post<Review>("/reviews", data);
  }

  /**
   * Get user's reviews
   */
  async getMyReviews(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Review[]>> {
    return apiClient.get<Review[]>("/reviews/my-reviews", params as any);
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string): Promise<ApiResponse<Review>> {
    return apiClient.get<Review>(`/reviews/${id}`);
  }

  /**
   * Update review
   */
  async updateReview(
    id: string,
    data: UpdateReviewData
  ): Promise<ApiResponse<Review>> {
    return apiClient.put<Review>(`/reviews/${id}`, data);
  }

  /**
   * Delete review
   */
  async deleteReview(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/reviews/${id}`);
  }

  /**
   * Get restaurant reviews
   */
  async getRestaurantReviews(
    restaurantId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<Review[]>> {
    return apiClient.get<Review[]>(
      `/restaurants/${restaurantId}/reviews`,
      params as any
    );
  }
}

export const reviewService = new ReviewService();
