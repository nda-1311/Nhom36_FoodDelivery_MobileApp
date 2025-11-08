import { getCartKey } from "@/lib/cartKey";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/store/cart-context";
import { ChevronLeft, MapPin, Wallet } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TAB_HEIGHT = Platform.select({ ios: 80, android: 60 }) || 60;

interface CheckoutPageProps {
  onNavigate: (page: string, data?: any) => void;
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
  restaurant_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { syncFromServer, setCartCount } = useCart(); // ✅ thêm setCartCount để cập nhật realtime
  const [cartKey, setCartKey] = useState<string>("");
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("ewallet");
  const [selectedAddress, setSelectedAddress] = useState("home");

  // Lấy cart key
  useEffect(() => {
    (async () => {
      const key = await getCartKey();
      setCartKey(key);
    })();
  }, []);

  // Lấy giỏ hàng từ Supabase
  useEffect(() => {
    if (!cartKey) return;
    const fetchCart = async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_key", cartKey)
        .order("created_at", { ascending: true });

      if (!error && data) setItems(data as CartRow[]);
      setLoading(false);
    };
    fetchCart();
  }, [cartKey]);

  const deliveryFee = 2.5;
  const promotion = -3.2;
  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0),
        0
      ),
    [items]
  );
  const total = subtotal + deliveryFee + promotion;
  const money = (v: number) => `$${v.toFixed(2)}`;

  // ==================== ĐẶT HÀNG ====================
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert("Giỏ hàng trống", "Không thể tạo đơn hàng!");
      return;
    }

    try {
      setLoading(true);
      const firstItem = items[0];
      let restaurantId = firstItem?.restaurant_id || null;

      // Nếu chưa có restaurant_id → lấy từ food_items
      if (!restaurantId && firstItem?.food_item_id) {
        const { data: foodRow } = await supabase
          .from("food_items")
          .select("restaurant_id")
          .eq("id", firstItem.food_item_id)
          .maybeSingle();
        if (foodRow?.restaurant_id) restaurantId = foodRow.restaurant_id;
      }

      // Nếu vẫn null → fallback tìm theo tên nhà hàng
      if (!restaurantId && typeof firstItem?.restaurant === "string") {
        const { data: rest } = await supabase
          .from("restaurants")
          .select("id")
          .ilike("name", `%${firstItem.restaurant}%`)
          .maybeSingle();
        if (rest?.id) restaurantId = rest.id;
      }

      if (!restaurantId) {
        Alert.alert("Lỗi", "Không tìm thấy nhà hàng cho đơn hàng này!");
        setLoading(false);
        return;
      }

      // ✅ 1. Tạo đơn hàng trong bảng orders
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: null,
            restaurant_id: restaurantId,
            status: "Pending",
            delivery_address: selectedAddress,
            delivery_time: 20,
            subtotal,
            delivery_fee: deliveryFee,
            discount: promotion,
            total,
            payment_method: selectedPayment,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();

      if (orderError || !orderData) {
        Alert.alert("Lỗi", "Không thể tạo đơn hàng!");
        setLoading(false);
        return;
      }

      const orderId = orderData.id;

      // ✅ 2. Tạo order_items
      const orderItems = items.map((item) => ({
        order_id: orderId,
        food_item_id: item.food_item_id,
        quantity: item.quantity,
        price: item.price,
        selected_options: item.meta || {},
        special_instructions: "",
        created_at: new Date().toISOString(),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) {
        Alert.alert("Lỗi", "Không thể lưu chi tiết đơn hàng!");
        setLoading(false);
        return;
      }

      // ✅ 3. Xóa giỏ hàng trong Supabase
      await supabase.from("cart_items").delete().eq("cart_key", cartKey);

      // ✅ 4. Giải phóng giỏ hàng local + cập nhật badge realtime
      setItems([]);
      syncFromServer([]); // dọn context items
      setCartCount(0); // cập nhật badge ngay lập tức

      // ✅ 5. Thông báo thành công + điều hướng
      Alert.alert("🎉 Thành công!", "Đơn hàng đã được tạo thành công.");
      onNavigate("order-tracking", { orderId });
    } catch (err: any) {
      console.error("💥 Error placing order:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== UI ====================
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#06b6d4" size="large" />
        <Text style={styles.textMuted}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.textMuted}>🛒 Giỏ hàng trống.</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onNavigate("home")}
        >
          <Text style={styles.primaryButtonText}>Quay lại đặt món</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const paymentMethods = [
    {
      id: "ewallet",
      name: "E-wallet",
      icon: "💳",
      description: "Nhanh & tiện",
    },
    {
      id: "card",
      name: "Credit Card",
      icon: "🏦",
      description: "Visa / Master",
    },
    {
      id: "cash",
      name: "Cash on Delivery",
      icon: "💵",
      description: "Trả tiền mặt",
    },
  ];

  const addresses = [
    { id: "home", label: "Home", address: "201 Katlian No.21 Street" },
    { id: "work", label: "Work", address: "456 Business Ave, Suite 100" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: TAB_HEIGHT + 20 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate("cart")}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Review</Text>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#06b6d4" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          {addresses.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              onPress={() => setSelectedAddress(addr.id)}
              style={[
                styles.optionBox,
                selectedAddress === addr.id && styles.optionSelected,
              ]}
            >
              <Text style={styles.optionLabel}>{addr.label}</Text>
              <Text style={styles.optionSub}>{addr.address}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wallet size={20} color="#06b6d4" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedPayment(method.id)}
              style={[
                styles.optionBoxRow,
                selectedPayment === method.id && styles.optionSelected,
              ]}
            >
              <Text style={styles.optionIcon}>{method.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{method.name}</Text>
                <Text style={styles.optionSub}>{method.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.textMuted}>Subtotal</Text>
            <Text style={styles.textStrong}>{money(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.textMuted}>Delivery fee</Text>
            <Text style={styles.textStrong}>{money(deliveryFee)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: "#16a34a" }}>Promotion</Text>
            <Text style={{ color: "#16a34a" }}>{money(promotion)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{money(total)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.primaryButtonText}>Place Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  textMuted: { color: "#6b7280", fontSize: 14, marginTop: 8 },
  header: {
    backgroundColor: "#06b6d4",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  optionBox: {
    padding: 10,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    marginVertical: 4,
  },
  optionBoxRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
    gap: 10,
  },
  optionSelected: { borderColor: "#06b6d4", backgroundColor: "#ecfeff" },
  optionLabel: { fontSize: 14, fontWeight: "600", color: "#111827" },
  optionSub: { fontSize: 12, color: "#6b7280" },
  optionIcon: { fontSize: 20 },
  summaryBox: { padding: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  textStrong: { fontWeight: "600", color: "#111827" },
  totalLabel: { fontWeight: "700", fontSize: 16 },
  totalValue: { fontWeight: "700", fontSize: 16, color: "#06b6d4" },
  primaryButton: {
    backgroundColor: "#06b6d4",
    borderRadius: 10,
    margin: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 30,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
