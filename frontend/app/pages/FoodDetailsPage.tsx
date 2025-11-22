import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/design";
import { useFavorites } from "@/hooks/useFavorites";
import { apiClient } from "@/lib/api/client";
import { cartEvents } from "@/lib/cartEvents";
import { queryKeys } from "@/lib/queryClient";
import { getFoodImage } from "@/utils/foodImageMap";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FoodDetailsPageProps {
  data: any;
  onNavigate: (page: string, data?: any) => void;
  favorites: any[];
  onToggleFavorite: (item: any) => void;
}

export default function FoodDetailsPage({
  data: initialData,
  onNavigate,
  favorites,
  onToggleFavorite,
}: FoodDetailsPageProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedSpiciness, setSelectedSpiciness] = useState("Không cay");
  const [toppings, setToppings] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const { isFav, toggle, loading: favLoading } = useFavorites();
  const queryClient = useQueryClient();

  // Fetch full food data if only foodId is provided
  useEffect(() => {
    const fetchFoodData = async () => {
      // If we have full data already, skip
      if (initialData?.price && initialData?.name) {
        setData(initialData);
        return;
      }

      // If we only have foodId, fetch the full data
      const foodId = initialData?.foodId || initialData?.id;
      if (!foodId) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin món ăn");
        return;
      }

      try {
        setLoading(true);
        console.log("🔍 Fetching food details for ID:", foodId);

        const result = await apiClient.get(`/food/${foodId}`);

        if (result.success && result.data) {
          console.log("✅ Fetched food data:", result.data);
          setData(result.data);
        } else {
          throw new Error("Failed to fetch food data");
        }
      } catch (error) {
        console.error("❌ Error fetching food:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin món ăn");
      } finally {
        setLoading(false);
      }
    };

    fetchFoodData();
  }, [initialData]);

  // ✅ Sử dụng useMemo để tính lại khi isFav thay đổi
  const isFavorite = React.useMemo(() => {
    if (!data?.id) return false;
    const result = isFav(String(data.id));
    console.log(
      "FoodDetailsPage - isFavorite:",
      result,
      "for foodId:",
      data.id
    );
    return result;
  }, [data?.id, isFav]);

  // Show loading state
  if (loading || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>
            Đang tải thông tin món ăn...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = data?.name || "Món ăn";
  const displayDesc =
    data?.description || "Món ăn ngon được chuẩn bị tươi mới!";
  const basePrice = Math.round(Number(data?.price) || 10000);

  // Xử lý ảnh - dùng getFoodImage utility
  const imageSource = getFoodImage(displayName, data?.image || data?.image_url);

  const toggleTopping = (topping: string) => {
    setToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((t) => t !== topping)
        : [...prev, topping]
    );
  };

  const priceSize =
    selectedSize === "L" ? 10000 : selectedSize === "M" ? 5000 : 0;
  const priceToppings = toppings.reduce(
    (sum, t) =>
      sum + (t === "Bắp" ? 2000 : t === "Phô mai Cheddar" ? 5000 : 10000),
    0
  );
  const totalPrice = (basePrice + priceSize + priceToppings) * quantity;

  // ✅ Sửa lỗi không tăng count và tối ưu flow
  const handleAddToCart = async () => {
    try {
      // Build special instructions from selections
      const instructions = [];
      if (selectedSize !== "S") instructions.push(`Kích cỡ: ${selectedSize}`);
      if (selectedSpiciness !== "Không cay")
        instructions.push(`Độ cay: ${selectedSpiciness}`);
      if (toppings.length > 0)
        instructions.push(`Topping: ${toppings.join(", ")}`);
      if (note) instructions.push(`Ghi chú: ${note}`);

      const specialInstructions = instructions.join(" | ");

      // Debug: Log data before API call
      console.log("🔍 Add to cart - Food data:", {
        id: data.id,
        name: data.name || data.displayName,
        price: data.price,
        quantity,
        specialInstructions,
      });

      // Call backend API to add to cart
      const result = await apiClient.post("/cart", {
        menuItemId: String(data.id),
        quantity: quantity,
        specialInstructions: specialInstructions || undefined,
      });

      console.log("✅ Cart API response:", result);

      if (!result.success) {
        throw new Error(result.message || "Failed to add to cart");
      }

      // ✅ Invalidate React Query cache để CartPage reload
      console.log("🔄 Invalidating cart query cache...");
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart.list });

      // ✅ Emit event để badge reload ngay lập tức
      console.log("📢 Emitting cart changed event...");
      cartEvents.emit();

      // ✅ Tự động chuyển sang trang giỏ hàng sau khi thêm thành công
      console.log("✅ Navigating to cart page...");
      onNavigate("cart");

      // Hiển thị toast notification thay vì Alert
      setTimeout(() => {
        Alert.alert(
          "🎉 Đã thêm vào giỏ hàng!",
          `${displayName} (x${quantity})`,
          [{ text: "OK" }]
        );
      }, 500);
    } catch (err: any) {
      console.error("❌ Add to cart error:", err);
      Alert.alert("Lỗi", err.message || "Không thể thêm vào giỏ hàng!");
    }
  };

  const handleToggleFavorite = async () => {
    if (!data?.id) return;

    try {
      await toggle(String(data.id), {
        name: displayName,
        image: data.image || data.image_url,
        price: basePrice,
      });
    } catch (error: any) {
      Alert.alert(
        "Thông báo",
        error.message || "Vui lòng đăng nhập để sử dụng tính năng yêu thích",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () => onNavigate("login"),
          },
        ]
      );
    }
  };

  console.log("Food Details Data:", data);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={imageSource}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)"]}
            style={styles.heroGradient}
          />

          {/* Header Actions */}
          <TouchableOpacity
            onPress={() => onNavigate("home")}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            disabled={favLoading}
            style={styles.favButton}
          >
            <Heart
              size={24}
              color={isFavorite ? COLORS.error : COLORS.dark}
              fill={isFavorite ? COLORS.error : "none"}
            />
          </TouchableOpacity>
        </View>

        {/* Food Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoLeft}>
              <Text style={styles.foodName}>{displayName}</Text>
              <Text style={styles.foodDesc}>{displayDesc}</Text>
            </View>
          </View>

          {/* Rating & Price */}
          <View style={styles.metaRow}>
            <View style={styles.ratingContainer}>
              <Star size={18} color={COLORS.accent} fill={COLORS.accent} />
              <Text style={styles.ratingValue}>{data.rating || 4.5}</Text>
              <Text style={styles.ratingCount}>(289 đánh giá)</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Giá gốc</Text>
              <Text style={styles.priceValue}>
                {basePrice.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>
        </View>

        {/* Size Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🥤 Kích cỡ</Text>
            <Text style={styles.requiredBadge}>Bắt buộc</Text>
          </View>
          <View style={styles.optionsGrid}>
            {["S", "M", "L"].map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setSelectedSize(size)}
                style={[
                  styles.optionCard,
                  selectedSize === size && styles.optionCardSelected,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedSize === size && styles.optionLabelSelected,
                    ]}
                  >
                    {size}
                  </Text>
                  {size !== "S" && (
                    <Text
                      style={[
                        styles.optionPrice,
                        selectedSize === size && styles.optionPriceSelected,
                      ]}
                    >
                      +{(size === "M" ? 5000 : 10000).toLocaleString("vi-VN")}đ
                    </Text>
                  )}
                </View>
                {selectedSize === size && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Toppings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🧀 Topping</Text>
            <Text style={styles.optionalBadge}>Tùy chọn</Text>
          </View>
          {["Bắp", "Phô mai Cheddar", "Trứng muối"].map((topping) => (
            <TouchableOpacity
              key={topping}
              onPress={() => toggleTopping(topping)}
              style={[
                styles.toppingRow,
                toppings.includes(topping) && styles.toppingRowSelected,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.toppingLeft}>
                <View
                  style={[
                    styles.checkbox,
                    toppings.includes(topping) && styles.checkboxSelected,
                  ]}
                >
                  {toppings.includes(topping) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.toppingLabel,
                    toppings.includes(topping) && styles.toppingLabelSelected,
                  ]}
                >
                  {topping}
                </Text>
              </View>
              <Text
                style={[
                  styles.toppingPrice,
                  toppings.includes(topping) && styles.toppingPriceSelected,
                ]}
              >
                +
                {(topping === "Bắp"
                  ? 2000
                  : topping === "Phô mai Cheddar"
                  ? 5000
                  : 10000
                ).toLocaleString("vi-VN")}
                đ
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spiciness - CHỈ HIỂN thị cho món phù hợp */}
        {displayName.toLowerCase().includes("gà") ||
        displayName.toLowerCase().includes("chicken") ||
        displayName.toLowerCase().includes("cay") ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🌶️ Độ cay</Text>
              <Text style={styles.optionalBadge}>Tùy chọn</Text>
            </View>
            <View style={styles.optionsGrid}>
              {["Không cay", "Cay", "Rất cay"].map((level) => {
                return (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setSelectedSpiciness(level)}
                    style={[
                      styles.optionCard,
                      selectedSpiciness === level && styles.optionCardSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        selectedSpiciness === level &&
                          styles.optionLabelSelected,
                      ]}
                    >
                      {level}
                    </Text>
                    {selectedSpiciness === level && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Ghi chú đặc biệt</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Thêm yêu cầu đặc biệt..."
            placeholderTextColor={COLORS.textLight}
            style={styles.noteInput}
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      {/* Floating Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTop}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.qtyButton}
              activeOpacity={0.7}
            >
              <Minus size={20} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={styles.qtyButton}
              activeOpacity={0.7}
            >
              <Plus size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalPrice}>
              {totalPrice.toLocaleString("vi-VN")}đ
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.gradientPrimary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButtonGradient}
          >
            <ShoppingCart size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Thêm vào giỏ</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroContainer: {
    position: "relative",
    height: 320,
    backgroundColor: COLORS.extraLightGray,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "40%",
  },
  backButton: {
    position: "absolute",
    top: SPACING.xl,
    left: SPACING.m,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    padding: SPACING.s,
    ...SHADOWS.medium,
  },
  favButton: {
    position: "absolute",
    top: SPACING.xl,
    right: SPACING.m,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    padding: SPACING.s,
    ...SHADOWS.medium,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoHeader: {
    marginBottom: SPACING.m,
  },
  infoLeft: {
    flex: 1,
  },
  foodName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  foodDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  ratingValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "700",
  },
  ratingCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  priceValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: "800",
  },
  section: {
    padding: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  requiredBadge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: RADIUS.s,
    fontWeight: "700",
  },
  optionalBadge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: RADIUS.s,
    fontWeight: "700",
  },
  optionsGrid: {
    flexDirection: "row",
    gap: SPACING.s,
  },
  optionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
    position: "relative",
  },
  optionCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionContent: {
    alignItems: "center",
  },
  optionLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: COLORS.white,
  },
  optionPrice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  optionPriceSelected: {
    color: COLORS.white,
  },
  selectedIndicator: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  toppingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    marginBottom: SPACING.s,
  },
  toppingRowSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toppingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.m,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.s,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  checkmark: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  toppingLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  toppingLabelSelected: {
    color: COLORS.white,
  },
  toppingPrice: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: "700",
  },
  toppingPriceSelected: {
    color: COLORS.white,
  },
  noteInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: "top",
  },
  footer: {
    position: "absolute",
    bottom: 60, // Above bottom nav
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.large,
  },
  footerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    padding: 4,
    gap: SPACING.m,
  },
  qtyButton: {
    padding: SPACING.s,
  },
  qtyText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    fontWeight: "700",
    minWidth: 30,
    textAlign: "center",
  },
  totalContainer: {
    alignItems: "flex-end",
  },
  totalLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  totalPrice: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontWeight: "800",
  },
  addButton: {
    borderRadius: RADIUS.m,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.m,
    gap: SPACING.s,
  },
  addButtonText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.white,
    fontWeight: "700",
  },
});
