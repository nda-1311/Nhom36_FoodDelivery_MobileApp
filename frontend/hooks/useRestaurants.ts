/**
 * Restaurant Hooks - React Query hooks for restaurant data
 */

import {
  Restaurant,
  restaurantService,
  SearchFilters,
} from "@/lib/api/restaurants";
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

/**
 * Get all restaurants with optional filters
 */
export function useRestaurants(
  filters?: SearchFilters
): UseQueryResult<Restaurant[], Error> {
  return useQuery({
    queryKey: ["restaurants", filters],
    queryFn: async () => {
      try {
        console.log("🏪 Fetching restaurants with filters:", filters);
        const response = await restaurantService.getRestaurants(filters);
        console.log("✅ Restaurants response:", {
          success: response.success,
          count: response.data?.length,
        });
        return response.data || [];
      } catch (error: any) {
        console.error("❌ Failed to fetch restaurants:", error);
        // Return empty array instead of throwing to prevent crash
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: false, // Don't retry on 500 errors
  });
}

/**
 * Search restaurants by name
 * Only triggers if search term has at least 2 characters
 */
export function useSearchRestaurants(
  searchTerm: string,
  filters?: SearchFilters
): UseQueryResult<Restaurant[], Error> {
  return useQuery({
    queryKey: ["restaurants", "search", searchTerm, filters],
    queryFn: async () => {
      // Validate minimum search length
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      try {
        console.log("🔍 Searching restaurants with term:", searchTerm);
        const response = await restaurantService.searchRestaurants(
          searchTerm,
          filters
        );
        console.log("✅ Search results:", response.data?.length || 0);
        return response.data || [];
      } catch (error: any) {
        console.error("❌ Restaurant search failed:", error);
        return [];
      }
    },
    enabled: searchTerm.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}

/**
 * Get a single restaurant by ID
 */
export function useRestaurant(
  restaurantId: string | undefined
): UseQueryResult<Restaurant | undefined, Error> {
  return useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return undefined;

      const response = await restaurantService.getRestaurantById(restaurantId);
      return response.data;
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get nearby restaurants
 */
export function useNearbyRestaurants(
  latitude: number | undefined,
  longitude: number | undefined,
  radius?: number
): UseQueryResult<Restaurant[], Error> {
  return useQuery({
    queryKey: ["restaurants", "nearby", latitude, longitude, radius],
    queryFn: async () => {
      if (!latitude || !longitude) return [];

      const response = await restaurantService.getNearbyRestaurants(
        latitude,
        longitude,
        radius
      );
      return response.data || [];
    },
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Prefetch a restaurant (useful for optimization)
 */
export function usePrefetchRestaurant() {
  const queryClient = useQueryClient();

  return (restaurantId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["restaurant", restaurantId],
      queryFn: async () => {
        const response = await restaurantService.getRestaurantById(
          restaurantId
        );
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
