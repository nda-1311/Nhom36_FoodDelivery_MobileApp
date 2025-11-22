import { QueryClient } from "@tanstack/react-query";

/**
 * React Query Client Configuration
 *
 * Global configuration cho caching và data fetching
 * - staleTime: Thời gian data được coi là "fresh" (5 phút)
 * - cacheTime: Thời gian lưu cache trước khi xóa (10 phút)
 * - refetchOnWindowFocus: Tắt refetch khi focus lại app
 * - retry: Số lần retry khi API fail (2 lần)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data fresh trong 5 phút
      gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
      refetchOnWindowFocus: false, // Không refetch khi focus lại
      refetchOnReconnect: true, // Refetch khi reconnect internet
      retry: 2, // Retry 2 lần nếu fail
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1, // Mutations chỉ retry 1 lần
    },
  },
});

/**
 * Query Keys - Centralized key management
 * Giúp invalidate cache dễ dàng hơn
 */
export const queryKeys = {
  // Restaurants
  restaurants: {
    all: ["restaurants"] as const,
    lists: () => [...queryKeys.restaurants.all, "list"] as const,
    list: (filters?: any) =>
      [...queryKeys.restaurants.lists(), filters] as const,
    details: () => [...queryKeys.restaurants.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.restaurants.details(), id] as const,
  },

  // Food Items
  food: {
    all: ["food"] as const,
    lists: () => [...queryKeys.food.all, "list"] as const,
    list: (restaurantId?: string) =>
      [...queryKeys.food.lists(), restaurantId] as const,
    details: () => [...queryKeys.food.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.food.details(), id] as const,
    search: (query: string) =>
      [...queryKeys.food.all, "search", query] as const,
  },

  // Orders
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (status?: string) => [...queryKeys.orders.lists(), status] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // Cart
  cart: {
    all: ["cart"] as const,
    list: ["cart", "list"] as const,
    items: () => [...queryKeys.cart.all, "items"] as const,
  },

  // User
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    addresses: () => [...queryKeys.user.all, "addresses"] as const,
    favorites: () => [...queryKeys.user.all, "favorites"] as const,
  },
};
