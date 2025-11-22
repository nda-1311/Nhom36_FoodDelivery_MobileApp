/**
 * HomePage - Optimized Version với React Query
 *
 * Features:
 * - React Query caching
 * - Skeleton loading
 * - Image caching
 * - Prefetching
 * - Pull to refresh
 * - Optimized FlatList
 */

import { LinearGradient } from "expo-linear-gradient";
import { Bell, MapPin, Search } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Hooks
import { useFavorites } from "@/hooks/useFavorites";
import { useDealFoods, useFoodItems } from "@/hooks/useFoodItems";
import { usePrefetchRestaurant, useRestaurants } from "@/hooks/useRestaurants";
import { useCart } from "@/store/cart-context";

// Components
import { BannerCarousel, MOCK_BANNERS } from "@/components/BannerCarousel";
import { CachedImage } from "@/components/CachedImage";
import { FoodCard } from "@/components/FoodCard";
import {
  BannerSkeleton,
  CategoryPillsSkeleton,
  FoodGridSkeleton,
  RestaurantListSkeleton,
} from "@/components/SkeletonPresets";

// Constants
import { COLORS, SPACING } from "@/constants/design";

// Utils
import { getFoodImage } from "@/utils/foodImageMap";

interface HomePageProps {
  onNavigate?: (page: string, data?: any) => void;
}

