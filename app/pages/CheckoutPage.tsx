import { COLORS, RADIUS, SHADOWS } from "@/constants/design";
import { getCartKey } from "@/lib/cartKey";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/store/cart-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Banknote,
  Check,
  ChevronLeft,
  CreditCard,
  MapPin,
  Wallet,
} from "lucide-react-native";
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

  const deliveryFee = 15000; // 15.000đ
  const promotion = -10000; // -10.000đ
  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0),
        0
      ),
    [items]
  );
  const total = subtotal + deliveryFee + promotion;
  const money = (v: number) => `${v.toLocaleString("vi-VN")}đ`;

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
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Đang chuẩn bị thanh toán...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
        <Text style={styles.emptySubtitle}>Thêm món ăn để tiếp tục</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => onNavigate("home")}
        >
          <LinearGradient
            colors={COLORS.gradientPrimary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.emptyButtonGradient}
          >
            <Text style={styles.emptyButtonText}>Quay lại đặt món</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const paymentMethods = [
    {
      id: "ewallet",
      name: "Ví điện tử",
      icon: Wallet,
      description: "Nhanh & tiện",
      color: COLORS.primary,
    },
    {
      id: "card",
      name: "Thẻ tín dụng",
      icon: CreditCard,
      description: "Visa / Master",
      color: COLORS.secondary,
    },
    {
      id: "cash",
      name: "Tiền mặt",
      icon: Banknote,
      description: "Trả tiền mặt",
      color: COLORS.accent,
    },
  ];

  const addresses = [
    { id: "home", label: "Nhà riêng", address: "201 Katlian No.21 Street" },
    { id: "work", label: "Công ty", address: "456 Business Ave, Suite 100" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: TAB_HEIGHT + 20 }}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={COLORS.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => onNavigate("cart")}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
            <Text style={styles.headerSubtitle}>Kiểm tra thông tin</Text>
          </View>
        </LinearGradient>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <MapPin size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          </View>
          {addresses.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              onPress={() => setSelectedAddress(addr.id)}
              style={[
                styles.optionCard,
                selectedAddress === addr.id && styles.optionSelected,
              ]}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{addr.label}</Text>
                <Text style={styles.optionSub}>{addr.address}</Text>
              </View>
              {selectedAddress === addr.id && (
                <View style={styles.checkCircle}>
                  <Check size={16} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Wallet size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => setSelectedPayment(method.id)}
                style={[
                  styles.paymentCard,
                  selectedPayment === method.id && styles.optionSelected,
                ]}
              >
                <View
                  style={[
                    styles.paymentIcon,
                    { backgroundColor: `${method.color}15` },
                  ]}
                >
                  <IconComponent size={24} color={method.color} />
                </View>
                <View style={styles.paymentContent}>
                  <Text style={styles.optionLabel}>{method.name}</Text>
                  <Text style={styles.optionSub}>{method.description}</Text>
                </View>
                {selectedPayment === method.id && (
                  <View style={styles.checkCircle}>
                    <Check size={16} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{money(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí giao hàng</Text>
              <Text style={styles.summaryValue}>{money(deliveryFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelPromo}>Khuyến mãi</Text>
              <Text style={styles.summaryValuePromo}>{money(promotion)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>Tổng cộng</Text>
              <Text style={styles.summaryValueTotal}>{money(total)}</Text>
            </View>
          </View>
        </View>

        {/* Place Order Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.placeOrderGradient}
            >
              <Text style={styles.placeOrderText}>Đặt hàng</Text>
              <Text style={styles.placeOrderPrice}>{money(total)}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: RADIUS.l,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  emptyButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 2,
  },

  // Section
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  // Option Card (Address)
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...SHADOWS.small,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFE0D6", // Màu cam đỏ nhạt rõ ràng
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  optionSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // Payment Card
  paymentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.small,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.m,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentContent: {
    flex: 1,
  },

  // Summary
  summarySection: {
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 16,
    ...SHADOWS.small,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  summaryLabelPromo: {
    fontSize: 14,
    color: "#10b981",
  },
  summaryValuePromo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  summaryRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabelTotal: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  summaryValueTotal: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.primary,
  },

  // Place Order Button
  buttonContainer: {
    padding: 16,
  },
  placeOrderButton: {
    borderRadius: RADIUS.l,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  placeOrderGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  placeOrderText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  placeOrderPrice: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});
