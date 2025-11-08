import { useCart } from "@/store/cart-context"; // ✅ import realtime cart context
import {
  Heart,
  Home,
  MessageSquare,
  ShoppingBag,
  User,
} from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ICON_SIZE = SCREEN_WIDTH < 375 ? 20 : 24;
const TAB_HEIGHT = Platform.select({ ios: 80, android: 60 });
const BOTTOM_INSET = Platform.select({ ios: 34, android: 0 });

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const isActive = (page: string) => currentPage === page;

  // ✅ Lấy số lượng giỏ hàng realtime từ context
  const { cartCount } = useCart();

  // ✅ Giới hạn hiển thị 99+
  const display = cartCount > 99 ? "99+" : String(cartCount);

  // ✅ Hiệu ứng nảy khi giỏ hàng thay đổi
  const bounceAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (cartCount > 0) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cartCount, bounceAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HOME */}
        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={styles.tabButton}
        >
          <Home
            size={ICON_SIZE}
            color={isActive("home") ? "#06b6d4" : "#64748b"}
          />
          <Text style={[styles.tabText, isActive("home") && styles.activeText]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* CART */}
        <TouchableOpacity
          onPress={() => onNavigate("cart")}
          style={styles.tabButton}
        >
          <View>
            <ShoppingBag
              size={ICON_SIZE}
              color={isActive("cart") ? "#06b6d4" : "#64748b"}
            />
            {cartCount > 0 && (
              <Animated.View
                style={[
                  styles.badge,
                  {
                    transform: [{ scale: bounceAnim }],
                  },
                ]}
              >
                <Text style={styles.badgeText}>{display}</Text>
              </Animated.View>
            )}
          </View>
          <Text style={[styles.tabText, isActive("cart") && styles.activeText]}>
            Cart
          </Text>
        </TouchableOpacity>

        {/* FAVORITES */}
        <TouchableOpacity
          onPress={() => onNavigate("favorites")}
          style={styles.tabButton}
        >
          <Heart
            size={ICON_SIZE}
            color={isActive("favorites") ? "#06b6d4" : "#64748b"}
          />
          <Text
            style={[styles.tabText, isActive("favorites") && styles.activeText]}
          >
            Favorites
          </Text>
        </TouchableOpacity>

        {/* INBOX */}
        <TouchableOpacity
          onPress={() => onNavigate("inbox")}
          style={styles.tabButton}
        >
          <MessageSquare
            size={ICON_SIZE}
            color={isActive("inbox") ? "#06b6d4" : "#64748b"}
          />
          <Text
            style={[styles.tabText, isActive("inbox") && styles.activeText]}
          >
            Inbox
          </Text>
        </TouchableOpacity>

        {/* ACCOUNT */}
        <TouchableOpacity
          onPress={() => onNavigate("account")}
          style={styles.tabButton}
        >
          <User
            size={ICON_SIZE}
            color={isActive("account") ? "#06b6d4" : "#64748b"}
          />
          <Text
            style={[styles.tabText, isActive("account") && styles.activeText]}
          >
            Account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
  },
  container: {
    width: "100%",
    maxWidth: SCREEN_WIDTH > 768 ? 768 : SCREEN_WIDTH,
    marginHorizontal: "auto",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: TAB_HEIGHT,
    paddingBottom: BOTTOM_INSET,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 4,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: SCREEN_WIDTH < 375 ? 10 : 12,
    color: "#64748b",
    marginTop: 2,
  },
  activeText: {
    color: "#06b6d4",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#ef4444",
    borderRadius: SCREEN_WIDTH < 375 ? 10 : 12,
    minWidth: SCREEN_WIDTH < 375 ? 16 : 20,
    height: SCREEN_WIDTH < 375 ? 16 : 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: SCREEN_WIDTH < 375 ? 8 : 10,
    fontWeight: "600",
  },
});
