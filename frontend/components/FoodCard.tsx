import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/design";
import { Heart, Star } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FoodCardProps {
  id: string | number;
  name: string;
  image: any;
  price: number;
  rating?: number;
  isFavorite?: boolean;
  onPress: () => void;
  onFavoritePress?: () => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  name,
  image,
  price,
  rating = 0,
  isFavorite = false,
  onPress,
  onFavoritePress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} resizeMode="cover" />
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
            activeOpacity={0.7}
          >
            <Heart
              size={20}
              color={isFavorite ? COLORS.error : COLORS.white}
              fill={isFavorite ? COLORS.error : "transparent"}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{price.toLocaleString("vi-VN")}đ</Text>
          </View>

          {rating > 0 && (
            <View style={styles.ratingContainer}>
              <Star size={14} color={COLORS.accent} fill={COLORS.accent} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.l,
    overflow: "hidden",
    ...SHADOWS.card,
    marginBottom: SPACING.l,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 140,
    backgroundColor: COLORS.extraLightGray,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: SPACING.s,
    right: SPACING.s,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: SPACING.m,
  },
  name: {
    ...TYPOGRAPHY.h4,
    color: COLORS.dark,
    marginBottom: SPACING.s,
    minHeight: 52,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 17,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: RADIUS.s,
  },
  ratingText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.dark,
  },
});
