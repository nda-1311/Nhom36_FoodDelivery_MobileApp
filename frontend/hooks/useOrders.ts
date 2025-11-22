/**
 * useOrders.ts
 *
 * React Query hooks for order operations
 */

import { getAuthToken } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:5000/api/v1";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  items: {
    id: string;
    quantity: number;
    menuItem: {
      name: string;
      price: number;
      image?: string;
    };
  }[];
}

interface OrderTracking {
  orderId: string;
  status: string;
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
  message: string;
}

// Fetch user orders
export const useOrders = (status?: string) => {
  return useQuery<Order[]>({
    queryKey: status ? queryKeys.orders.list(status) : queryKeys.orders.lists(),
    queryFn: async () => {
      const url = status
        ? `${API_BASE_URL}/orders?status=${status}`
        : `${API_BASE_URL}/orders`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const json = await response.json();
      // Backend returns { success: true, data: [...] }
      return json.data || json;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
};

// Fetch order by ID
export const useOrder = (orderId: string) => {
  return useQuery<Order>({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch order");
      const json = await response.json();
      // Backend returns { success: true, data: {...} }
      return json.data || json;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
    enabled: !!orderId,
  });
};

// Fetch order tracking
export const useOrderTracking = (orderId: string) => {
  return useQuery<OrderTracking[]>({
    queryKey: ["orders", orderId, "tracking"],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/tracking`,
        {
          headers: {
            Authorization: `Bearer ${await getAuthToken()}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch order tracking");
      const json = await response.json();
      // Backend returns { success: true, data: [...] }
      return json.data || json;
    },
    staleTime: 15 * 1000, // 15 seconds (real-time updates)
    gcTime: 2 * 60 * 1000,
    refetchInterval: 15000, // Auto-refetch every 15s
    enabled: !!orderId,
  });
};

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      cartId: string;
      deliveryAddress: string;
      paymentMethod: string;
      note?: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error("Failed to create order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items() });
    },
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => {
      console.log(
        "📤 Calling cancel API:",
        `${API_BASE_URL}/orders/${orderId}/cancel`
      );
      console.log("📤 Reason:", reason);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({ reason }),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Cancel API error:", errorData);
        throw new Error(errorData.message || "Failed to cancel order");
      }

      const data = await response.json();
      console.log("✅ Cancel API success:", data);
      return data;
    },
    onSuccess: (data, { orderId }) => {
      console.log("🔄 Invalidating queries for order:", orderId);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(orderId),
      });
    },
    onError: (error) => {
      console.error("❌ useCancelOrder mutation error:", error);
    },
  });
};

// No longer need getToken helper - using getAuthToken from api-client
