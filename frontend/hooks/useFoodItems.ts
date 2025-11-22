/**
 * Food Items Hooks - React Query hooks for food/menu items
 */

import { foodService, MenuFilters, MenuItem } from "@/lib/api/food";
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

/**
 * Get all food items with optional filters
 */
export function useFoodItems(
  filters?: MenuFilters
): UseQueryResult<MenuItem[], Error> {
  return useQuery({
    queryKey: ["food", "list", filters],
    queryFn: async () => {
      const response = await foodService.getMenuItems(filters);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get deal/promotional food items
 */
export function useDealFoods(): UseQueryResult<MenuItem[], Error> {
  return useQuery({
    queryKey: ["food", "deals"],
    queryFn: async () => {
      console.log("🎯 Fetching deal foods...");
      // Try to get items with discountPrice first
      const response = await foodService.getMenuItems();
      const allItems = response.data || [];
      console.log("📦 Total items fetched:", allItems.length);

      const dealsWithDiscount = allItems.filter(
        (item) => item.discountPrice && item.discountPrice > 0
      );
      console.log("💰 Items with discount:", dealsWithDiscount.length);

      // If no discounted items, return popular items instead
      if (dealsWithDiscount.length === 0) {
        console.log("⚠️ No discounted items, using popular items as deals");
        const popularResponse = await foodService.getPopularItems(10);
        return popularResponse.data || [];
      }

      return dealsWithDiscount;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Search food items by name
 * Only triggers if search term has at least 2 characters
 */
export function useSearchFood(
  searchTerm: string,
  filters?: MenuFilters
): UseQueryResult<MenuItem[], Error> {
  return useQuery({
    queryKey: ["food", "search", searchTerm, filters],
    queryFn: async () => {
      // Validate minimum search length
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      try {
        console.log("🔍 Searching food with term:", searchTerm);
        const response = await foodService.searchMenuItems(searchTerm, filters);
        console.log(
          "📦 Full search response:",
          JSON.stringify(response, null, 2)
        );
        console.log("📊 Search results count:", response.data?.length || 0);

        if (response.data && response.data.length > 0) {
          console.log("🍕 First item:", response.data[0].name);
          console.log("🍕 Second item:", response.data[1]?.name);
          console.log("🍕 Third item:", response.data[2]?.name);
        }

        return response.data || [];
      } catch (error: any) {
        console.error("❌ Search failed:", error);
        // Return empty array instead of throwing
        return [];
      }
    },
    enabled: searchTerm.trim().length >= 2,
    staleTime: 0, // Disable cache for search
    gcTime: 0, // Clear immediately
    retry: false, // Don't retry on errors
  });
}

/**
 * Get menu items for a specific restaurant
 */
export function useRestaurantFood(
  restaurantId: string | undefined
): UseQueryResult<MenuItem[], Error> {
  return useQuery({
    queryKey: ["food", "restaurant", restaurantId],
    queryFn: async () => {
      console.log("🍽️ useRestaurantFood - Fetching menu for:", restaurantId);

      if (!restaurantId) {
        console.log("⚠️ No restaurantId provided");
        return [];
      }

      try {
        const response = await foodService.getRestaurantMenu(restaurantId);
        console.log("✅ Menu API Response:", {
          success: response.success,
          dataType: typeof response.data,
          dataKeys: response.data ? Object.keys(response.data) : [],
          foodItems: (response.data as any)?.foodItems,
          foodItemsLength: (response.data as any)?.foodItems?.length,
        });

        // Backend returns {restaurant, foodItems, count}, we need foodItems array
        const menuData = response.data as any;
        return menuData?.foodItems || [];
      } catch (error) {
        console.error("❌ Error fetching restaurant menu:", error);
        throw error;
      }
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get a single food item by ID
 */
export function useFoodItem(
  foodId: string | undefined
): UseQueryResult<MenuItem | undefined, Error> {
  return useQuery({
    queryKey: ["food", foodId],
    queryFn: async () => {
      if (!foodId) return undefined;

      const response = await foodService.getMenuItemById(foodId);
      return response.data;
    },
    enabled: !!foodId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get popular food items
 */
export function usePopularFood(
  limit: number = 10
): UseQueryResult<MenuItem[], Error> {
  return useQuery({
    queryKey: ["food", "popular", limit],
    queryFn: async () => {
      const response = await foodService.getPopularItems(limit);
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - popular items don't change often
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Prefetch a food item (useful for optimization)
 */
export function usePrefetchFoodItem() {
  const queryClient = useQueryClient();

  return (foodId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["food", foodId],
      queryFn: async () => {
        const response = await foodService.getMenuItemById(foodId);
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
