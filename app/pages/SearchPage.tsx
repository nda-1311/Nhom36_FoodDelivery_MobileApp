import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 🖼️ Map ảnh tĩnh như HomePage
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

type FoodItem = {
  id: string | number;
  name: string;
  image_url: string | null;
  price: number | null;
  rating: number | null;
  category: string | null;
  collection: string | null;
};

const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { id: "rating_desc", label: "Rating ↓" },
  { id: "price_asc", label: "Price ↑" },
  { id: "price_desc", label: "Price ↓" },
  { id: "newest", label: "Newest" },
] as const;

interface SearchPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialQuery?: string;
  filters?: any;
  title?: string;
}

export default function SearchPage({
  onNavigate,
  initialQuery,
  filters,
  title,
}: SearchPageProps) {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState(filters?.q ?? initialQuery ?? "");
  const [category, setCategory] = useState(filters?.category ?? "");
  const [collection, setCollection] = useState(filters?.collection ?? "");
  const [sort, setSort] =
    useState<(typeof SORT_OPTIONS)[number]["id"]>("rating_desc");

  const [categories, setCategories] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);

  // Lấy danh mục
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("food_items")
        .select("category, collection");
      if (!error && data) {
        setCategories(
          Array.from(
            new Set(data.map((r) => r.category).filter(Boolean))
          ).sort()
        );
        setCollections(
          Array.from(
            new Set(data.map((r) => r.collection).filter(Boolean))
          ).sort()
        );
      }
    })();
  }, []);

  const fetchPage = async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    try {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let qBuilder = supabase
        .from("food_items")
        .select("id, name, image_url, price, rating, category, collection", {
          count: "exact",
        });

      if (category) qBuilder = qBuilder.eq("category", category);
      if (collection) qBuilder = qBuilder.eq("collection", collection);
      if (q.trim()) qBuilder = qBuilder.ilike("name", `%${q.trim()}%`);

      switch (sort) {
        case "price_asc":
          qBuilder = qBuilder.order("price", { ascending: true });
          break;
        case "price_desc":
          qBuilder = qBuilder.order("price", { ascending: false });
          break;
        case "newest":
          qBuilder = qBuilder.order("created_at", { ascending: false });
          break;
        default:
          qBuilder = qBuilder.order("rating", { ascending: false });
      }

      qBuilder = qBuilder.range(from, to);

      const { data, error, count } = await qBuilder;
      if (error) throw error;

      if (pageIndex === 0) setFoods(data ?? []);
      else setFoods((prev) => [...prev, ...(data ?? [])]);

      const total = count ?? 0;
      setHasMore(to + 1 < total);
      setPage(pageIndex);
    } catch (e: any) {
      setError(e.message ?? "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(0);
  }, [q, category, collection, sort]);

  const activeChips = useMemo(
    () =>
      [
        q ? { type: "q", label: `“${q}”` } : null,
        category ? { type: "category", label: category } : null,
        collection ? { type: "collection", label: collection } : null,
      ].filter(Boolean) as { type: string; label: string }[],
    [q, category, collection]
  );

  const clearChip = (type: string) => {
    if (type === "q") setQ("");
    if (type === "category") setCategory("");
    if (type === "collection") setCollection("");
  };

  const clearAll = () => {
    setQ("");
    setCategory("");
    setCollection("");
    setSort("rating_desc");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => onNavigate("home")}
          >
            <ArrowLeft size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title || "Search"}</Text>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Search size={18} color="#6b7280" />
          <TextInput
            placeholder="Search foods..."
            value={q}
            onChangeText={setQ}
            onSubmitEditing={() => fetchPage(0)}
            style={{ flex: 1, fontSize: 14, color: "#111" }}
          />
          {!!q && (
            <TouchableOpacity onPress={() => setQ("")}>
              <Text style={{ color: "#06b6d4", fontSize: 12 }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Filters */}
        <View style={styles.filterRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <SlidersHorizontal size={16} color="#111" />
            <Text style={{ fontSize: 13, fontWeight: "600" }}>Filters</Text>
          </View>
          <View style={styles.sortBox}>
            {SORT_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSort(s.id)}
                style={[
                  styles.sortChip,
                  sort === s.id && styles.sortChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.sortText,
                    sort === s.id && styles.sortTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={{ flexDirection: "row", gap: 8, marginVertical: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(category === c ? "" : c)}
                style={[styles.chip, category === c && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === c && styles.chipTextActive,
                  ]}
                >
                  {c.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Collections */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {collections.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCollection(collection === c ? "" : c)}
                style={[styles.chip, collection === c && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    collection === c && styles.chipTextActive,
                  ]}
                >
                  {c.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Active Filters */}
        {activeChips.length > 0 && (
          <View style={styles.activeChips}>
            {activeChips.map((chip) => (
              <View key={chip.type} style={styles.activeChip}>
                <Text style={styles.activeChipText}>{chip.label}</Text>
                <TouchableOpacity onPress={() => clearChip(chip.type)}>
                  <X size={12} color="#0e7490" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.resetBtn}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results */}
        {loading && page === 0 ? (
          <ActivityIndicator color="#06b6d4" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={foods}
            numColumns={2}
            columnWrapperStyle={{ gap: 10 }}
            contentContainerStyle={{ gap: 10, marginTop: 10 }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onNavigate("food-details", item)}
                style={styles.card}
              >
                <Image
                  source={
                    item.image_url && IMAGE_MAP[item.image_url]
                      ? IMAGE_MAP[item.image_url]
                      : require("@/assets/public/placeholder.jpg")
                  }
                  style={styles.cardImg}
                />
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>
                  ⭐ {item.rating ?? "—"} • ${item.price ?? "—"}
                </Text>
                {!!item.collection && (
                  <View
                    style={[
                      styles.badge,
                      item.collection.includes("free")
                        ? { backgroundColor: "#fef3c7" }
                        : { backgroundColor: "#cffafe" },
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.collection}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={() =>
              !loading ? (
                <Text style={styles.emptyText}>Không có kết quả phù hợp.</Text>
              ) : null
            }
          />
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <TouchableOpacity
            onPress={() => fetchPage(page + 1)}
            style={styles.loadMore}
          >
            <Text style={{ color: "#111" }}>Load more</Text>
          </TouchableOpacity>
        )}
        {loading && page > 0 && (
          <ActivityIndicator color="#06b6d4" style={{ marginTop: 10 }} />
        )}
        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  sortBox: { flexDirection: "row", gap: 6 },
  sortChip: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  sortChipActive: {
    backgroundColor: "#06b6d4",
    borderColor: "#06b6d4",
  },
  sortText: { fontSize: 12, color: "#374151" },
  sortTextActive: { color: "#fff" },
  chip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: "#06b6d4",
    borderColor: "#06b6d4",
  },
  chipText: { fontSize: 12, color: "#374151" },
  chipTextActive: { color: "#fff" },
  activeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#cffafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeChipText: { fontSize: 11, color: "#0e7490" },
  resetBtn: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 8,
    backgroundColor: "#f9fafb",
  },
  cardImg: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
  },
  cardTitle: { fontWeight: "600", fontSize: 13 },
  cardSub: { fontSize: 11, color: "#6b7280" },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: { fontSize: 10, color: "#065f46" },
  emptyText: { textAlign: "center", color: "#6b7280", marginTop: 20 },
  loadMore: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginTop: 10,
  },
  error: { color: "#dc2626", fontSize: 12, marginTop: 10 },
});
