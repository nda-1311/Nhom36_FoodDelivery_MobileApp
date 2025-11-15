"use client";

import { cartService } from "@/lib/api";
import { apiClient } from "@/lib/api/client";
import { useCallback, useEffect, useState } from "react";

export function useCartCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    // Check if user is authenticated before calling API
    const token = await apiClient.getAccessToken();
    if (!token) {
      setCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await cartService.getCart();
      if (response.success && response.data) {
        const total = response.data.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCount(total);
      } else {
        setCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Listen to custom events for immediate updates after add/remove
    const onCartChanged = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("cart:changed", onCartChanged);
      return () => {
        window.removeEventListener("cart:changed", onCartChanged);
      };
    }
  }, [refresh]);

  return { cartCount: count, refreshCartCount: refresh, loading };
}
