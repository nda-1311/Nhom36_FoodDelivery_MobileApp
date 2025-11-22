/**
 * useCart.ts
 *
 * React Query hooks for cart operations with optimistic updates
 */

import { API_BASE_URL, getAuthToken } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  menuItem: {
    id: string;
    name: string;
    price: number;
    image?: string; // Prisma field name
    imageUrl?: string; // Legacy field
    restaurant: {
      id: string;
      name: string;
    };
  };
}

interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

// Fetch cart
export const useCart = () => {
  return useQuery<Cart>({
    queryKey: queryKeys.cart.list,
    queryFn: async () => {
      console.log("🔍 useCart - Fetching cart data...");
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      });

      console.log("🔍 useCart - Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ useCart - Fetch failed:", errorText);
        throw new Error("Failed to fetch cart");
      }

      const result = await response.json();
      console.log("✅ useCart - Raw response:", result);

      // Backend returns { success, data: { items, summary } }
      // We need to extract data properly
      if (result.success && result.data) {
        const cartData = {
          id: "cart", // Static ID since backend doesn't return cart ID in this endpoint
          items: result.data.items || [],
          total: result.data.summary?.total || 0,
        };
        console.log("✅ useCart - Parsed cart data:", cartData);
        return cartData;
      }

      throw new Error("Invalid cart response");
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};

// Add item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      menuItemId,
      quantity,
    }: {
      menuItemId: string;
      quantity: number;
    }) => {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({ menuItemId, quantity }),
      });
      if (!response.ok) throw new Error("Failed to add to cart");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.list });
    },
  });
};

// Update cart item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error("Failed to update cart item");
      return response.json();
    },
    // Optimistic update
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.list });

      const previousCart = queryClient.getQueryData<Cart>(queryKeys.cart.list);

      if (previousCart) {
        queryClient.setQueryData<Cart>(queryKeys.cart.list, {
          ...previousCart,
          items: previousCart.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.list, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.list });
    },
  });
};

// Remove item from cart
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error("Failed to remove cart item");
      return response.json();
    },
    // Optimistic update
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.list });

      const previousCart = queryClient.getQueryData<Cart>(queryKeys.cart.list);

      if (previousCart) {
        queryClient.setQueryData<Cart>(queryKeys.cart.list, {
          ...previousCart,
          items: previousCart.items.filter((item) => item.id !== itemId),
        });
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.list, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.list });
    },
  });
};

// Clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error("Failed to clear cart");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.list });
    },
  });
};

// Helper is no longer needed - using getAuthToken from api-client
