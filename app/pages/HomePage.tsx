import { FoodCard } from "@/components/FoodCard";
import { FoodCardSkeleton } from "@/components/Skeleton";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/design";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/store/cart-context";
import { getFoodImage } from "@/utils/foodImageMap";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, ChevronDown, MapPin, Search } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HomePageProps {
  onNavigate?: (page: string, data?: any) => void;
  favorites?: any[];
  onToggleFavorite?: (item: any) => void;
}

interface FoodItem {
  id: string | number;
  name: string;
  image_url: string | null;
  price: number | null;
  rating: number | null;
  category: string | null;
  collection?: string | null;
}

const ICON_BY_CATEGORY: Record<string, string> = {
  rice: "🍚",
  healthy: "🥗",
  drink: "🥤",
  fastfood: "🍔",
};

const DEALS_LIMIT = 4;
const PRODUCTS_LIMIT = 6;

export default function HomePage({
  onNavigate = () => {},
  favorites: externalFavorites = [],
  onToggleFavorite,
}: HomePageProps) {
  const [deals, setDeals] = useState<FoodItem[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { cartCount } = useCart();
  const { items: dbFavorites, toggle } = useFavorites();

  // Combine external favorites with database favorites
  const allFavorites = useMemo(() => {
    const favIds = new Set([
      ...externalFavorites.map((f) => String(f.id)),
      ...dbFavorites.map((f) => String(f.food_item_id)),
    ]);
    return favIds;
  }, [externalFavorites, dbFavorites]);

  // Handle toggle favorite
  const handleToggleFavorite = async (item: any) => {
    if (onToggleFavorite) {
      onToggleFavorite(item);
    } else {
      // Use hook to save to database
      await toggle(String(item.id), {
        name: item.name,
        image: item.image_url,
        price: item.price,
      });
    }
  };

  // ✅ Fetch categories & data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Use REST API instead of Supabase RPC
      const response = await fetch("http://localhost:5000/api/v1/food");
      const result = await response.json();

      console.log("📦 API response:", result);

      if (!result.success) {
        console.error("❌ API error:", result.message);
        return;
      }

      const menuData = result.data;
      if (menuData && Array.isArray(menuData)) {
        // Transform data to match expected format
        const transformedData = menuData.map((item: any) => ({
          id: item.id,
          name: item.name,
          image_url: item.image,
          price: item.price,
          rating: 4.5,
          category: item.categoryId || "fastfood",
        }));

        // Extract unique categories
        const categoriesList = Array.from(
          new Set(transformedData.map((item) => item.category).filter(Boolean))
        );
        setCategories(categoriesList as string[]);

        // Set deals and foods
        setDeals(transformedData.slice(0, DEALS_LIMIT));
        setFoods(transformedData.slice(0, PRODUCTS_LIMIT));

        console.log("✅ Loaded", transformedData.length, "food items");
      }
    } catch (err) {
      console.error("❌ Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      // Use REST API
      const response = await fetch("http://localhost:5000/api/v1/food");
      const result = await response.json();

      if (result.success && result.data) {
        const transformedData = result.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          image_url: item.image,
          price: item.price,
          rating: 4.5,
          category: item.categoryId || "fastfood",
        }));

        // Filter by category if not "all"
        const filteredData =
          activeCategory === "all"
            ? transformedData
            : transformedData.filter(
                (item: any) => item.category === activeCategory
              );

        setDeals(filteredData.slice(0, DEALS_LIMIT));
        setFoods(filteredData.slice(0, PRODUCTS_LIMIT));
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchFoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ✅ Dữ liệu hiển thị
  const uiCategories = useMemo(
    () => [
      { id: "all", name: "TẤT CẢ", icon: "🍽️" },
      ...categories.map((id) => ({
        id,
        name: id.toUpperCase(),
        icon: ICON_BY_CATEGORY[id] ?? "🍽️",
      })),
    ],
    [categories]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: SPACING.bottomNav }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Gradient Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.locationRow}>
            <MapPin size={20} color="#fff" />
            <Text style={styles.locationText}>Delivering to Home</Text>
            <ChevronDown size={16} color="#fff" />
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => onNavigate?.("notifications")}
          >
            <Bell size={22} color="#fff" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBox}
          onPress={() => onNavigate("search", {})}
        >
          <Search size={20} color={COLORS.textSecondary} />
          <Text style={styles.searchPlaceholder}>Tìm món ăn yêu thích...</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {uiCategories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.categoryChip,
                activeCategory === item.id && styles.categoryChipActive,
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
          ))}
        </ScrollView>
      </View>

      {/* Deals Section */}
      {deals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Đơn tốt hôm nay</Text>
            <TouchableOpacity
              onPress={() =>
                onNavigate("search", {
                  filters: { sort: "rating_desc" },
                  title: "Món ăn đánh giá cao",
                })
              }
            >
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dealsScroll}
          >
            {loading ? (
              <>
                <FoodCardSkeleton />
                <FoodCardSkeleton />
              </>
            ) : (
              deals.map((item) => (
                <FoodCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  image={getFoodImage(item.name)}
                  price={item.price ?? 0}
                  rating={item.rating ?? 0}
                  isFavorite={allFavorites.has(String(item.id))}
                  onPress={() => onNavigate("food-details", item)}
                  onFavoritePress={() => handleToggleFavorite(item)}
                />
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* All Foods Grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Khám phá món ngon</Text>
          <TouchableOpacity
            onPress={() =>
              onNavigate("search", {
                filters: {
                  category: activeCategory !== "all" ? activeCategory : "",
                },
                title:
                  activeCategory !== "all"
                    ? `Món ${activeCategory}`
                    : "Tất cả món ăn",
              })
            }
          >
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.foodGrid}>
          {loading ? (
            <>
              <FoodCardSkeleton />
              <FoodCardSkeleton />
              <FoodCardSkeleton />
              <FoodCardSkeleton />
            </>
          ) : foods.length === 0 ? (
            <Text style={styles.emptyText}>Không tìm thấy món ăn phù hợp</Text>
          ) : (
            foods.map((item) => (
              <FoodCard
                key={item.id}
                id={item.id}
                name={item.name}
                image={getFoodImage(item.name)}
                price={item.price ?? 0}
                rating={item.rating ?? 0}
                isFavorite={allFavorites.has(String(item.id))}
                onPress={() => onNavigate("food-details", item)}
                onFavoritePress={() => handleToggleFavorite(item)}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.l,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  locationText: {
    ...TYPOGRAPHY.body,
    color: "#fff",
    fontWeight: "600",
  },
  notificationBtn: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.dark,
    fontSize: 10,
    fontWeight: "700",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: RADIUS.l,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    gap: SPACING.s,
    ...SHADOWS.medium,
  },
  searchPlaceholder: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
  },
  categoriesSection: {
    paddingVertical: SPACING.m,
  },
  categoryList: {
    paddingHorizontal: SPACING.m,
    gap: SPACING.s,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: COLORS.primary,
  },
  section: {
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  seeAll: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
  dealsScroll: {
    gap: SPACING.m,
    paddingRight: SPACING.m,
  },
  foodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.m,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: SPACING.xl,
  },
});
