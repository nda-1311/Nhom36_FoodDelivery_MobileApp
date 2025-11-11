import { COLORS } from "@/constants/design";
import { supabase } from "@/lib/supabase/client";
import { ChevronLeft, Heart } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
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

interface FavoritesPageProps {
  onNavigate: (page: string, data?: any) => void;
  favorites: any[];
  onToggleFavorite: (item: any) => void;
}

type FavRow = {
  food_item_id: string;
  food_name?: string;
  food_image?: string;
  price?: number;
  created_at?: string;
};

export default function FavoritesPage({
  onNavigate,
  favorites,
  onToggleFavorite,
}: FavoritesPageProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [dbFavs, setDbFavs] = useState<FavRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!unmounted) setUserId(data.user?.id ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!unmounted) setUserId(session?.user?.id ?? null);
    });

    return () => {
      unmounted = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchFavs = async () => {
      if (!userId) {
        setDbFavs([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("favorites")
        .select("food_item_id, food_name, food_image, price, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[favorites select]", error);
        setDbFavs([]);
      } else {
        setDbFavs(data || []);
      }
      setLoading(false);
    };

    fetchFavs();
  }, [userId]);

  const list = useMemo(() => {
    if (favorites && favorites.length > 0) return favorites;
    return dbFavs.map((r) => ({
      id: r.food_item_id,
      name: r.food_name,
      image: r.food_image,
      price: r.price,
    }));
  }, [favorites, dbFavs]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("home")}>
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.textMuted}>Loading favorites...</Text>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.centered}>
            <Heart size={48} color={COLORS.textLight} />
            <Text style={styles.textMuted}>No favorites yet</Text>
            <Text style={styles.textSmall}>
              Add items to your favorites to see them here
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => onNavigate("home")}
            >
              <Text style={styles.primaryButtonText}>Browse Food</Text>
            </TouchableOpacity>
          </View>
        ) : (
          list.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image
                source={
                  item.image && IMAGE_MAP[item.image]
                    ? IMAGE_MAP[item.image]
                    : require("@/assets/public/placeholder.jpg")
                }
                style={styles.image}
                onError={(e) => {
                  console.log(
                    `Failed to load image for favorite item: ${item.name}`,
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
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onToggleFavorite(item)}
                    style={styles.heartButton}
                  >
                    <Heart size={18} color="#ef4444" fill="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
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
