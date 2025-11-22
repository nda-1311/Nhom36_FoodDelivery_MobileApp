/**
 * Pre-built Skeleton Components
 * Sẵn sàng sử dụng cho các UI patterns phổ biến
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "./Skeleton";

/**
 * Restaurant Card Skeleton
 * Dùng cho danh sách nhà hàng
 */
export const RestaurantCardSkeleton = () => {
  return (
    <View style={styles.restaurantCard}>
      {/* Image */}
      <Skeleton width="100%" height={180} borderRadius={12} />

      {/* Content */}
      <View style={styles.cardContent}>
        {/* Title */}
        <Skeleton width="70%" height={20} style={{ marginBottom: 8 }} />

        {/* Rating & Info */}
        <View style={styles.row}>
          <Skeleton width={60} height={16} style={{ marginRight: 12 }} />
          <Skeleton width={80} height={16} />
        </View>

        {/* Tags */}
        <View style={[styles.row, { marginTop: 8 }]}>
          <Skeleton
            width={50}
            height={24}
            borderRadius={12}
            style={{ marginRight: 8 }}
          />
          <Skeleton
            width={60}
            height={24}
            borderRadius={12}
            style={{ marginRight: 8 }}
          />
          <Skeleton width={70} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

/**
 * Food Item Card Skeleton
 * Dùng cho menu items
 */
export const FoodItemSkeleton = () => {
  return (
    <View style={styles.foodCard}>
      {/* Image */}
      <Skeleton width={100} height={100} borderRadius={12} />

      {/* Info */}
      <View style={styles.foodInfo}>
        <Skeleton width="80%" height={18} style={{ marginBottom: 6 }} />
        <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width={80} height={20} />
      </View>
    </View>
  );
};

/**
 * Order Card Skeleton
 */
export const OrderCardSkeleton = () => {
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Skeleton width={120} height={18} />
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Skeleton width={60} height={60} borderRadius={8} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="70%" height={16} style={{ marginBottom: 6 }} />
          <Skeleton width="50%" height={14} style={{ marginBottom: 6 }} />
          <Skeleton width={100} height={20} />
        </View>
      </View>
    </View>
  );
};

/**
 * List of Restaurant Cards Skeleton
 */
export const RestaurantListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <RestaurantCardSkeleton key={index} />
      ))}
    </>
  );
};

/**
 * Grid of Food Items Skeleton
 */
export const FoodGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.gridItem}>
          <Skeleton width="100%" height={120} borderRadius={12} />
          <Skeleton width="80%" height={16} style={{ marginTop: 8 }} />
          <Skeleton width="60%" height={14} style={{ marginTop: 4 }} />
          <Skeleton width={70} height={18} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
};

/**
 * Banner Skeleton
 */
export const BannerSkeleton = () => {
  return <Skeleton width="100%" height={180} borderRadius={0} />;
};

/**
 * Category Pills Skeleton
 */
export const CategoryPillsSkeleton = () => {
  return (
    <View style={styles.categoryRow}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton
          key={index}
          width={80}
          height={36}
          borderRadius={18}
          style={{ marginRight: 12 }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  restaurantCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  foodCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  orderCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
