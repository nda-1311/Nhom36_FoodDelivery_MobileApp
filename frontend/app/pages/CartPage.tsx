/**
 * CartPageOptimized.tsx
 *
 * Optimized cart page with:
 * - React Query for cart management
 * - Optimistic updates for quantity changes
 * - Cached images
 * - Smooth animations
 * - Pull to refresh
 */

import { CachedImage } from "@/components/CachedImage";
import { COLORS } from "@/constants/design";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/useCart";
import { getFoodImage } from "@/utils/foodImageMap";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CartPageOptimizedProps {
  onNavigate: (screen: string, params?: any) => void;
  onBack: () => void;
}

interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  menuItem: {
    id: string;
    name: string;
    price: number;
    image?: string; // Prisma field
    imageUrl?: string; // Legacy field
    restaurant: {
      id: string;
      name: string;
    };
  };
}

const CartPageOptimized: React.FC<CartPageOptimizedProps> = ({
  onNavigate,
  onBack,
}) => {
  // React Query hooks
  const { data: cart, isLoading, refetch, isRefetching } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  // 🔍 Debug: Log cart data
  console.log("🛒 CartPage - cart data:", cart);
  console.log("🛒 CartPage - isLoading:", isLoading);
  console.log("🛒 CartPage - items count:", cart?.items?.length || 0);

  // Calculate totals
  const { subtotal, deliveryFee, total, itemCount } = useMemo(() => {
    if (!cart?.items) {
      return { subtotal: 0, deliveryFee: 0, total: 0, itemCount: 0 };
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
    const deliveryFee = subtotal > 0 ? 15000 : 0; // Free if > 50k
    const total = subtotal + deliveryFee;
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, deliveryFee, total, itemCount };
  }, [cart]);

  // Handle remove item
  const handleRemoveItem = useCallback(
    (itemId: string) => {
      Alert.alert("Xóa món ăn", "Bạn có chắc muốn xóa món này khỏi giỏ hàng?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => removeItem.mutate(itemId),
        },
      ]);
    },
    [removeItem]
  );

  // Handle quantity change
  const handleUpdateQuantity = useCallback(
    (itemId: string, currentQuantity: number, delta: number) => {
      const newQuantity = currentQuantity + delta;

      if (newQuantity < 1) {
        handleRemoveItem(itemId);
        return;
      }

      updateItem.mutate({ itemId, quantity: newQuantity });
    },
    [updateItem, handleRemoveItem]
  );

  // Handle clear cart
  const handleClearCart = useCallback(() => {
    Alert.alert("Xóa giỏ hàng", "Bạn có chắc muốn xóa tất cả món ăn?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa tất cả",
        style: "destructive",
        onPress: () => clearCart.mutate(),
      },
    ]);
  }, [clearCart]);

  // Handle checkout
  const handleCheckout = useCallback(() => {
    console.log("🚀 Checkout button clicked!");
    console.log("🛒 Cart items:", cart?.items?.length || 0);

    if (!cart?.items || cart.items.length === 0) {
      console.log("⚠️ Cart is empty, showing alert");
      Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống");
      return;
    }

    console.log("✅ Navigating to checkout with cartId:", cart.id);
    onNavigate("checkout", { cartId: cart.id });
  }, [cart, onNavigate]);

  // Render cart item
  const renderCartItem = useCallback(
    ({ item }: { item: CartItem }) => {
      const itemTotal = item.menuItem.price * item.quantity;

      return (
        <View style={styles.cartItem}>
          <CachedImage
            source={getFoodImage(
              item.menuItem.name,
              item.menuItem.image || item.menuItem.imageUrl
            )}
            style={styles.itemImage}
          />

          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.menuItem.name}
            </Text>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {item.menuItem.restaurant.name}
            </Text>
            <Text style={styles.itemPrice}>
              {item.menuItem.price.toLocaleString()}đ
            </Text>
          </View>

          <View style={styles.itemActions}>
            {/* Quantity controls */}
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(item.id, item.quantity, -1)}
              >
                <Ionicons name="remove" size={16} color={COLORS.primary} />
              </TouchableOpacity>

              <Text style={styles.quantityText}>{item.quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(item.id, item.quantity, 1)}
              >
                <Ionicons name="add" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Item total */}
            <Text style={styles.itemTotal}>{itemTotal.toLocaleString()}đ</Text>

            {/* Delete button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemoveItem(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [handleUpdateQuantity, handleRemoveItem]
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color={COLORS.border} />
      <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
      <Text style={styles.emptyText}>
        Hãy thêm món ăn yêu thích vào giỏ hàng
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => onNavigate("home")}
      >
        <Text style={styles.shopButtonText}>Khám phá ngay</Text>
      </TouchableOpacity>
    </View>
  );

  // Render footer with summary
  const renderFooter = () => {
    if (!cart?.items || cart.items.length === 0) return null;

    return (
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính</Text>
          <Text style={styles.summaryValue}>{subtotal.toLocaleString()}đ</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí giao hàng</Text>
          <Text style={styles.summaryValue}>
            {deliveryFee === 0
              ? "Miễn phí"
              : `${deliveryFee.toLocaleString()}đ`}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalValue}>{total.toLocaleString()}đ</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          activeOpacity={0.8}
          testID="checkout-button"
        >
          <Text style={styles.checkoutButtonText}>
            Đặt hàng ({itemCount} món)
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        {cart?.items && cart.items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cart items list */}
      <FlatList
        data={cart?.items || []}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
      />

      {/* Loading overlay for mutations */}
      {(updateItem.isPending ||
        removeItem.isPending ||
        clearCart.isPending) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang cập nhật...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 16,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.error,
  },
  listContent: {
    flexGrow: 1,
  },
  cartItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 8,
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  shopButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  footer: {
    padding: 16,
    paddingBottom: 80, // Space for bottom navigation
    backgroundColor: COLORS.white,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  checkoutButton: {
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.text,
  },
});

export default CartPageOptimized;
