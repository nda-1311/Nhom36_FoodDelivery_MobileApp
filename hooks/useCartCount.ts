"use client";

import { getCartKey } from "@/lib/cartKey";
import { supabase } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";

export function useCartCount() {
  const [cartKey, setCartKey] = useState<string>("");
  const [count, setCount] = useState<number>(0);

  const calcCount = useCallback((rows: { quantity?: number }[]) => {
    setCount(rows.reduce((s, r) => s + (Number(r.quantity) || 0), 0));
  }, []);

  const refresh = useCallback(async () => {
    if (!cartKey) return;
    const { data, error } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("cart_key", cartKey);
    if (!error && data) calcCount(data);
  }, [cartKey, calcCount]);

  useEffect(() => {
    (async () => setCartKey(await getCartKey()))();
  }, []);

  useEffect(() => {
    if (!cartKey) return;

    // lần đầu
    refresh();

    // realtime
    const channel = supabase
      .channel(`cart-count:${cartKey}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `cart_key=eq.${cartKey}`,
        },
        () => refresh()
      )
      .subscribe();

    // nghe event nội bộ để cập nhật tức thì sau khi add trong client
    const onBump = () => refresh();
    window.addEventListener("cart:changed", onBump);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("cart:changed", onBump);
    };
  }, [cartKey, refresh]);

  return { cartCount: count, refreshCartCount: refresh };
}
