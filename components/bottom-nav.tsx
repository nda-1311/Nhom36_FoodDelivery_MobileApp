import { useCart } from "@/store/cart-context";
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ICON_SIZE = SCREEN_WIDTH < 375 ? 22 : 24;
const TAB_HEIGHT = Platform.select({ ios: 70, android: 60 });

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const isActive = (page: string) => currentPage === page;

  const { cartCount } = useCart();
  const display = cartCount > 99 ? "99+" : String(cartCount);

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
    <View style={styles.container}>
      {/* HOME */}
      <TouchableOpacity
        onPress={() => onNavigate("home")}
        style={styles.tabButton}
      >
        <Home
          size={ICON_SIZE}
          color={isActive("home") ? "#FF5722" : "#757575"}
          strokeWidth={isActive("home") ? 2.5 : 2}
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
            color={isActive("cart") ? "#FF5722" : "#757575"}
            strokeWidth={isActive("cart") ? 2.5 : 2}
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
          color={isActive("favorites") ? "#FF5722" : "#757575"}
          strokeWidth={isActive("favorites") ? 2.5 : 2}
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
          color={isActive("inbox") ? "#FF5722" : "#757575"}
          strokeWidth={isActive("inbox") ? 2.5 : 2}
        />
        <Text style={[styles.tabText, isActive("inbox") && styles.activeText]}>
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
          color={isActive("account") ? "#FF5722" : "#757575"}
          strokeWidth={isActive("account") ? 2.5 : 2}
        />
        <Text
          style={[styles.tabText, isActive("account") && styles.activeText]}
        >
          Account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    maxWidth: SCREEN_WIDTH > 768 ? 768 : SCREEN_WIDTH,
    marginHorizontal: "auto",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: TAB_HEIGHT,
    paddingBottom: Platform.select({ ios: 20, android: 8 }),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 4,
    paddingVertical: 6,
  },
  tabText: {
    fontSize: SCREEN_WIDTH < 375 ? 10 : 11,
    color: "#757575",
    fontWeight: "500",
    marginTop: 2,
  },
  activeText: {
    color: "#FF5722",
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#F44336",
    borderRadius: SCREEN_WIDTH < 375 ? 10 : 12,
    minWidth: SCREEN_WIDTH < 375 ? 16 : 20,
    height: SCREEN_WIDTH < 375 ? 16 : 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: SCREEN_WIDTH < 375 ? 8 : 10,
    fontWeight: "700",
  },
});
