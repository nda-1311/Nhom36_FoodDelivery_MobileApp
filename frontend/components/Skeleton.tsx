import { COLORS, RADIUS, SPACING } from "@/constants/design";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton Loading Component
 * Hiển thị placeholder với animation shimmer khi loading data
 *
 * @example
 * <Skeleton width={100} height={100} borderRadius={50} />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = RADIUS.s,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const FoodCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <Skeleton width="100%" height={140} borderRadius={RADIUS.l} />
      <View style={styles.cardContent}>
        <Skeleton width="80%" height={20} style={{ marginBottom: SPACING.s }} />
        <Skeleton width="60%" height={16} style={{ marginBottom: SPACING.m }} />
        <View style={styles.cardFooter}>
          <Skeleton width={60} height={24} />
          <Skeleton width={50} height={20} borderRadius={RADIUS.s} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.extraLightGray,
  },
  cardSkeleton: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.l,
    overflow: "hidden",
    marginBottom: SPACING.l,
  },
  cardContent: {
    padding: SPACING.m,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
