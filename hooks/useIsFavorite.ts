"use client";

import { useEffect, useState } from "react";
import { favoriteService } from "@/lib/api";

export function useIsFavorite(menuItemId?: string) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!menuItemId) return;

    const checkFavorite = async () => {
      setLoading(true);
      try {
        const response = await favoriteService.isMenuItemFavorite(menuItemId);
        if (response.success && response.data) {
          setIsFavorite(response.data.isFavorite);
        }
      } catch (err) {
        console.error("Check favorite error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkFavorite();
  }, [menuItemId]);

  return { isFavorite, loading };
}
