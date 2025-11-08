"use client";
import { getCartKey } from "@/lib/cartKey";
import { supabase } from "@/lib/supabase/client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

// ========================
// 🧩 Kiểu dữ liệu giỏ hàng
// ========================
export type CartItem = {
  id: string | number;
  name: string;
  price: number;
  qty: number;
  image?: string;
  meta?: any; // ví dụ size, topping, ghi chú
};

type State = { items: CartItem[] };

type Action =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; id: CartItem["id"] }
  | { type: "SET_QTY"; id: CartItem["id"]; qty: number }
  | { type: "CLEAR" };

// ========================
// 🧠 Context Interface
// ========================
const CartCtx = createContext<{
  state: State;
  addItem: (item: CartItem) => void;
  removeItem: (id: CartItem["id"]) => void;
  setQty: (id: CartItem["id"], qty: number) => void;
  clear: () => void;
  badgeCount: number;
  totalPrice: number;
  cartCount: number;
  setCartCount: (n: number) => void;
  syncFromServer: (items: CartItem[]) => void;
} | null>(null);

// ========================
// ⚙️ Reducer xử lý logic
// ========================
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_ITEM": {
      const idx = state.items.findIndex(
        (it) => String(it.id) === String(action.payload.id)
      );
      if (idx === -1) {
        return { items: [...state.items, action.payload] };
      }
      const items = state.items.slice();
      items[idx] = { ...items[idx], qty: items[idx].qty + action.payload.qty };
      return { items };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter((it) => String(it.id) !== String(action.id)),
      };
    case "SET_QTY": {
      const items = state.items.map((it) =>
        String(it.id) === String(action.id) ? { ...it, qty: action.qty } : it
      );
      return { items };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

// ========================
// 🧭 Provider Component
// ========================
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [cartCount, setCartCount] = useState(0);

  // 🧩 Hàm load lại số lượng giỏ hàng
  const refreshCartCount = async (key: string) => {
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("cart_key", key);
    setCartCount(count || 0);
  };

  // ✅ Realtime toàn cục: hoạt động ở mọi trang
  useEffect(() => {
    let channel: any = null;

    const initRealtime = async () => {
      const key = await getCartKey();
      if (!key) return;

      // Đếm ban đầu
      await refreshCartCount(key);

      // Đăng ký kênh realtime theo cart_key
      channel = supabase
        .channel(`cart_realtime_${key}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cart_items",
            filter: `cart_key=eq.${key}`,
          },
          async () => {
            await refreshCartCount(key);
          }
        )
        .subscribe();
    };

    initRealtime();

    // Cleanup
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Tính tổng số lượng và giá
  const value = useMemo(() => {
    const badgeCount = state.items.reduce((s, it) => s + it.qty, 0);
    const totalPrice = state.items.reduce((s, it) => s + it.price * it.qty, 0);
    return {
      state,
      badgeCount,
      totalPrice,
      cartCount,
      setCartCount,
      addItem: (item: CartItem) =>
        dispatch({ type: "ADD_ITEM", payload: item }),
      removeItem: (id: CartItem["id"]) => dispatch({ type: "REMOVE_ITEM", id }),
      setQty: (id: CartItem["id"], qty: number) =>
        dispatch({ type: "SET_QTY", id, qty }),
      clear: () => dispatch({ type: "CLEAR" }),
      syncFromServer: (items: CartItem[]) => {
        dispatch({ type: "CLEAR" });
        if (items?.length) {
          for (const item of items) {
            dispatch({ type: "ADD_ITEM", payload: item });
          }
        }
      },
    };
  }, [state, cartCount]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

// ========================
// 🪄 Hook tiện ích
// ========================
export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider/>");
  return ctx;
}
