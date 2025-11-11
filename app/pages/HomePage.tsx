import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/store/cart-context";
import { Search } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  collection: string | null;
}

interface Restaurant {
  id: string | number;
  name: string;
  cuisine: string | null;
  time_minutes: number | null;
  rating: number | null;
  image_url: string | null;
  tags: string[] | null;
}

const ICON_BY_CATEGORY: Record<string, string> = {
  rice: "🍚",
  healthy: "🥗",
  drink: "🥤",
  fastfood: "🍔",
};

const LABEL_BY_COLLECTION: Record<
  string,
  { name: string; color: string; icon: string }
> = {
  freeship: { name: "FREESHIP", color: "#a7f3d0", icon: "🍱" },
  "deal-1": { name: "DEAL $1", color: "#fde68a", icon: "🍦" },
  "near-you": { name: "NEAR YOU", color: "#bfdbfe", icon: "🍔" },
  popular: { name: "POPULAR", color: "#e9d5ff", icon: "⭐" },
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
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [voucherCount, setVoucherCount] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeCollection, setActiveCollection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartKey, setCartKey] = useState<string>("");

  // 🛒 Lấy context cart realtime
  const { setCartCount } = useCart();

  // ✅ Lấy danh mục và bộ sưu tập
  useEffect(() => {
    const loadMeta = async () => {
      const { data, error } = await supabase
        .from("food_items")
        .select("category, collection");

      if (!error && data) {
        const categoriesList = Array.from(
          new Set(
            data
              .map((r: any) => r.category?.trim().toLowerCase())
              .filter((v: string | undefined): v is string => !!v)
          )
        );

        const collectionsList = Array.from(
          new Set(
            data
              .map((r: any) => r.collection?.trim().toLowerCase())
              .filter((v: string | undefined): v is string => !!v)
          )
        );

        setCategories(categoriesList as string[]);
        setCollections(collectionsList as string[]);
      }
    };
    loadMeta();
  }, []);

  // ✅ Lấy danh sách nhà hàng
  useEffect(() => {
    const loadRestaurants = async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("id, name, cuisine, time_minutes, rating, image_url, tags")
        .order("rating", { ascending: false })
        .limit(10);
      setRestaurants(data ?? []);
    };
    loadRestaurants();
  }, []);

  // ✅ Đếm số lượng voucher hoạt động
  useEffect(() => {
    const fetchActiveVoucherCount = async () => {
      const { data } = await supabase
        .from("vouchers")
        .select("id, expiry_date, status");
      if (data) {
        const today = new Date().setHours(0, 0, 0, 0);
        const active = data.filter((v: any) => {
          const s =
            v.status && v.status !== "active"
              ? v.status
              : new Date(v.expiry_date).getTime() < today
              ? "expired"
              : "active";
          return s === "active";
        }).length;
        setVoucherCount(active);
      }
    };
    fetchActiveVoucherCount().catch(() => setVoucherCount(null));
  }, []);

  // ✅ Lấy món ăn (deal + food)
  useEffect(() => {
    const fetchData = async () => {
      let baseQuery = supabase
        .from("food_items")
        .select("id, name, image_url, price, rating, category, collection");

      if (activeCategory !== "all")
        baseQuery = baseQuery.eq("category", activeCategory);
      if (activeCollection !== "all")
        baseQuery = baseQuery.eq("collection", activeCollection);
      if (searchQuery.trim())
        baseQuery = baseQuery.ilike("name", `%${searchQuery.trim()}%`);

      const dealsQuery = baseQuery
        .ilike("collection", "%deal%")
        .order("rating", { ascending: false })
        .limit(DEALS_LIMIT);

      const foodsQuery = baseQuery
        .order("rating", { ascending: false })
        .limit(PRODUCTS_LIMIT);

      const [{ data: dealsData }, { data: foodsData }] = await Promise.all([
        dealsQuery,
        foodsQuery,
      ]);

      setDeals(dealsData ?? []);
      setFoods(foodsData ?? []);
    };
    fetchData();
  }, [activeCategory, activeCollection, searchQuery]);

  // ✅ Dữ liệu hiển thị
  const uiCategories = useMemo(
    () =>
      categories.map((id) => ({
        id,
        name: id.toUpperCase(),
        icon: ICON_BY_CATEGORY[id] ?? "🍽️",
      })),
    [categories]
  );

  const uiCollections = useMemo(
    () =>
      collections.map((id) => {
        const meta = LABEL_BY_COLLECTION[id] ?? {
          name: id.toUpperCase(),
          color: "#e5e7eb",
          icon: "🧩",
        };
        return { id, ...meta };
      }),
    [collections]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏠 Home</Text>
        <View style={styles.searchBox}>
          <Search size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                onNavigate("search", { initialQuery: searchQuery.trim() });
              }
            }}
          />
        </View>
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={uiCategories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              activeCategory === item.id && styles.categoryActive,
            ]}
            onPress={() =>
              setActiveCategory(activeCategory === item.id ? "all" : item.id)
            }
          >
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
        <View style={styles.grid}>
          {foods.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={styles.card}
              onPress={() => onNavigate("food-details", f)}
            >
              <Image
                source={
                  f.image_url && IMAGE_MAP[f.image_url]
                    ? IMAGE_MAP[f.image_url]
                    : require("@/assets/public/placeholder.jpg")
                }
                style={styles.cardImg}
              />
              <Text style={styles.cardTitle}>{f.name}</Text>
              <Text style={styles.cardSubtitle}>
                ⭐ {f.rating ?? "—"} | ${f.price ?? "—"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Deals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Giảm giá đến 50%</Text>
        {deals.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có deal nào.</Text>
        ) : (
          deals.map((d) => (
            <TouchableOpacity
              key={d.id}
              onPress={() => onNavigate("food-details", d)}
              style={styles.dealCard}
            >
              <Image
                source={
                  d.image_url && IMAGE_MAP[d.image_url]
                    ? IMAGE_MAP[d.image_url]
                    : require("@/assets/public/placeholder.jpg")
                }
                style={styles.dealImg}
              />
              <View style={styles.dealOverlay}>
                <Text style={styles.dealName}>{d.name}</Text>
                <Text style={styles.dealRating}>⭐ {d.rating ?? "—"}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: "#06b6d4", padding: 16 },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: "#333" },
  categoryList: { paddingHorizontal: 10, marginTop: 10 },
  categoryItem: {
    alignItems: "center",
    marginRight: 16,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  categoryActive: { backgroundColor: "#bae6fd" },
  categoryIcon: { fontSize: 22 },
  categoryText: { marginTop: 4, fontSize: 12, color: "#333" },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "47%",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    paddingBottom: 8,
    overflow: "hidden",
  },
  cardImg: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginTop: 6,
    marginHorizontal: 6,
  },
  cardSubtitle: { fontSize: 12, color: "#666", marginHorizontal: 6 },
  dealCard: { borderRadius: 10, overflow: "hidden", marginBottom: 10 },
  dealImg: { width: "100%", height: 140 },
  dealOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  dealName: { color: "#fff", fontWeight: "700" },
  dealRating: { color: "#fff", fontSize: 12 },
  emptyText: { color: "#888", fontSize: 13 },
});
