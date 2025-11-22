/**
 * SearchPage - Optimized với Debounce và React Query
 *
 * Features:
 * - Debounced search (500ms)
 * - Real-time results
 * - Recent searches
 * - Search suggestions
 * - Cached results
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, Clock, Search, TrendingUp, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Hooks
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchFood } from "@/hooks/useFoodItems";
import { useSearchRestaurants } from "@/hooks/useRestaurants";

// Components
import { CachedImage } from "@/components/CachedImage";
import {
  FoodGridSkeleton,
  RestaurantListSkeleton,
} from "@/components/SkeletonPresets";

// Constants
import { COLORS, SPACING } from "@/constants/design";

// Utils
import { getFoodImage } from "@/utils/foodImageMap";

const RECENT_SEARCHES_KEY = "@recent_searches";
const MAX_RECENT_SEARCHES = 10;

interface SearchPageProps {
  onNavigate?: (page: string, data?: any) => void;
  onBack?: () => void;
}

export default function SearchPageOptimized({
  onNavigate = () => {},
  onBack = () => {},
}: SearchPageProps) {
  const [searchText, setSearchText] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"food" | "restaurant">("food");

  // Debounce search input - chỉ search sau 500ms ngừng gõ
  const debouncedSearch = useDebounce(searchText, 500);

  // React Query hooks - auto cached!
  const {
    data: foodResults,
    isLoading: foodLoading,
    isFetching: foodFetching,
  } = useSearchFood(debouncedSearch);

  // Debug logging
  console.log("🔎 SearchPage state:", {
    searchText,
    debouncedSearch,
    activeTab,
    foodResultsLength: foodResults?.length || 0,
    foodResultsFirstItem: foodResults?.[0]?.name,
  });

  const {
    data: restaurantResults,
    isLoading: restaurantLoading,
    isFetching: restaurantFetching,
  } = useSearchRestaurants(debouncedSearch);

  const isLoading = activeTab === "food" ? foodLoading : restaurantLoading;
  const isFetching = activeTab === "food" ? foodFetching : restaurantFetching;

  // Load recent searches
  const loadRecentSearches = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    }
  }, []);

  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  const saveRecentSearch = useCallback(
    async (query: string) => {
      try {
        // Remove duplicates and add to front
        const updated = [
          query,
          ...recentSearches.filter((s) => s !== query),
        ].slice(0, MAX_RECENT_SEARCHES);

        setRecentSearches(updated);
        await AsyncStorage.setItem(
          RECENT_SEARCHES_KEY,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error("Failed to save recent search:", error);
      }
    },
    [recentSearches]
  );

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error("Failed to clear recent searches:", error);
    }
  };

  const handleSearch = useCallback(
    (text: string) => {
      setSearchText(text);

      // Save to recent searches khi search
      if (text.trim().length >= 2) {
        saveRecentSearch(text.trim());
      }
    },
    [saveRecentSearch]
  );

  const handleRecentSearchPress = (query: string) => {
    setSearchText(query);
  };

  const clearSearch = () => {
    setSearchText("");
  };

  // Trending searches (mock data - có thể fetch từ API)
  const trendingSearches = [
    "Pizza",
    "Phở",
    "Bún bò Huế",
    "Cơm tấm",
    "Trà sữa",
    "Gà rán",
  ];

  const renderFoodItem = useCallback(
    ({ item }: any) => (
      <View style={styles.resultItem}>
        <TouchableOpacity
          style={styles.foodResultCard}
          onPress={() => {
            console.log("🍕 Navigating to food details:", {
              id: item.id,
              name: item.name,
              fullItem: item,
            });
            onNavigate("food-details", {
              id: item.id, // ✅ QUAN TRỌNG: phải có id
              foodId: item.id,
              name: item.name,
              price: item.price,
              discountPrice: item.discountPrice,
              image: item.image,
              description: item.description,
              rating: item.rating,
              restaurant: item.restaurant,
              category: item.category,
            });
          }}
        >
          <CachedImage
            source={getFoodImage(item.name, item.image)}
            style={styles.foodImage}
          />
          <View style={styles.foodInfo}>
            <Text style={styles.foodName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.restaurant && (
              <Text style={styles.restaurantName} numberOfLines={1}>
                📍 {item.restaurant.name}
              </Text>
            )}
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
        </TouchableOpacity>
      </View>
    ),
    [onNavigate]
  );

  const renderRestaurantItem = useCallback(
    ({ item }: any) => (
      <TouchableOpacity
        style={styles.restaurantResultCard}
        onPress={() => onNavigate("restaurant", { restaurantId: item.id })}
      >
        <CachedImage
          source={{
            uri:
              item.logo || item.coverImage || "https://via.placeholder.com/80",
          }}
          style={styles.restaurantLogo}
        />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.restaurantAddress} numberOfLines={1}>
            📍 {item.address}
          </Text>
          <View style={styles.restaurantMeta}>
            <Text style={styles.metaText}>⭐ {item.rating.toFixed(1)}</Text>
            <Text style={styles.metaText}> • </Text>
            <Text style={styles.metaText}>
              🚚 {formatPrice(item.deliveryFee)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [onNavigate]
  );

  return (
    <View style={styles.container}>
      {/* Header với Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm món ăn, nhà hàng..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color="#999" />
            </TouchableOpacity>
          )}

          {/* Loading indicator */}
          {isFetching && (
            <ActivityIndicator size="small" color={COLORS.primary} />
          )}
        </View>
      </View>

      {/* Tabs */}
      {searchText.length >= 2 && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "food" && styles.activeTab]}
            onPress={() => setActiveTab("food")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "food" && styles.activeTabText,
              ]}
            >
              Món ăn {foodResults ? `(${foodResults.length})` : ""}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "restaurant" && styles.activeTab]}
            onPress={() => setActiveTab("restaurant")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "restaurant" && styles.activeTabText,
              ]}
            >
              Nhà hàng{" "}
              {restaurantResults ? `(${restaurantResults.length})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Empty state - Show suggestions */}
        {searchText.length < 2 && (
          <View style={styles.suggestions}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitle}>
                    <Clock size={20} color="#666" />
                    <Text style={styles.sectionText}>Tìm kiếm gần đây</Text>
                  </View>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={styles.clearText}>Xóa</Text>
                  </TouchableOpacity>
                </View>

                {recentSearches.map((query, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleRecentSearchPress(query)}
                  >
                    <Clock size={18} color="#999" />
                    <Text style={styles.suggestionText}>{query}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const updated = recentSearches.filter(
                          (_, i) => i !== index
                        );
                        setRecentSearches(updated);
                        AsyncStorage.setItem(
                          RECENT_SEARCHES_KEY,
                          JSON.stringify(updated)
                        );
                      }}
                    >
                      <X size={18} color="#999" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Trending Searches */}
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <TrendingUp size={20} color="#666" />
                <Text style={styles.sectionText}>Tìm kiếm phổ biến</Text>
              </View>

              <View style={styles.trendingContainer}>
                {trendingSearches.map((query, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.trendingPill}
                    onPress={() => handleSearch(query)}
                  >
                    <Text style={styles.trendingText}>{query}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Search Results */}
        {searchText.length >= 2 && (
          <View style={styles.results}>
            {isLoading ? (
              activeTab === "food" ? (
                <FoodGridSkeleton count={6} />
              ) : (
                <RestaurantListSkeleton count={3} />
              )
            ) : (
              <>
                {activeTab === "food" &&
                  foodResults &&
                  (foodResults.length > 0 ? (
                    <>
                      {console.log(
                        "🎨 Rendering food results:",
                        foodResults.length,
                        "items"
                      )}
                      {console.log(
                        "🎨 First 3 items:",
                        foodResults.slice(0, 3).map((f) => f.name)
                      )}
                      <FlatList
                        data={foodResults}
                        renderItem={renderFoodItem}
                        keyExtractor={(item, index) =>
                          `${item.id}-${searchText}-${index}`
                        }
                        scrollEnabled={false}
                        extraData={searchText}
                        removeClippedSubviews={false}
                      />
                    </>
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>
                        Không tìm thấy món ăn nào
                      </Text>
                      <Text style={styles.emptySubtext}>
                        Thử tìm kiếm với từ khóa khác
                      </Text>
                    </View>
                  ))}

                {activeTab === "restaurant" &&
                  restaurantResults &&
                  (restaurantResults.length > 0 ? (
                    <FlatList
                      data={restaurantResults}
                      renderItem={renderRestaurantItem}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                    />
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>
                        Không tìm thấy nhà hàng nào
                      </Text>
                      <Text style={styles.emptySubtext}>
                        Thử tìm kiếm với từ khóa khác
                      </Text>
                    </View>
                  ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Helper
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: "#FFF",
  },
  backBtn: {
    marginRight: SPACING.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: "#333",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#999",
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  suggestions: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    marginLeft: 12,
  },
  trendingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.sm,
  },
  trendingPill: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  trendingText: {
    fontSize: 14,
    color: "#666",
  },
  results: {
    padding: SPACING.lg,
  },
  resultItem: {
    marginBottom: SPACING.md,
  },
  foodResultCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  foodInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  foodName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  restaurantResultCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: SPACING.md,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  restaurantLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  restaurantAddress: {
    fontSize: 13,
    color: "#666",
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 13,
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
});
