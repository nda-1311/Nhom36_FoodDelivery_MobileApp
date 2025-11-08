// hooks/useFavorites.ts
"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAnonUser } from "./useAnonUser";

type FavRow = {
  id?: string; // nếu có PK id
  user_id?: string;
  food_item_id: string;
  food_name?: string;
  food_image?: string;
  price?: number;
  created_at?: string;
};

export function useFavorites() {
  const { userId, loading: loadingUser } = useAnonUser();
  const [items, setItems] = useState<FavRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("favorites")
      .select(
        "id, user_id, food_item_id, food_name, food_image, price, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setItems(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!userId || loadingUser) return;
    // fetch lần đầu
    refresh();

    // ---- Realtime subscription ----
    // Lắng nghe tất cả thay đổi trên bảng favorites của user hiện tại
    const channel = supabase
      .channel(`favorites-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT | UPDATE | DELETE
          schema: "public",
          table: "favorites",
          filter: `user_id=eq.${userId}`, // chỉ dữ liệu của user này
        },
        (_payload) => {
          // đơn giản nhất: refetch
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadingUser, refresh]);

  return { items, loading: loading || loadingUser, userId, refresh };
}