export default function HomePage({ onNavigate = () => {} }: HomePageProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const { cartCount } = useCart();
  const { items: favorites, toggle: toggleFavorite } = useFavorites();

  console.log("🏠 HomePage rendering with cartCount:", cartCount);

  // Handle favorite toggle with error handling
  const handleFavoriteToggle = useCallback(
    async (
      foodId: string,
      meta?: { name?: string; image?: string; price?: number }
    ) => {
      try {
        await toggleFavorite(foodId, meta);
      } catch (error: any) {
        console.error("❌ Favorite toggle error:", error);
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
    },
    [toggleFavorite, onNavigate]
  );

  // React Query hooks - tự động caching!
  const {
    data: deals,
    isLoading: dealsLoading,
    refetch: refetchDeals,
    error: dealsError,
  } = useDealFoods();

  const {
    data: restaurants,
    isLoading: restaurantsLoading,
    refetch: refetchRestaurants,
    error: restaurantsError,
  } = useRestaurants(); // Tạm thời bỏ filter để test

  console.log("📊 HomePage data:", {
    deals: deals?.length,
    dealsLoading,
    dealsError: dealsError?.message,
    restaurants: restaurants?.length,
    restaurantsLoading,
    restaurantsError: restaurantsError?.message,
  });

  // Fetch food items based on selected category
  const filterParams =
    activeCategory === "all" ? {} : { category: activeCategory };

  const {
    data: foodsByCategory,
    isLoading: foodsLoading,
    error: foodsError,
  } = useFoodItems(filterParams);

  console.log("🍔 Foods by category:", {
    activeCategory,
    count: foodsByCategory?.length,
    loading: foodsLoading,
    error: foodsError?.message,
  });

  // Prefetch function
  const prefetchRestaurant = usePrefetchRestaurant();

  // Pull to refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchDeals(), refetchRestaurants()]);
    setRefreshing(false);
  }, [refetchDeals, refetchRestaurants]);

  // Category filter
  const categories = [
    { id: "all", name: "Tất cả", icon: "🍽️" },
    { id: "Món Việt", name: "Món Việt", icon: "🍜" },
    { id: "Combo", name: "Combo", icon: "🍱" },
    { id: "Burger", name: "Burger", icon: "🍔" },
    { id: "Pizza", name: "Pizza", icon: "🍕" },
    { id: "Sushi", name: "Sushi", icon: "🍣" },
    { id: "Món Gà", name: "Món Gà", icon: "🍗" },
    { id: "Salad", name: "Salad", icon: "🥗" },
    { id: "Đồ Uống", name: "Đồ Uống", icon: "🥤" },
    { id: "Món Phụ", name: "Món Phụ", icon: "🍢" },
    { id: "Hải Sản", name: "Hải Sản", icon: "🦞" },
  ];

  // Render functions - memoized
  const renderCategoryItem = useCallback(
    ({ item }: any) => (
      <TouchableOpacity
        style={[
          styles.categoryPill,
          activeCategory === item.id && styles.categoryPillActive,
        ]}
        onPress={() => setActiveCategory(item.id)}
      >
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <Text
          style={[
            styles.categoryText,
            activeCategory === item.id && styles.categoryTextActive,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    ),
    [activeCategory]
  );

  const renderDealItem = useCallback(
    ({ item }: any) => {
      const isFavorite = favorites.some(
        (f) => String(f.food_item_id) === String(item.id)
      );

      return (
        <TouchableOpacity
          style={styles.dealCard}
          onPress={() => onNavigate("food-details", { foodId: item.id })}
          activeOpacity={0.7}
        >
          <CachedImage
            source={getFoodImage(item.name, item.image)}
            style={styles.dealImage}
          />
          {item.discountPrice && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -{Math.round((1 - item.discountPrice / item.price) * 100)}%
              </Text>
            </View>
          )}
          <View style={styles.dealInfo}>
            <Text style={styles.dealName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.priceRow}>
              {item.discountPrice ? (
                <>
                  <Text style={styles.discountPrice}>
                    {formatPrice(item.discountPrice)}
                  </Text>
                  <Text style={styles.originalPrice}>
                    {formatPrice(item.price)}
                  </Text>
                </>
              ) : (
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
              )}
            </View>
          </View>

          {/* Favorite button */}
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleFavoriteToggle(String(item.id), {
                name: item.name,
                image: item.image,
                price: item.price,
              });
            }}
          >
            <Text>{isFavorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [favorites, handleFavoriteToggle, onNavigate]
  );

  const renderRestaurantItem = useCallback(
    ({ item }: any) => (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPressIn={() => {
          // Prefetch khi user bắt đầu nhấn
          prefetchRestaurant(item.id);
        }}
        onPress={() => {
          // Navigate - data đã được prefetch!
          onNavigate("restaurant", { restaurantId: item.id });
        }}
        activeOpacity={0.7}
      >
        <CachedImage
          source={
            item.coverImage || item.logo
              ? { uri: item.coverImage || item.logo }
              : require("@/assets/public/restaurant-food-variety.png")
          }
          style={styles.restaurantImage}
        />
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantHeader}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.restaurantAddress} numberOfLines={1}>
            📍 {item.address}
          </Text>

          <View style={styles.restaurantMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>
                🚚 {formatPrice(item.deliveryFee)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>
                ⏱️ {item.preparationTime} phút
              </Text>
            </View>
            {item.isOpen ? (
              <View style={[styles.metaItem, styles.openBadge]}>
                <Text style={styles.openText}>Đang mở</Text>
              </View>
            ) : (
              <View style={[styles.metaItem, styles.closedBadge]}>
                <Text style={styles.closedText}>Đã đóng</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [prefetchRestaurant, onNavigate]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#FF6B6B", "#FF8E53"]} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.locationContainer}>
            <MapPin size={20} color="#FFF" />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Giao đến</Text>
              <Text style={styles.locationText}>TP. Hồ Chí Minh</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => onNavigate("notifications")}
            >
              <Bell size={24} color="#FFF" />
              {/* Notification badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => onNavigate("search")}
          activeOpacity={0.7}
        >
          <Search size={20} color="#999" />
          <Text style={styles.searchPlaceholder}>Tìm món ăn, nhà hàng...</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Banner Carousel */}
        {MOCK_BANNERS.length > 0 ? (
          <BannerCarousel
            banners={MOCK_BANNERS}
            onBannerPress={(banner) => console.log("Banner pressed:", banner)}
          />
        ) : (
          <BannerSkeleton />
        )}

        {/* Categories */}
        <View style={styles.section}>
          {categories.length > 0 ? (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            />
          ) : (
            <CategoryPillsSkeleton />
          )}
        </View>

        {/* Món ăn theo danh mục */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === "all"
                ? "🔥 Tất cả món ăn"
                : `${
                    categories.find((c) => c.id === activeCategory)?.icon ||
                    "🍽️"
                  } ${activeCategory}`}
            </Text>
          </View>

          {foodsLoading ? (
            <FoodGridSkeleton />
          ) : foodsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Không thể tải món ăn</Text>
              <Text style={styles.errorDetail}>{foodsError.message}</Text>
            </View>
          ) : foodsByCategory &&
            Array.isArray(foodsByCategory) &&
            foodsByCategory.length > 0 ? (
            <View style={styles.popularGrid}>
              {foodsByCategory.slice(0, 6).map((food: any) => (
                <View
                  key={food?.id || Math.random()}
                  style={styles.popularItem}
                >
                  <FoodCard
                    id={food.id}
                    name={food.name}
                    image={getFoodImage(food.name, food.image)}
                    price={food.discountPrice || food.price}
                    rating={food.restaurant?.rating || 0}
                    isFavorite={favorites.some(
                      (f) => String(f.food_item_id) === String(food.id)
                    )}
                    onPress={() =>
                      onNavigate("food-details", { foodId: food.id })
                    }
                    onFavoritePress={() =>
                      handleFavoriteToggle(food.id, {
                        name: food.name,
                        image: getFoodImage(food.name, food.image),
                        price: food.discountPrice || food.price,
                      })
                    }
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Không có món ăn nào trong danh mục này
            </Text>
          )}
        </View>

        {/* Flash Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚡ Flash Deals</Text>
            <TouchableOpacity onPress={() => onNavigate("search")}>
              <Text style={styles.seeAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {dealsLoading ? (
            <FoodGridSkeleton count={4} />
          ) : dealsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Không thể tải ưu đãi</Text>
            </View>
          ) : deals && Array.isArray(deals) && deals.length > 0 ? (
            <FlatList
              data={deals}
              renderItem={renderDealItem}
              keyExtractor={(item) => String(item?.id || Math.random())}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dealsContainer}
            />
          ) : (
            <Text style={styles.emptyText}>Không có deal nào</Text>
          )}
        </View>

        {/* Nhà hàng gần bạn */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏪 Nhà hàng gần bạn</Text>
            <TouchableOpacity onPress={() => onNavigate("search")}>
              <Text style={styles.seeAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {restaurantsLoading ? (
            <RestaurantListSkeleton count={3} />
          ) : restaurantsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Không thể tải nhà hàng</Text>
            </View>
          ) : restaurants &&
            Array.isArray(restaurants) &&
            restaurants.length > 0 ? (
            <FlatList
              data={restaurants.slice(0, 5)}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => String(item?.id || Math.random())}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>Không có nhà hàng nào</Text>
          )}
        </View>
      </ScrollView>

      {/* Cart floating button */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.cartFloat}
          onPress={() => onNavigate("cart")}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Helper functions
function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationTextContainer: {
    marginLeft: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerBtn: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FFD700",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginTop: SPACING.sm,
  },
  searchPlaceholder: {
    marginLeft: SPACING.sm,
    fontSize: 15,
    color: "#999",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryPillActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  dealsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  dealCard: {
    width: 160,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    position: "relative",
  },
  dealImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E0E0E0",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  favoriteBtn: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  dealInfo: {
    padding: 12,
  },
  dealName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
  },
  restaurantCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#E0E0E0",
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  restaurantName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  ratingBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  restaurantAddress: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#666",
  },
  openBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  openText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  closedBadge: {
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  closedText: {
    fontSize: 12,
    color: "#F44336",
    fontWeight: "600",
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.lg,
    justifyContent: "space-between",
  },
  popularItem: {
    width: "48%",
    marginBottom: SPACING.md,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#999",
    paddingVertical: 20,
  },
  errorContainer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  cartFloat: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: "#FF6B6B",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cartIcon: {
    fontSize: 28,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FFD700",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
});
