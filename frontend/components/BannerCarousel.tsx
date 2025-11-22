/**
 * Banner Carousel Component
 * Auto-sliding banner với dots indicator
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { CachedImage } from "./CachedImage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 180;
const AUTO_SLIDE_INTERVAL = 4000; // 4 seconds

interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  link?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  onBannerPress?: (banner: Banner) => void;
  autoPlay?: boolean;
}

export function BannerCarousel({
  banners,
  onBannerPress,
  autoPlay = true,
}: BannerCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [currentIndex, banners.length, autoPlay]);

  // Handle scroll end
  const handleScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            onPress={() => onBannerPress?.(banner)}
            activeOpacity={0.9}
          >
            <CachedImage
              source={{ uri: banner.imageUrl }}
              style={styles.banner}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <View style={styles.dotsContainer}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    marginBottom: 16,
  },
  banner: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FFF",
    width: 24,
  },
});

// Mock banners for development
export const MOCK_BANNERS: Banner[] = [
  {
    id: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    title: "Giảm 50% đơn đầu tiên",
  },
  {
    id: "2",
    imageUrl:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    title: "Free ship cho đơn từ 99k",
  },
  {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    title: "Ưu đãi cuối tuần",
  },
];
