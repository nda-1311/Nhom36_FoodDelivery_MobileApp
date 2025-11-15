import { COLORS, RADIUS, SHADOWS } from "@/constants/design";
import { apiClient } from "@/lib/api/client";
import { useCart } from "@/store/cart-context";
import { getFoodImage } from "@/utils/foodImageMap";
import { LinearGradient } from "expo-linear-gradient";
import {
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
} from "lucide-react-native";
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

  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load giỏ hàng + cập nhật context
  const reloadCart = async () => {
    try {
      const result = await apiClient.get("/cart");

      if (result.success && result.data) {
        const cartData = result.data.items || [];

        // ✅ Map đúng cấu trúc dữ liệu từ backend
        const mappedItems = cartData.map((item: any) => ({
          id: item.id, // ID của CartItem
          cart_key: item.cartId,
          food_item_id: item.menuItemId,
          name: item.menuItem?.name || "Unknown",
          price: item.menuItem?.price || 0,
          quantity: item.quantity,
          image: item.menuItem?.image,
          meta: item.specialInstructions
            ? { note: item.specialInstructions }
            : undefined,
          restaurant: item.menuItem?.restaurant?.name,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
        }));

        setItems(mappedItems);

        // 🔹 Đồng bộ vào context (cho realtime toàn app)
        syncFromServer(
          mappedItems.map((d: any) => ({
            id: d.food_item_id,
            name: d.name,
            price: d.price,
            qty: d.quantity,
            image: d.image,
            meta: d.meta,
          }))
        );

        // 🔹 Cập nhật badge ngay lập tức (tổng quantity)
        const totalQty = cartData.reduce(
          (sum: number, d: any) => sum + (d.quantity || 0),
          0
        );
        setCartCount(totalQty);

        // 🔹 Dispatch event để thông báo giỏ hàng đã thay đổi
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cart:changed"));
        }
      }
    } catch (error) {
      console.error("Failed to reload cart:", error);
    }
  };

  // ✅ Load cart khi mount - chỉ chạy 1 lần
  useEffect(() => {
    let mounted = true;

    const loadCart = async () => {
      setLoading(true);
      await reloadCart();
      if (mounted) {
        setLoading(false);
      }
    };

    loadCart();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi component mount

  // ================== TÍNH TOÁN ==================
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
  const deliveryFee = 15000; // 15.000đ
  const promotion = -10000; // -10.000đ
  const total = subtotal + deliveryFee + promotion;

  // ================== CẬP NHẬT DỮ LIỆU ==================
  const optimisticSet = (id: string, patch: Partial<CartRow>) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );

  const updateQuantity = async (id: string, nextQty: number) => {
    if (nextQty <= 0) return removeItem(id);

    optimisticSet(id, { quantity: nextQty });

    try {
      const result = await apiClient.put(`/cart/${id}`, { quantity: nextQty });
      if (!result.success) {
        throw new Error(result.message);
      }

      await reloadCart(); // ✅ đồng bộ với backend
    } catch (error: any) {
      console.error("❌ Update quantity failed:", error);
      Alert.alert("Lỗi", "Không thể cập nhật số lượng!");
      await reloadCart(); // Rollback
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

    try {
      const result = await apiClient.delete(`/cart/${id}`);
      if (!result.success) {
        throw new Error(result.message);
      }

      await reloadCart(); // ✅ cập nhật context + badge
    } catch (error: any) {
      console.error("❌ Remove failed:", error);
      Alert.alert("Lỗi", "Không thể xoá món. Đang khôi phục lại.");
      setItems(prev);
    }
  };

  const clearCart = async () => {
    const prev = items;
    setItems([]);

    try {
      const result = await apiClient.delete("/cart");
      if (!result.success) {
        throw new Error(result.message);
      }

      await reloadCart(); // ✅ cập nhật toàn app
    } catch (error: any) {
      console.error("❌ Clear failed:", error);
      Alert.alert("Lỗi", "Không thể xoá toàn bộ giỏ hàng. Đang khôi phục lại.");
      setItems(prev);
    }
  };

  // ================== UI ==================
  if (loading) {
    return (
      <View style={styles.centerWrapper}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centerWrapper}>
        <ShoppingBag size={80} color={COLORS.textLight} strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
        <Text style={styles.emptySubtitle}>Thêm món ăn để bắt đầu</Text>

        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={styles.emptyButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.gradientPrimary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.emptyButtonGradient}
          >
            <Text style={styles.emptyButtonText}>Tiếp tục đặt món</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const restaurantName =
    items.find((i) => i.restaurant)?.restaurant || "Nhà hàng được chọn";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      {/* Header with gradient */}
      <LinearGradient
        colors={COLORS.gradientPrimary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🛒 Giỏ hàng của bạn</Text>
        <Text style={styles.headerSubtitle}>
          {totalQty} món • {restaurantName}
        </Text>
      </LinearGradient>

      {/* Delivery info */}
      <View style={styles.deliveryCard}>
        <View style={styles.deliveryIcon}>
          <MapPin size={20} color={COLORS.primary} />
        </View>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryTitle}>Địa chỉ giao hàng</Text>
          <Text style={styles.deliveryAddress}>
            Nhà riêng • 123 Đường Chính, Quận 1
          </Text>
        </View>
      </View>

      {/* Cart Items */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>Món đã chọn</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image
              source={getFoodImage(item.name, item.image || undefined)}
              style={styles.itemImage}
            />
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.meta?.size && (
                    <Text style={styles.itemMeta}>Cỡ: {item.meta.size}</Text>
                  )}
                  {Array.isArray(item.meta?.toppings) &&
                    item.meta.toppings.length > 0 && (
                      <Text style={styles.itemMeta}>
                        Topping: {item.meta.toppings.join(", ")}
                      </Text>
                    )}
                </View>
                <TouchableOpacity
                  onPress={() => removeItem(item.id)}
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                >
                  <Trash2 size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>
                  {((item.price || 0) * (item.quantity || 0)).toLocaleString(
                    "vi-VN"
                  )}
                  đ
                </Text>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    onPress={() => dec(item.id)}
                    style={styles.qtyButton}
                    activeOpacity={0.7}
                  >
                    <Minus size={16} color={COLORS.white} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => inc(item.id)}
                    style={styles.qtyButton}
                    activeOpacity={0.7}
                  >
                    <Plus size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Promo code */}
      <View style={styles.promoSection}>
        <View style={styles.promoRow}>
          <View style={styles.promoInputWrapper}>
            <Tag size={18} color={COLORS.textSecondary} />
            <TextInput
              placeholder="Nhập mã giảm giá"
              placeholderTextColor={COLORS.textLight}
              style={styles.promoInput}
            />
          </View>
          <TouchableOpacity style={styles.applyButton} activeOpacity={0.8}>
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Price Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Chi tiết giá</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>
              {subtotal.toLocaleString("vi-VN")}đ
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee.toLocaleString("vi-VN")}đ
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelPromo}>Khuyến mãi</Text>
            <Text style={styles.summaryValuePromo}>
              {promotion.toLocaleString("vi-VN")}đ
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRowTotal}>
            <Text style={styles.summaryLabelTotal}>Tổng cộng</Text>
            <Text style={styles.summaryValueTotal}>
              {total.toLocaleString("vi-VN")}đ
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          onPress={clearCart}
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <Trash2 size={18} color={COLORS.error} />
          <Text style={styles.clearButtonText}>Xóa giỏ hàng</Text>
        </TouchableOpacity>
      </View>

      {/* Checkout Button - Fixed */}
      <View style={styles.checkoutFixed}>
        <TouchableOpacity
          onPress={() => onNavigate("checkout")}
          style={styles.checkoutButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.gradientPrimary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutButtonGradient}
          >
            <Text style={styles.checkoutButtonText}>Tiến hành thanh toán</Text>
            <Text style={styles.checkoutButtonPrice}>
              {total.toLocaleString("vi-VN")}đ
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ================== STYLE ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  emptyButton: {
    marginTop: 24,
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
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 50,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    marginTop: 6,
    fontWeight: "500",
  },

  // Delivery Address Card
  deliveryCard: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.small,
  },
  deliveryIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.m,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  // Items Section
  itemsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  cartItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    ...SHADOWS.small,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.m,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 2,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    minWidth: 28,
    textAlign: "center",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },

  // Promo Section
  promoSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  promoRow: {
    flexDirection: "row",
    gap: 8,
  },
  promoInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  promoInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 4,
    ...SHADOWS.small,
  },
  promoInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.l,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.small,
  },
  applyButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },

  // Summary Section
  summarySection: {
    marginHorizontal: 16,
    marginBottom: 16,
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

  // Actions Section
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 100,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: RADIUS.l,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  clearButtonText: {
    color: "#dc2626",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Checkout Fixed Button
  checkoutFixed: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 70,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.large,
  },
  checkoutButton: {
    borderRadius: RADIUS.l,
    overflow: "hidden",
  },
  checkoutButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
  },
  checkoutButtonPrice: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
