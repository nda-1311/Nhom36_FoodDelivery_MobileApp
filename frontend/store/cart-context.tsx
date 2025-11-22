"use client";
import { cartService } from "@/lib/api";
import { apiClient } from "@/lib/api/client";
import { cartEvents } from "@/lib/cartEvents";
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

  // 🧩 Hàm load lại số lượng giỏ hàng từ backend API
  const refreshCartCount = async () => {
    try {
      // Check if user is authenticated
      const token = await apiClient.getAccessToken();
      if (!token) {
        setCartCount(0);
        return;
      }

      const response = await cartService.getCart();
      if (response.success && response.data) {
        // ✅ Tính tổng quantity của tất cả items
        const totalQty = response.data.items.reduce(
          (sum: number, item: any) => sum + (item.quantity || 0),
          0
        );
        setCartCount(totalQty);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error refreshing cart count:", error);
      setCartCount(0);
    }
  };

  // ✅ Load cart count một lần khi mount và chỉ cập nhật khi có sự kiện
  useEffect(() => {
    // Load ban đầu
    refreshCartCount();

    // Subscribe to cart events
    const unsubscribe = cartEvents.subscribe(() => {
      console.log("🔔 Cart context received cart change event");
      refreshCartCount();
    });

    // Cleanup
    return () => {
      unsubscribe();
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
