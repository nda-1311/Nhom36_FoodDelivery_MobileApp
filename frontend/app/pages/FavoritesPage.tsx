import { COLORS } from "@/constants/design";
import { useFavorites } from "@/hooks/useFavorites";
import { getFoodImage } from "@/utils/foodImageMap";
import { ChevronLeft, Heart } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FavoritesPageProps {
  onNavigate: (page: string, data?: any) => void;
  favorites?: any[];
  onToggleFavorite?: (item: any) => void;
}

export default function FavoritesPage({
  onNavigate,
  favorites: externalFavorites,
  onToggleFavorite,
}: FavoritesPageProps) {
  // Sử dụng hook useFavorites để lấy dữ liệu từ database
  const { items: dbFavs, loading, toggle } = useFavorites();

  // Ưu tiên dùng favorites từ props, nếu không có thì dùng từ database
  const list = useMemo(() => {
    if (externalFavorites && externalFavorites.length > 0) {
      return externalFavorites;
    }
    return dbFavs.map((r) => ({
      id: r.food_item_id,
      name: r.food_name,
      image: r.food_image,
      price: r.price,
    }));
  }, [externalFavorites, dbFavs]);

  // Hàm xử lý toggle favorite
  const handleToggleFavorite = async (item: any) => {
    if (onToggleFavorite) {
      onToggleFavorite(item);
    } else {
      // Dùng hook để toggle
      await toggle(item.id, {
        name: item.name,
        image: item.image,
        price: item.price,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("home")}>
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu thích</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.textMuted}>
              Đang tải danh sách yêu thích...
            </Text>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.centered}>
            <Heart size={48} color={COLORS.textLight} />
            <Text style={styles.textMuted}>Chưa có món yêu thích</Text>
            <Text style={styles.textSmall}>
              Thêm món ăn vào yêu thích để xem ở đây
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => onNavigate("home")}
            >
              <Text style={styles.primaryButtonText}>Khám phá món ăn</Text>
            </TouchableOpacity>
          </View>
        ) : (
          list.map((item) => {
            // Use getFoodImage utility
            const imageSource = getFoodImage(item.name, item.image);

            return (
              <View key={item.id} style={styles.card}>
                <Image
                  source={imageSource}
                  style={styles.image}
                  onError={(e) => {
                    console.log(
                      `Failed to load image for favorite item: ${item.name}, path: ${item.image}`,
                      e.nativeEvent.error
                    );
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {typeof item.price === "number" && (
                    <Text style={styles.price}>{item.price}đ</Text>
                  )}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => onNavigate("food-details", item)}
                    >
                      <Text style={styles.viewButtonText}>Xem chi tiết</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleToggleFavorite(item)}
                      style={styles.heartButton}
                    >
                      <Heart size={18} color="#ef4444" fill="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  content: { padding: 16, paddingBottom: 100 },
  centered: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  textMuted: { color: COLORS.textSecondary, marginTop: 10 },
  textSmall: { color: COLORS.textLight, fontSize: 12, marginTop: 4 },

  card: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  itemName: { fontWeight: "700", color: COLORS.text, fontSize: 14 },
  price: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },

  actions: {
    flexDirection: "row",
    marginTop: 8,
    alignItems: "center",
    gap: 8,
  },
  viewButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  viewButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  heartButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#fee2e2",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
});
