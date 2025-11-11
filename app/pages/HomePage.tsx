import { FoodCard } from "@/components/FoodCard";
import { FoodCardSkeleton } from "@/components/Skeleton";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/design";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/store/cart-context";
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

// Map ảnh static
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
  favorites = [],
  onToggleFavorite = () => {},
}: HomePageProps) {
  const [deals, setDeals] = useState<FoodItem[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { cartCount } = useCart();

  // ✅ Fetch categories & data
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get categories
      const { data: categoryData } = await supabase
        .from("food_items")
        .select("category");

      if (categoryData) {
        const categoriesList = Array.from(
          new Set(
            categoryData
              .map((r: any) => r.category?.trim().toLowerCase())
              .filter((v: string | undefined): v is string => !!v)
          )
        );
        setCategories(categoriesList as string[]);
      }

      await fetchFoods();
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    let baseQuery = supabase
      .from("food_items")
      .select("id, name, image_url, price, rating, category");

    if (activeCategory !== "all")
      baseQuery = baseQuery.eq("category", activeCategory);

    const [{ data: dealsData }, { data: foodsData }] = await Promise.all([
      baseQuery
        .gt("rating", 4.5)
        .order("rating", { ascending: false })
        .limit(DEALS_LIMIT),
      baseQuery.order("rating", { ascending: false }).limit(PRODUCTS_LIMIT),
    ]);

    setDeals(dealsData ?? []);
    setFoods(foodsData ?? []);
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
          <TouchableOpacity style={styles.notificationBtn}>
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
            <Text style={styles.sectionTitle}>🔥 Hot Deals Today</Text>
            <Text style={styles.seeAll}>Xem tất cả</Text>
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
                  image={
                    item.image_url && IMAGE_MAP[item.image_url]
                      ? IMAGE_MAP[item.image_url]
                      : require("@/assets/public/placeholder.jpg")
                  }
                  price={item.price ?? 0}
                  rating={item.rating ?? 0}
                  isFavorite={favorites.some((f) => f.id === item.id)}
                  onPress={() => onNavigate("food-details", item)}
                  onFavoritePress={() => onToggleFavorite(item)}
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
          <Text style={styles.seeAll}>Xem tất cả</Text>
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
                image={
                  item.image_url && IMAGE_MAP[item.image_url]
                    ? IMAGE_MAP[item.image_url]
                    : require("@/assets/public/placeholder.jpg")
                }
                price={item.price ?? 0}
                rating={item.rating ?? 0}
                isFavorite={favorites.some((f) => f.id === item.id)}
                onPress={() => onNavigate("food-details", item)}
                onFavoritePress={() => onToggleFavorite(item)}
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
