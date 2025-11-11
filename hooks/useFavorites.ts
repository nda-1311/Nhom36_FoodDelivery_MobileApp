"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

type FavRow = {
  food_item_id: string;
  food_name?: string;
  food_image?: string;
  price?: number;
  created_at?: string;
};

export function useFavorites(userId?: string) {
  // Nếu không truyền userId, hook sẽ tự lo anonymous và lưu vào internalUserId
  const [internalUserId, setInternalUserId] = useState<string | undefined>(
    undefined
  );
  const effectiveUserId = userId ?? internalUserId;

  const [items, setItems] = useState<FavRow[]>([]);
  const [loading, setLoading] = useState(false);

  // === 1) Đảm bảo có anonymous session khi không truyền userId ===
  useEffect(() => {
    if (userId) return; // nếu đã truyền userId từ ngoài thì bỏ qua

    let mounted = true;

    (async () => {
      try {
        // lấy session hiện tại
        const { data: sessionData } = await supabase.auth.getSession();
        const existingUser = sessionData.session?.user;
        
        console.log("🔐 [useFavorites] Current session:", {
          hasSession: !!sessionData.session,
          userId: existingUser?.id,
          email: existingUser?.email,
          isAnonymous: existingUser?.is_anonymous,
        });

        if (existingUser?.id) {
          if (mounted) setInternalUserId(existingUser.id);
        } else {
          // chưa có -> đăng nhập ẩn danh
          console.log("⚠️ [useFavorites] No session, signing in anonymously...");
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error("❌ [useFavorites] Anonymous sign-in failed:", error);
            return;
          }
          console.log("✅ [useFavorites] Anonymous sign-in success:", data.user?.id);
          if (mounted && data.user) setInternalUserId(data.user.id);
        }
      } catch (e) {
        console.error("❌ [useFavorites] Session error:", e);
      }
    })();

    // theo dõi thay đổi auth nếu user đăng nhập/đăng xuất ở nơi khác
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user;
      if (!userId && u?.id) setInternalUserId(u.id);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, [userId]);

  // === 2) Fetch danh sách favorites của user ===
  const refresh = useCallback(async () => {
    if (!effectiveUserId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("favorites")
      .select("food_item_id, food_name, food_image, price, created_at")
      .eq("user_id", effectiveUserId)
      .order("created_at", { ascending: false });

    setLoading(false);
    if (!error && data) setItems(data as FavRow[]);
    else if (error) console.error(error);
  }, [effectiveUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // === 3) Realtime: lắng nghe mọi INSERT/UPDATE/DELETE trên favorites của user ===
  useEffect(() => {
    if (!effectiveUserId) return;

    const channel = supabase
      .channel(`favorites-${effectiveUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "favorites",
          filter: `user_id=eq.${effectiveUserId}`,
        },
        // đơn giản: refetch mỗi khi có thay đổi
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveUserId, refresh]);

  // === 4) Helpers ===
  const isFav = useCallback(
    (id: string) => items.some((i) => String(i.food_item_id) === String(id)),
    [items]
  );

  const add = useCallback(
    async (
      foodId: string,
      meta?: { name?: string; image?: string; price?: number }
    ) => {
      if (!effectiveUserId) {
        console.error("❌ [useFavorites] No userId available for add");
        return;
      }
      
      console.log("✅ [useFavorites] Adding favorite:", {
        userId: effectiveUserId,
        foodId,
        meta,
      });

      const payload: Record<string, any> = {
        user_id: effectiveUserId,
        food_item_id: String(foodId),
      };
      if (meta?.name) payload.food_name = meta.name;
      if (meta?.image) payload.food_image = meta.image;
      if (meta?.price != null) payload.price = meta.price;

      const { data, error } = await supabase.from("favorites").insert(payload).select();
      
      if (error) {
        console.error("❌ [useFavorites] Insert error:", error);
        throw error;
      }
      
      console.log("✅ [useFavorites] Insert success:", data);

      // Optimistic update (realtime cũng sẽ refresh)
      setItems((prev) =>
        prev.some((p) => String(p.food_item_id) === String(foodId))
          ? prev
          : [
              {
                food_item_id: String(foodId),
                food_name: meta?.name,
                food_image: meta?.image,
                price: meta?.price,
              },
              ...prev,
            ]
      );
    },
    [effectiveUserId]
  );

  const remove = useCallback(
    async (foodId: string) => {
      if (!effectiveUserId) {
        console.error("❌ [useFavorites] No userId available for remove");
        return;
      }
      
      console.log("✅ [useFavorites] Removing favorite:", {
        userId: effectiveUserId,
        foodId,
      });

      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", effectiveUserId)
        .eq("food_item_id", String(foodId));
      
      if (error) {
        console.error("❌ [useFavorites] Delete error:", error);
        throw error;
      }
      
      console.log("✅ [useFavorites] Delete success");

      // Optimistic update (realtime cũng sẽ refresh)
      setItems((prev) =>
        prev.filter((i) => String(i.food_item_id) !== String(foodId))
      );
    },
    [effectiveUserId]
  );

  const toggle = useCallback(
    async (
      foodId: string,
      meta?: { name?: string; image?: string; price?: number }
    ) => {
      if (isFav(foodId)) await remove(foodId);
      else await add(foodId, meta);
      // refresh() không bắt buộc vì đã có realtime + optimistic,
      // nhưng giữ lại để chắc chắn đồng bộ
      refresh();
    },
    [isFav, add, remove, refresh]
  );

  return {
    items,
    loading,
    isFav,
    add,
    remove,
    toggle,
    refresh,
    userId: effectiveUserId,
  };
}
