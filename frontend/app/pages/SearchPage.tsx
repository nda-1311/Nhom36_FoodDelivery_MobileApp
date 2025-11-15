import { COLORS } from "@/constants/design";
import { getFoodImage } from "@/utils/foodImageMap";
import { LinearGradient } from "expo-linear-gradient";
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
  { id: "rating_desc", label: "Đánh giá ↓" },
  { id: "price_asc", label: "Giá ↑" },
  { id: "price_desc", label: "Giá ↓" },
  { id: "newest", label: "Mới nhất" },
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
      try {
        const response = await fetch("http://localhost:5000/api/v1/food");
        const result = await response.json();
        if (result.success && result.data) {
          const items = result.data;
          setCategories(
            Array.from(
              new Set(
                items.map((r: any) => r.categoryId).filter(Boolean) as string[]
              )
            ).sort()
          );
          // Note: Backend không có collection field, tạm thời để trống
          setCollections([]);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    })();
  }, []);

  const fetchPage = async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append("page", String(pageIndex + 1));
      params.append("limit", String(PAGE_SIZE));

      if (q.trim()) params.append("search", q.trim());
      if (category) params.append("category", category);

      // Sort mapping
      let sortBy = "name";
      let sortOrder = "asc";
      switch (sort) {
        case "price_asc":
          sortBy = "price";
          sortOrder = "asc";
          break;
        case "price_desc":
          sortBy = "price";
          sortOrder = "desc";
          break;
        case "rating_desc":
          // Backend không hỗ trợ sort by rating, dùng name thay thế
          sortBy = "name";
          sortOrder = "asc";
          break;
      }
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const response = await fetch(
        `http://localhost:5000/api/v1/food?${params}`
      );
      const result = await response.json();

      if (!result.success) throw new Error(result.message);

      const data = result.data || [];
      // Transform data
      const transformed = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        image_url: item.image,
        price: item.price,
        rating: 4.5,
        category: item.categoryId,
        collection: null,
      }));

      if (pageIndex === 0) setFoods(transformed);
      else setFoods((prev) => [...prev, ...transformed]);

      // Check if has more (simple: if we got less than PAGE_SIZE, no more)
      setHasMore(data.length >= PAGE_SIZE);
      setPage(pageIndex);
    } catch (e: any) {
      setError(e.message ?? "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <LinearGradient
        colors={COLORS.gradientPrimary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => onNavigate("home")}
          >
            <ArrowLeft size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title || "Tìm kiếm"}</Text>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Search size={18} color="#6b7280" />
          <TextInput
            placeholder="Tìm món ăn..."
            value={q}
            onChangeText={setQ}
            onSubmitEditing={() => fetchPage(0)}
            style={{ flex: 1, fontSize: 14, color: "#111" }}
          />
          {!!q && (
            <TouchableOpacity onPress={() => setQ("")}>
              <Text style={{ color: COLORS.primary, fontSize: 12 }}>Xóa</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Filters */}
        <View style={styles.filterRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <SlidersHorizontal size={16} color="#111" />
            <Text style={{ fontSize: 13, fontWeight: "600" }}>Bộ lọc</Text>
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
                  <X size={12} color={COLORS.primaryDark} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.resetBtn}>Đặt lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results */}
        {loading && page === 0 ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
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
                  source={getFoodImage(item.name)}
                  style={styles.cardImg}
                />
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>
                  ⭐ {item.rating ?? "—"} •{" "}
                  {item.price ? `${item.price}đ` : "—"}
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
            <Text style={{ color: "#111" }}>Tải thêm</Text>
          </TouchableOpacity>
        )}
        {loading && page > 0 && (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 10 }} />
        )}
        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
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
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeChipText: { fontSize: 11, color: COLORS.primaryDark },
  resetBtn: { color: COLORS.error, fontSize: 12, fontWeight: "600" },
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
  error: { color: COLORS.error, fontSize: 12, marginTop: 10 },
});
