import { FoodCard } from "@/components/FoodCard";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/design";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Clock,
  Heart,
  MapPin,
  Share2,
  Star,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Hero Image with Gradient Overlay */}
      <View style={styles.heroContainer}>
        <Image source={{ uri: imageSrc }} style={styles.heroImage} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.heroGradient}
        />

        {/* Header Buttons */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color={COLORS.dark} size={24} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              color={isFavorite ? COLORS.error : COLORS.dark}
              fill={isFavorite ? COLORS.error : "none"}
              size={22}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={22} color={COLORS.dark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Restaurant Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.restaurantName}>{data?.name || "Restaurant"}</Text>
        <Text style={styles.cuisine}>{data?.cuisine || "Cuisine"}</Text>

        {/* Meta Info Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Star size={16} color={COLORS.accent} fill={COLORS.accent} />
            <Text style={styles.metaText}>{data?.rating ?? 4.5}</Text>
            <Text style={styles.metaTextLight}>(289)</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Clock size={16} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>20-30 min</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <MapPin size={16} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>2 km</Text>
          </View>
        </View>

        {/* Offer Badges */}
        <View style={styles.offersContainer}>
          <View
            style={[
              styles.offerBadge,
              { backgroundColor: COLORS.successLight },
            ]}
          >
            <Text style={styles.offerText}>🎟️ 2 vouchers</Text>
          </View>
          <View
            style={[
              styles.offerBadge,
              { backgroundColor: COLORS.primaryLight },
            ]}
          >
            <Text style={styles.offerText}>🚚 Free delivery</Text>
          </View>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={{ paddingHorizontal: SPACING.m }}
      >
        {categories.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.categoryTab,
              activeTab === tab && styles.categoryTabActive,
            ]}
          >
            <Text
              style={[
                styles.categoryTabText,
                activeTab === tab && styles.categoryTabTextActive,
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Combo Deals */}
      {activeTab === "menu" && combos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Combo Deals</Text>
          {combos.map((combo, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.comboCard}
              activeOpacity={0.8}
              onPress={() =>
                onNavigate("food-details", {
                  ...combo,
                  __resolvedImage: combo.image,
                  restaurant: data,
                })
              }
            >
              <Image source={{ uri: combo.image }} style={styles.comboImage} />
              <View style={styles.comboInfo}>
                <Text style={styles.comboName}>{combo.name}</Text>
                <Text style={styles.comboDesc} numberOfLines={2}>
                  {combo.description}
                </Text>
                <View style={styles.comboFooter}>
                  <Text style={styles.comboPrice}>{combo.price}đ</Text>
                  <View style={styles.comboRating}>
                    <Star
                      size={14}
                      color={COLORS.accent}
                      fill={COLORS.accent}
                    />
                    <Text style={styles.ratingValue}>{combo.rating}</Text>
                    <Text style={styles.reviewsCount}>({combo.reviews})</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Menu Items Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {activeTab === "menu" ? "🍽️ Popular Items" : `${activeTab} Menu`}
        </Text>
        <View style={styles.menuGrid}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.menuCardWrapper}>
              <FoodCard
                id={item.id}
                name={item.name}
                image={{ uri: item.image }}
                price={item.price}
                rating={item.rating}
                onPress={() =>
                  onNavigate("food-details", {
                    ...item,
                    __resolvedImage: item.image,
                    restaurant: data,
                  })
                }
              />
            </View>
          ))}
        </View>
      </View>

      {/* Reviews Section */}
      {activeTab === "menu" && reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Customer Reviews</Text>
          {reviews.map((review, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.avatarEmoji}>{review.avatar}</Text>
              </View>
              <View style={styles.reviewContent}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <View style={styles.reviewStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      color={
                        i < review.rating
                          ? COLORS.accent
                          : COLORS.extraLightGray
                      }
                      fill={
                        i < review.rating
                          ? COLORS.accent
                          : COLORS.extraLightGray
                      }
                    />
                  ))}
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroContainer: {
    position: "relative",
    height: 260,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  backButton: {
    position: "absolute",
    top: SPACING.l,
    left: SPACING.m,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    padding: SPACING.s,
    ...SHADOWS.medium,
  },
  headerActions: {
    position: "absolute",
    top: SPACING.l,
    right: SPACING.m,
    flexDirection: "row",
    gap: SPACING.s,
  },
  actionButton: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    padding: SPACING.s,
    ...SHADOWS.medium,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  restaurantName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cuisine: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.m,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.m,
  },
  metaText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  metaTextLight: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  offersContainer: {
    flexDirection: "row",
    gap: SPACING.s,
  },
  offerBadge: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.m,
  },
  offerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: "600",
  },
  categoryTabs: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryTab: {
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  categoryTabActive: {
    borderBottomColor: COLORS.primary,
  },
  categoryTabText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  categoryTabTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  section: {
    paddingVertical: SPACING.l,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.m,
  },
  comboCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.m,
    borderRadius: RADIUS.l,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  comboImage: {
    width: 120,
    height: 120,
  },
  comboInfo: {
    flex: 1,
    padding: SPACING.m,
    justifyContent: "space-between",
  },
  comboName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  comboDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.s,
  },
  comboFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  comboPrice: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: "800",
  },
  comboRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "700",
  },
  reviewsCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.m,
    gap: SPACING.m,
  },
  menuCardWrapper: {
    width: "47%",
  },
  reviewCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.m,
    padding: SPACING.m,
    borderRadius: RADIUS.m,
    ...SHADOWS.small,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.m,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  reviewerName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "700",
  },
  reviewDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
    marginBottom: SPACING.xs,
  },
  reviewText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
