import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
} from "react-native";
import {
  ChevronLeft,
  Star,
  Clock,
  MapPin,
  Heart,
  Share2,
} from "lucide-react-native";

interface RestaurantPageProps {
  data: any;
  onNavigate: (page: string, data?: any) => void;
}

export default function RestaurantPage({
  data,
  onNavigate,
}: RestaurantPageProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");

  const placeholder = "https://placehold.co/400x200?text=Restaurant";
  const imageSrc =
    data?.__resolvedImage || data?.image_url || data?.image || placeholder;

  const handleBack = () => onNavigate("home");

  const menuItems = [
    {
      id: 1,
      name: "Fried Chicken",
      description: "Crispy fried wings, thigh",
      price: 15,
      rating: 4.5,
      reviews: 99,
      image: "https://i.ibb.co/3sLJqWv/fried-chicken.jpg",
      category: "Main",
    },
    {
      id: 2,
      name: "Chicken Salad",
      description: "Fresh greens with chicken",
      price: 15,
      rating: 4.5,
      reviews: 99,
      image: "https://i.ibb.co/k15MX4b/chicken-salad.jpg",
      category: "Main",
    },
    {
      id: 3,
      name: "Spicy Chicken",
      description: "Hot and spicy chicken",
      price: 15,
      rating: 4.5,
      reviews: 99,
      image: "https://i.ibb.co/jwrHSFL/spicy-chicken.jpg",
      category: "Main",
    },
    {
      id: 4,
      name: "Fried Potatoes",
      description: "Golden crispy potatoes",
      price: 8,
      rating: 4.2,
      reviews: 45,
      image: "https://i.ibb.co/6vxJ5rL/fried-potatoes.jpg",
      category: "Sides",
    },
    {
      id: 5,
      name: "Coleslaw",
      description: "Fresh cabbage salad",
      price: 6,
      rating: 4.0,
      reviews: 32,
      image: "https://i.ibb.co/B3CN1yH/coleslaw.jpg",
      category: "Sides",
    },
  ];

  const combos = [
    {
      name: "Combo B",
      description: "Fried Chicken, Chicken Rice & Salad",
      price: 25,
      rating: 4.5,
      reviews: 90,
      image: "https://i.ibb.co/Fxsw1HT/combo-meal.jpg",
    },
    {
      name: "Combo C",
      description: "Fried Chicken (Small) & Potatoes",
      price: 19,
      rating: 4.6,
      reviews: 75,
      image: "https://i.ibb.co/QnPKBrV/combo-small.jpg",
    },
  ];

  const reviews = [
    {
      name: "Jinny Oslin",
      rating: 4.5,
      text: "Quick delivery, good dishes. I love the chicken burger.",
      avatar: "👩",
      date: "2 days ago",
    },
    {
      name: "Jill",
      rating: 5,
      text: "Fresh ingredients and great taste!",
      avatar: "👱‍♀️",
      date: "1 week ago",
    },
    {
      name: "Mike",
      rating: 4,
      text: "Good food, but delivery took longer than expected.",
      avatar: "👨",
      date: "2 weeks ago",
    },
  ];

  const categories = ["menu", "Main", "Sides", "Drinks", "Desserts"];
  const filteredItems =
    activeTab === "menu"
      ? menuItems
      : menuItems.filter((item) => item.category === activeTab);

  return (
    <ScrollView style={styles.container}>
      {/* Header image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageSrc }} style={styles.image} />
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Heart
            color={isFavorite ? "red" : "black"}
            fill={isFavorite ? "red" : "none"}
            size={24}
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View>
            <Text style={styles.restaurantName}>
              {data?.name || "Restaurant"}
            </Text>
            <Text style={styles.cuisine}>{data?.cuisine || "Cuisine"}</Text>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Share2 size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.iconRow}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.textSm}>6am - 9pm</Text>
          </View>
          <View style={styles.iconRow}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.textSm}>2 km away</Text>
          </View>
          <Text style={styles.textSm}>$5 - $50</Text>
        </View>

        <View style={styles.ratingRow}>
          <Star size={18} color="#facc15" fill="#facc15" />
          <Text style={styles.rating}>{data?.rating ?? 4.5}</Text>
          <Text style={styles.reviewCount}>(289 reviews)</Text>
        </View>

        {/* Offers */}
        <View style={{ gap: 8 }}>
          <View style={[styles.offerBox, { backgroundColor: "#ffedd5" }]}>
            <Text>🎟️ 2 discount vouchers available</Text>
          </View>
          <View style={[styles.offerBox, { backgroundColor: "#e0f2fe" }]}>
            <Text>🚚 Delivery in 20 mins</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabRow}
      >
        {categories.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Combo deals */}
      {activeTab === "menu" && (
        <>
          <Text style={styles.sectionTitle}>Combo Deals</Text>
          {combos.map((combo, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.comboCard}
              onPress={() =>
                onNavigate("food-details", {
                  ...combo,
                  __resolvedImage: combo.image,
                  restaurant: data,
                })
              }
            >
              <Image source={{ uri: combo.image }} style={styles.comboImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.comboName}>{combo.name}</Text>
                <Text style={styles.comboDesc}>{combo.description}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>${combo.price}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Star size={12} color="#facc15" fill="#facc15" />
                    <Text style={styles.ratingText}>{combo.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Menu items */}
      <Text style={styles.sectionTitle}>
        {activeTab === "menu" ? "Popular Items" : `${activeTab} Menu`}
      </Text>
      <View style={styles.grid}>
        {filteredItems.slice(0, 4).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuCard}
            onPress={() =>
              onNavigate("food-details", {
                ...item,
                __resolvedImage: item.image,
                restaurant: data,
              })
            }
          >
            <Image source={{ uri: item.image }} style={styles.menuImg} />
            <View style={styles.menuInfo}>
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuDesc}>{item.description}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.menuPrice}>${item.price}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Star size={12} color="#facc15" fill="#facc15" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reviews */}
      {activeTab === "menu" && (
        <>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          {reviews.map((review, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <Text style={styles.avatar}>{review.avatar}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewer}>{review.name}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <View style={{ flexDirection: "row", marginVertical: 4 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      color={i < review.rating ? "#facc15" : "#d1d5db"}
                      fill="#facc15"
                    />
                  ))}
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flex: 1 },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: 180 },
  backButton: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 6,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 6,
  },
  infoCard: { padding: 16, borderBottomWidth: 1, borderColor: "#e5e7eb" },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  restaurantName: { fontSize: 22, fontWeight: "700" },
  cuisine: { fontSize: 13, color: "#6b7280" },
  shareButton: {
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderRadius: 20,
  },
  row: { flexDirection: "row", gap: 12, flexWrap: "wrap", marginBottom: 6 },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  textSm: { fontSize: 12, color: "#374151" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  rating: { fontWeight: "700" },
  reviewCount: { fontSize: 12, color: "#6b7280" },
  offerBox: {
    borderRadius: 8,
    padding: 10,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabButtonActive: { borderColor: "#06b6d4" },
  tabText: { color: "#6b7280", fontSize: 14 },
  tabTextActive: { color: "#06b6d4", fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", margin: 16 },
  comboCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  comboImg: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  comboName: { fontWeight: "700", fontSize: 14 },
  comboDesc: { fontSize: 12, color: "#6b7280" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  price: { color: "#06b6d4", fontWeight: "700" },
  ratingText: { fontSize: 11, color: "#6b7280" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
  },
  menuCard: {
    width: "47%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  menuImg: { width: "100%", height: 90 },
  menuInfo: { padding: 8 },
  menuName: { fontWeight: "700", fontSize: 13 },
  menuDesc: { fontSize: 11, color: "#6b7280" },
  menuPrice: { color: "#06b6d4", fontWeight: "700" },
  reviewCard: {
    flexDirection: "row",
    gap: 8,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
    marginHorizontal: 16,
  },
  avatar: { fontSize: 20 },
  reviewer: { fontWeight: "700", fontSize: 13 },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reviewDate: { color: "#9ca3af", fontSize: 11 },
  reviewText: { color: "#6b7280", fontSize: 12 },
});
