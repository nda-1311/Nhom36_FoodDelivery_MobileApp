import { Image, ImageProps } from "expo-image";
import { memo } from "react";
import { StyleSheet } from "react-native";

/**
 * CachedImage Component
 *
 * Wrapper cho expo-image với caching tự động
 * - Cache policy: memory-disk (lưu RAM + disk)
 * - Blurhash placeholder khi loading
 * - Fade transition khi load xong
 * - Error fallback
 *
 * @example
 * <CachedImage
 *   source={{ uri: imageUrl }}
 *   style={{ width: 100, height: 100 }}
 * />
 */

interface CachedImageProps extends ImageProps {
  fallbackColor?: string;
  showLoadingIndicator?: boolean;
}

export const CachedImage = memo(
  ({
    source,
    style,
    fallbackColor = "#E0E0E0",
    showLoadingIndicator = false,
    ...props
  }: CachedImageProps) => {
    return (
      <Image
        source={source}
        style={[styles.image, style]}
        // Cache configuration
        cachePolicy="memory-disk" // Cache cả RAM và disk
        // Placeholder với blurhash (generic blur)
        placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
        // Transition effect khi load xong
        transition={200}
        // Content fit
        contentFit="cover"
        // Priority cao cho ảnh quan trọng
        priority="normal"
        {...props}
      />
    );
  }
);

CachedImage.displayName = "CachedImage";

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#E0E0E0",
  },
});

/**
 * FastImage Component (Alternative)
 * Cho các ảnh cần load cực nhanh (thumbnail, avatar)
 */
export const FastImage = memo(({ source, style, ...props }: ImageProps) => {
  return (
    <Image
      source={source}
      style={style}
      cachePolicy="memory" // Chỉ cache RAM, nhanh hơn
      transition={100}
      contentFit="cover"
      {...props}
    />
  );
});

FastImage.displayName = "FastImage";
