import { getCartKey } from "@/lib/cartKey";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/store/cart-context"; // ✅ context realtime badge
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 🖼️ Map ảnh tĩnh
const IMAGE_MAP: Record<string, any> = {
  "/com-tam-suon-bi-cha.jpg": require("@/assets/public/com-tam-suon-bi-cha.jpg"),
  "/classic-beef-burger.png": require("@/assets/public/classic-beef-burger.png"),
  "/comga_xoimo.jpg": require("@/assets/public/comga_xoimo.jpg"),
  "/buncha_hanoi.jpg": require("@/assets/public/buncha_hanoi.jpg"),
  "/milk-drink.jpg": require("@/assets/public/milk-drink.jpg"),
  "/trasuamatcha_master.png": require("@/assets/public/trasuamatcha_master.png"),
  "/colorful-fruit-smoothie.png": require("@/assets/public/colorful-fruit-smoothie.png"),
  "/pizza-xuc-xich-pho-mai-vuong.jpg": require("@/assets/public/pizza-xuc-xich-pho-mai-vuong.jpg"),
  "/creamy-chicken-salad.png": require("@/assets/public/creamy-chicken-salad.png"),
};

interface CartPageProps {
  onNavigate?: (page: string, data?: any) => void;
}

type CartRow = {
  id: string;
  cart_key: string;
  food_item_id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  meta?: any;
  restaurant?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function CartPage({ onNavigate = () => {} }: CartPageProps) {
  const { syncFromServer, setCartCount } = useCart(); // ✅ đồng bộ & badge toàn app

  const [cartKey, setCartKey] = useState<string>("");
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy cart key 1 lần
  useEffect(() => {
    (async () => {
      const key = await getCartKey();
      setCartKey(key);
    })();
  }, []);

  // ✅ Load giỏ hàng + cập nhật context
  const reloadCart = async () => {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_key", cartKey)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setItems(data as CartRow[]);

      // 🔹 Đồng bộ vào context (cho realtime toàn app)
      syncFromServer(
        data.map((d) => ({
          id: d.food_item_id,
          name: d.name,
          price: d.price,
          qty: d.quantity,
          image: d.image ?? undefined,
          meta: d.meta,
        }))
      );

      // 🔹 Cập nhật badge ngay lập tức (tổng quantity)
      const totalQty = data.reduce((sum, d) => sum + (d.quantity || 0), 0);
      setCartCount(totalQty);
    }
  };

  // ✅ Lần đầu tải giỏ hàng + realtime
  useEffect(() => {
    if (!cartKey) return;
    setLoading(true);

    (async () => {
      await reloadCart();
      setLoading(false);
    })();

    // ✅ Lắng nghe realtime Supabase (thiết bị khác)
    const channel = supabase
      .channel(`cart:${cartKey}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `cart_key=eq.${cartKey}`,
        },
        async () => {
          await reloadCart();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cartKey]);

  // ================== TÍNH TOÁN ==================
  const money = (v: number) => `$${v.toFixed(2)}`;
  const totalQty = useMemo(
    () => items.reduce((s, it) => s + (it.quantity || 0), 0),
    [items]
  );
  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0),
        0
      ),
    [items]
  );
  const deliveryFee = 2.5;
  const promotion = -3.2;
  const total = subtotal + deliveryFee + promotion;

  // ================== CẬP NHẬT DỮ LIỆU ==================
  const optimisticSet = (id: string, patch: Partial<CartRow>) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );

  const updateQuantity = async (id: string, nextQty: number) => {
    if (nextQty <= 0) return removeItem(id);

    optimisticSet(id, { quantity: nextQty });

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: nextQty })
      .eq("id", id);

    if (error) {
      console.error("Update quantity failed:", error);
      Alert.alert("Lỗi", "Không thể cập nhật số lượng!");
    } else {
      await reloadCart(); // ✅ đồng bộ realtime context
    }
  };

  const inc = (id: string) => {
    const cur = items.find((i) => i.id === id)?.quantity || 1;
    updateQuantity(id, cur + 1);
  };

  const dec = (id: string) => {
    const cur = items.find((i) => i.id === id)?.quantity || 1;
    updateQuantity(id, cur - 1);
  };

  const removeItem = async (id: string) => {
    const prev = items;
    setItems((p) => p.filter((i) => i.id !== id));

    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (error) {
      console.error("Remove failed:", error);
      Alert.alert("Lỗi", "Không thể xoá món. Đang khôi phục lại.");
      setItems(prev);
    } else {
      await reloadCart(); // ✅ cập nhật context + badge
    }
  };

  const clearCart = async () => {
    const prev = items;
    setItems([]);
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_key", cartKey);

    if (error) {
      console.error("Clear failed:", error);
      Alert.alert("Lỗi", "Không thể xoá toàn bộ giỏ hàng. Đang khôi phục lại.");
      setItems(prev);
    } else {
      await reloadCart(); // ✅ cập nhật toàn app
    }
  };

  // ================== UI ==================
  if (!cartKey || loading) {
    return (
      <View style={styles.centerWrapper}>
        <ShoppingBag size={64} color="#9ca3af" />
        <Text style={styles.mutedText}>Loading your cart…</Text>
        <ActivityIndicator style={{ marginTop: 8 }} color="#06b6d4" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centerWrapper}>
        <ShoppingBag size={64} color="#9ca3af" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.mutedText}>Add items to get started</Text>

        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const restaurantName =
    items.find((i) => i.restaurant)?.restaurant || "Selected Restaurant";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <Text style={styles.headerSubtitle}>
          {totalQty} item{totalQty > 1 ? "s" : ""}
        </Text>
      </View>

      {/* Restaurant info */}
      <View style={styles.section}>
        <View style={styles.restaurantBox}>
          <Text style={styles.restaurantName}>From: {restaurantName}</Text>
          <Text style={styles.restaurantSub}>Delivery in 20 mins</Text>
        </View>

        {/* Items */}
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image
              source={
                item.image && IMAGE_MAP[item.image]
                  ? IMAGE_MAP[item.image]
                  : require("@/assets/public/placeholder.jpg")
              }
              style={styles.itemImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                {item.meta?.size ? `Size: ${item.meta.size} • ` : ""}
                {item.meta?.spiciness ?? ""}
              </Text>
              {Array.isArray(item.meta?.toppings) &&
                item.meta.toppings.length > 0 && (
                  <Text style={styles.itemMeta}>
                    {item.meta.toppings.join(", ")}
                  </Text>
                )}

              <View style={styles.itemBottomRow}>
                <Text style={styles.itemPrice}>
                  {money((item.price || 0) * (item.quantity || 0))}
                </Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    onPress={() => dec(item.id)}
                    style={styles.qtyButton}
                  >
                    <Minus size={16} color="#111827" />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => inc(item.id)}
                    style={styles.qtyButton}
                  >
                    <Plus size={16} color="#111827" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={16} color="#b91c1c" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Promo code */}
      <View style={styles.section}>
        <TextInput placeholder="Add promo code" style={styles.promoInput} />
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{money(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery fee</Text>
          <Text style={styles.summaryValue}>{money(deliveryFee)}</Text>
        </View>
        <View style={[styles.summaryRow, { marginBottom: 4 }]}>
          <Text style={[styles.summaryLabel, { color: "#16a34a" }]}>
            Promotion
          </Text>
          <Text style={[styles.summaryValue, { color: "#16a34a" }]}>
            {money(promotion)}
          </Text>
        </View>
        <View style={styles.summaryTotalRow}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>{money(total)}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => onNavigate("checkout")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ================== STYLE ==================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  mutedText: { marginTop: 8, fontSize: 14, color: "#6b7280" },
  emptyTitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  header: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { color: "#ffffff", fontSize: 20, fontWeight: "700" },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 2,
  },
  section: { paddingHorizontal: 16, paddingTop: 12 },
  restaurantBox: {
    backgroundColor: "#ecfeff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  restaurantName: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  restaurantSub: { fontSize: 12, color: "#0891b2", marginTop: 2 },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  itemName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  itemMeta: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  itemBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  itemPrice: { fontSize: 14, fontWeight: "700", color: "#06b6d4" },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyButton: {
    backgroundColor: "#e5e7eb",
    padding: 4,
    borderRadius: 6,
  },
  qtyValue: {
    width: 26,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 13,
    marginHorizontal: 6,
  },
  removeButton: {
    backgroundColor: "#fee2e2",
    padding: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  promoInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: { fontSize: 13, color: "#6b7280" },
  summaryValue: { fontSize: 13, fontWeight: "600", color: "#111827" },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  summaryTotalLabel: { fontSize: 16, fontWeight: "700", color: "#111827" },
  summaryTotalValue: { fontSize: 16, fontWeight: "700", color: "#06b6d4" },
  primaryButton: {
    backgroundColor: "#06b6d4",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 14,
  },
  clearButton: {
    marginTop: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#b91c1c",
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
