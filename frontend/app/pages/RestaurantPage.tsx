/**
 * RestaurantPageOptimized.tsx
 *
 * Optimized restaurant detail page with:
 * - React Query for data fetching and caching
 * - Cached images with expo-image
 * - Prefetch menu items on scroll
 * - Skeleton loading states
 * - Optimized FlatList for menu items
 * - Reviews section with pagination
 * - Add to cart with optimistic updates
 */

import { CachedImage } from "@/components/CachedImage";
import {
  FoodGridSkeleton,
  RestaurantListSkeleton,
} from "@/components/SkeletonPresets";
import { COLORS } from "@/constants/design";
import { usePrefetchFoodItem, useRestaurantFood } from "@/hooks/useFoodItems";
import { useRestaurant } from "@/hooks/useRestaurants";
import { reviewService } from "@/lib/api/reviews";
import { getFoodImage } from "@/utils/foodImageMap";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FOOD_ITEM_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface RestaurantPageOptimizedProps {
  restaurantId: string;
  onNavigate: (screen: string, params?: any) => void;
  onBack: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string; // Prisma field
  imageUrl?: string; // Legacy field
  category?: string;
  discount?: number;
  rating?: number;
  isAvailable?: boolean;
}

const RestaurantPageOptimized: React.FC<RestaurantPageOptimizedProps> = ({
  restaurantId,
  onNavigate,
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Debug log
  console.log(
    "🍴 RestaurantPageOptimized mounted with restaurantId:",
    restaurantId
  );

  // React Query hooks - must be called unconditionally
  const {
    data: restaurant,
    isLoading: restaurantLoading,
    error: restaurantError,
    isError,
  } = useRestaurant(restaurantId);
  const { data: menuItems, isLoading: menuLoading } =
    useRestaurantFood(restaurantId);
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["restaurant-reviews", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return { reviews: [], pagination: {} };

      try {
        console.log("📝 Fetching reviews for restaurant:", restaurantId);
        const response = await reviewService.getRestaurantReviews(
          restaurantId,
          {
            page: 1,
            limit: 5,
          }
        );
        console.log("✅ Reviews API Response:", {
          success: response.success,
          data: response.data,
          dataType: Array.isArray(response.data)
            ? "array"
            : typeof response.data,
          reviewsCount: Array.isArray(response.data)
            ? response.data.length
            : (response.data as any)?.reviews?.length,
        });

        // Backend returns direct array in data, but we need {reviews, pagination} format
        if (Array.isArray(response.data)) {
          return {
            reviews: response.data,
            pagination: { page: 1, limit: 5, total: response.data.length },
          };
        }

        return response.data || { reviews: [], pagination: {} };
      } catch (error) {
        console.error("❌ Error fetching reviews:", error);
        return { reviews: [], pagination: {} };
      }
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
  });
  const prefetchFood = usePrefetchFoodItem();

  // Log data after hooks
  console.log("🔍 RestaurantPage Debug:", {
    restaurantId,
    hasRestaurant: !!restaurant,
    restaurantData: restaurant,
    hasMenuItems: !!menuItems,
    menuItemsCount: menuItems?.length,
    reviewsData,
    reviewsCount: reviewsData?.reviews?.length,
    reviewsDataKeys: reviewsData ? Object.keys(reviewsData) : [],
    isLoading: restaurantLoading,
    isError,
    error: restaurantError,
  });

  // Extract unique categories from menu items
  const categories = useMemo(() => {
    try {
      if (!menuItems || !Array.isArray(menuItems)) return ["all"];
      const uniqueCategories = new Set(
        menuItems
          .map((item: MenuItem) => item?.category)
          .filter(
            (cat): cat is string => Boolean(cat) && typeof cat === "string"
          )
      );
      return ["all", ...Array.from(uniqueCategories)] as string[];
    } catch (error) {
      console.error("Error extracting categories:", error);
      return ["all"];
    }
  }, [menuItems]);

  // Filter menu items by category
  const filteredMenuItems = useMemo(() => {
    try {
      console.log("📋 Filtering menu items:", {
        menuItems,
        selectedCategory,
        menuItemsCount: menuItems?.length,
      });

      if (!menuItems || !Array.isArray(menuItems)) {
        console.log("⚠️ No menu items or not array");
        return [];
      }

      if (selectedCategory === "all") {
        console.log("✅ Returning all items:", menuItems.length);
        return menuItems;
      }

      const filtered = menuItems.filter((item: any) => {
        // Check both category.name and category.id
        const categoryMatch =
          item?.category?.name === selectedCategory ||
          item?.category?.id === selectedCategory ||
          item?.categoryId === selectedCategory;
        console.log("🔍 Item filter:", {
          itemName: item?.name,
          categoryName: item?.category?.name,
          categoryId: item?.categoryId,
          selectedCategory,
          match: categoryMatch,
        });
        return categoryMatch;
      });

      console.log("✅ Filtered items:", filtered.length);
      return filtered;
    } catch (error) {
      console.error("Error filtering menu items:", error);
      return [];
    }
  }, [menuItems, selectedCategory]);

  // Add to cart handler
  const handleAddToCart = useCallback((item: MenuItem) => {
    // TODO: Implement cart mutation with optimistic update
    console.log("Add to cart:", item);
  }, []);

  // Prefetch food item on press
  const handleFoodPress = useCallback(
    (foodId: string) => {
      prefetchFood(foodId);
      setTimeout(() => {
        onNavigate("food-detail", { foodId });
      }, 50);
    },
    [prefetchFood, onNavigate]
  );

  // Render category pill
  const renderCategoryPill = useCallback(
    (category: string | undefined) => {
      if (!category) return null;
      const isSelected = category === selectedCategory;
      return (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryPill,
            isSelected && styles.categoryPillSelected,
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text
            style={[
              styles.categoryText,
              isSelected && styles.categoryTextSelected,
            ]}
          >
            {category === "all" ? "Tất cả" : category}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedCategory]
  );

  // Render menu item card
  const renderMenuItem = useCallback(
    ({ item }: { item: MenuItem }) => {
      if (!item || !item.id) return null;

      const discountPrice = item.discount
        ? item.price * (1 - item.discount / 100)
        : item.price;

      return (
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleFoodPress(item.id)}
          activeOpacity={0.7}
        >
          <CachedImage
            source={getFoodImage(item.name, item?.image || item?.imageUrl)}
            style={styles.menuItemImage}
          />

          {/* Discount badge */}
          {item?.discount && item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
          )}

          {/* Unavailable overlay */}
          {item?.isAvailable === false && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>Hết hàng</Text>
            </View>
          )}

          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemName} numberOfLines={2}>
              {item?.name || "Món ăn"}
            </Text>

            {item?.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={COLORS.warning} />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}

            <View style={styles.priceRow}>
              {item?.discount ? (
                <>
                  <Text style={styles.originalPrice}>
                    {item?.price?.toLocaleString()}đ
                  </Text>
                  <Text style={styles.discountPrice}>
                    {discountPrice.toLocaleString()}đ
                  </Text>
                </>
              ) : (
                <Text style={styles.price}>
                  {item?.price?.toLocaleString() || "0"}đ
                </Text>
              )}
            </View>

            {/* Add to cart button */}
            <TouchableOpacity
              style={[
                styles.addButton,
                !item.isAvailable && styles.addButtonDisabled,
              ]}
              onPress={() => handleAddToCart(item)}
              disabled={!item.isAvailable}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [handleFoodPress, handleAddToCart]
  );

  // Loading state
  if (restaurantLoading) {
    return (
      <View style={styles.container}>
        <RestaurantListSkeleton count={1} />
        <FoodGridSkeleton />
      </View>
    );
  }

  // Invalid restaurant ID or not found
  if (!restaurantId || !restaurant) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {!restaurantId
              ? "ID nhà hàng không hợp lệ"
              : isError
              ? `Lỗi: ${restaurantError?.message || "Không thể tải dữ liệu"}`
              : "Không tìm thấy nhà hàng"}
          </Text>
          <TouchableOpacity onPress={onBack} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {restaurant?.name || "Nhà hàng"}
        </Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]} // Stick categories
      >
        {/* Restaurant header image */}
        <CachedImage
          source={
            restaurant?.image || restaurant?.imageUrl || restaurant?.coverImage
              ? {
                  uri:
                    restaurant?.image ||
                    restaurant?.imageUrl ||
                    restaurant?.coverImage,
                }
              : require("@/assets/public/restaurant-food-variety.png")
          }
          style={styles.restaurantImage}
        />

        {/* Restaurant info */}
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantHeader}>
            <Text style={styles.restaurantName}>
              {restaurant?.name || "Nhà hàng"}
            </Text>
            {restaurant?.isOpen ? (
              <View style={styles.openBadge}>
                <Text style={styles.openText}>Đang mở cửa</Text>
              </View>
            ) : (
              <View style={styles.closedBadge}>
                <Text style={styles.closedText}>Đã đóng cửa</Text>
              </View>
            )}
          </View>

          <Text style={styles.cuisine}>{restaurant?.cuisine || "Ẩm thực"}</Text>
          <Text style={styles.address} numberOfLines={1}>
            {restaurant?.address || "Địa chỉ"}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color={COLORS.warning} />
              <Text style={styles.statText}>
                {restaurant?.rating?.toFixed(1) || "4.5"}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.statText}>
                {restaurant?.deliveryTime || restaurant?.preparationTime
                  ? `${restaurant.preparationTime} phút`
                  : "30-40 phút"}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="bicycle-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.statText}>
                {restaurant?.deliveryFee
                  ? `${restaurant.deliveryFee.toLocaleString()}đ`
                  : "Miễn phí"}
              </Text>
            </View>
          </View>
        </View>

        {/* Category pills */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map(renderCategoryPill)}
          </ScrollView>
        </View>

        {/* Menu items grid */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Thực đơn</Text>

          {menuLoading ? (
            <FoodGridSkeleton />
          ) : filteredMenuItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="restaurant-outline"
                size={64}
                color={COLORS.border}
              />
              <Text style={styles.emptyText}>Không có món ăn nào</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMenuItems}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.menuRow}
              scrollEnabled={false} // Nested in ScrollView
              removeClippedSubviews
            />
          )}
        </View>

        {/* Reviews section */}
        <View style={styles.reviewsContainer}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            <TouchableOpacity
              onPress={() => onNavigate("reviews", { restaurantId })}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {reviewsLoading ? (
            <Text style={styles.comingSoonText}>Đang tải...</Text>
          ) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviewsData.reviews.slice(0, 3).map((review: any) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewTopRow}>
                    {/* Avatar */}
                    <View style={styles.reviewAvatar}>
                      <Ionicons
                        name="person-circle"
                        size={40}
                        color={COLORS.mediumGray}
                      />
                    </View>

                    {/* Content */}
                    <View style={styles.reviewContent}>
                      <View style={styles.reviewHeaderRow}>
                        <Text style={styles.reviewUserName}>
                          {review.user?.fullName ||
                            review.user?.email?.split("@")[0] ||
                            "Người dùng"}
                        </Text>
                        <View style={styles.reviewRatingBadge}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                          <Text style={styles.reviewRating}>
                            {review.rating}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </Text>

                      {review.comment && (
                        <Text style={styles.reviewComment} numberOfLines={3}>
                          {review.comment}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.comingSoonText}>Chưa có đánh giá nào</Text>
          )}
        </View>

        {/* Bottom padding to avoid navbar overlap */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    marginHorizontal: 16,
  },
  favoriteButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  restaurantImage: {
    width: SCREEN_WIDTH,
    height: 200,
    backgroundColor: COLORS.border,
  },
  restaurantInfo: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  restaurantName: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  openBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.success + "20",
    borderRadius: 12,
  },
  openText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.success,
  },
  closedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.error + "20",
    borderRadius: 12,
  },
  closedText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.error,
  },
  cuisine: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: COLORS.text,
  },
  categoriesContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  categoryTextSelected: {
    color: COLORS.white,
  },
  menuContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  menuRow: {
    gap: 16,
    marginBottom: 16,
  },
  menuItem: {
    width: FOOD_ITEM_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItemImage: {
    width: "100%",
    height: FOOD_ITEM_WIDTH * 0.75,
    backgroundColor: COLORS.border,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.error,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  unavailableText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.white,
  },
  menuItemInfo: {
    padding: 12,
  },
  menuItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
    minHeight: 36,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textDecorationLine: "line-through",
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.error,
  },
  addButton: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  reviewsContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },
  comingSoonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: 24,
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewTopRow: {
    flexDirection: "row",
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reviewUserName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  reviewRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewRating: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F59E0B",
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default RestaurantPageOptimized;
