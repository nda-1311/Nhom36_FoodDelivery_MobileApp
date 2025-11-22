"use client";

import { favoriteService } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

type FavRow = {
  food_item_id: string;
  food_name?: string;
  food_image?: string;
  price?: number;
  created_at?: string;
};

export function useFavorites() {
  const [items, setItems] = useState<FavRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Import apiClient để kiểm tra token
      const { apiClient } = await import("@/lib/api/client");
      const token = await apiClient.getAccessToken();

      if (!token) {
        console.log("No auth token available, skipping favorites fetch");
        setItems([]);
        setLoading(false);
        return;
      }

      const response = await favoriteService.getMenuItemFavorites(1, 50);
      console.log("Favorites API response:", response);

      if (response.success && response.data) {
        // Backend trả về { success, message, data: [...], pagination }
        // response.data là mảng favorites trực tiếp
        const favoritesArray = Array.isArray(response.data)
          ? response.data
          : [];

        const transformed: FavRow[] = favoritesArray.map((fav: any) => ({
          food_item_id: fav.menuItem.id,
          food_name: fav.menuItem.name,
          food_image: fav.menuItem.image,
          price: fav.menuItem.price,
          created_at: fav.createdAt,
        }));
        console.log("Transformed favorites:", transformed);
        setItems(transformed);
      } else {
        setError(response.error || "Failed to fetch favorites");
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Failed to fetch favorites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Delay để đảm bảo token đã load
    const timer = setTimeout(() => {
      refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [refresh]);

  const isFav = useCallback(
    (id: string) => items.some((i) => String(i.food_item_id) === String(id)),
    [items]
  );

  const add = useCallback(
    async (
      foodId: string,
      meta?: { name?: string; image?: string; price?: number }
    ) => {
      try {
        // Check if user is logged in
        const { apiClient } = await import("@/lib/api/client");
        const token = await apiClient.getAccessToken();

        if (!token) {
          throw new Error("Vui lòng đăng nhập để thêm vào yêu thích");
        }

        const response = await favoriteService.addMenuItemToFavorites(foodId);

        if (response.success && response.data) {
          // ✅ Cập nhật local state thay vì fetch lại
          const newFav: FavRow = {
            food_item_id: response.data.menuItemId,
            food_name: meta?.name,
            food_image: meta?.image,
            price: meta?.price,
            created_at: response.data.createdAt,
          };
          setItems((prev) => [...prev, newFav]);
        } else {
          throw new Error(response.error || "Failed to add favorite");
        }
      } catch (err) {
        console.error("Add favorite error:", err);
        throw err;
      }
    },
    []
  );

  const remove = useCallback(async (foodId: string) => {
    try {
      // Check if user is logged in
      const { apiClient } = await import("@/lib/api/client");
      const token = await apiClient.getAccessToken();

      if (!token) {
        throw new Error("Vui lòng đăng nhập để quản lý yêu thích");
      }

      const response = await favoriteService.removeMenuItemFromFavorites(
        foodId
      );

      if (response.success) {
        // ✅ Cập nhật local state thay vì fetch lại
        setItems((prev) =>
          prev.filter((item) => String(item.food_item_id) !== String(foodId))
        );
      } else {
        throw new Error(response.error || "Failed to remove favorite");
      }
    } catch (err) {
      console.error("Remove favorite error:", err);
      throw err;
    }
  }, []);

  const toggle = useCallback(
    async (
      foodId: string,
      meta?: { name?: string; image?: string; price?: number }
    ) => {
      if (isFav(foodId)) {
        await remove(foodId);
      } else {
        await add(foodId, meta);
      }
    },
    [isFav, add, remove]
  );

  return { items, loading, error, isFav, add, remove, toggle, refresh };
}
