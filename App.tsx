import { supabase } from "@/lib/supabase/client";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// 🧩 Import các trang React Native
import AccountPage from "@/app/pages/AccountPage";
import CallPage from "@/app/pages/CallPage";
import CartPage from "@/app/pages/CartPage";
import ChatPage from "@/app/pages/ChatPage";
import CheckoutPage from "@/app/pages/CheckoutPage";
import FavoritesPage from "@/app/pages/FavoritesPage";
import FoodDetailsPage from "@/app/pages/FoodDetailsPage";
import HistoryPage from "@/app/pages/HistoryPage";
import HomePage from "@/app/pages/HomePage";
import InboxPage from "@/app/pages/InboxPage";
import JoinPartyPage from "@/app/pages/JoinPartyPage";
import LocationSelectionPage from "@/app/pages/LocationSelectionPage";
import LoginPage from "@/app/pages/LoginPage";
import LogoutPage from "@/app/pages/LogoutPage";
import MapTrackingPage from "@/app/pages/MapTrackingPage";
import OrderTrackingPage from "@/app/pages/OrderTrackingPage";
import RatingPage from "@/app/pages/RatingPage";
import RestaurantPage from "@/app/pages/RestaurantPage";
import SearchPage from "@/app/pages/SearchPage";
import VoucherPage from "@/app/pages/VoucherPage";

// 🛒 Context & Components
import BottomNav from "./components/bottom-nav";
import { CartProvider, useCart } from "./store/cart-context"; // ✅ dùng context realtime thay vì useCartCount

// ==============================
// 🔖 Loại trang
// ==============================
type PageType =
  | "login"
  | "logout"
  | "home"
  | "search"
  | "restaurant"
  | "food-details"
  | "cart"
  | "checkout"
  | "order-tracking"
  | "chat"
  | "rating"
  | "call"
  | "map-tracking"
  | "location-selection"
  | "join-party"
  | "favorites"
  | "inbox"
  | "account"
  | "voucher"
  | "loading"
  | "history";

interface PageState {
  current: PageType;
  data?: any;
}

// ==============================
// 🧠 AppContent (sử dụng useCart realtime)
// ==============================
function AppContent() {
  const [page, setPage] = useState<PageState>({ current: "loading" });
  const [favorites, setFavorites] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const { cartCount } = useCart(); // ✅ lấy realtime count từ context

  // ✅ Kiểm tra đăng nhập Supabase
  useEffect(() => {
    const checkSession = async () => {
      setPage({ current: "loading" });
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session || !session.user) {
        setUser(null);
        setPage({ current: "login" });
      } else {
        setUser(session.user);
        setPage({ current: "home" });
      }
      setAuthChecking(false);
    };

    checkSession();

    // 🔁 Theo dõi thay đổi trạng thái đăng nhập
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setPage({ current: "home" });
        } else {
          setUser(null);
          setPage({ current: "login" });
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // ⚙️ Điều hướng giữa các trang
  const navigateTo = (pageName: string, data?: any) => {
    setPage({ current: pageName as PageType, data });
  };

  // ❤️ Danh sách yêu thích
  const toggleFavorite = (item: any) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === item.id);
      return exists ? prev.filter((f) => f.id !== item.id) : [...prev, item];
    });
  };

  // 📱 Render từng trang
  const renderPage = () => {
    switch (page.current) {
      case "loading":
        return (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#06b6d4" />
            <Text style={styles.textMuted}>Đang kiểm tra đăng nhập...</Text>
          </View>
        );
      case "login":
        return <LoginPage onNavigate={navigateTo} />;
      case "logout":
        return <LogoutPage onNavigate={navigateTo} />;
      case "home":
        return (
          <HomePage
            onNavigate={navigateTo}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case "search":
        return (
          <SearchPage
            onNavigate={navigateTo}
            initialQuery={page.data?.initialQuery}
          />
        );
      case "restaurant":
        return <RestaurantPage data={page.data} onNavigate={navigateTo} />;
      case "food-details":
        return (
          <FoodDetailsPage
            data={page.data}
            onNavigate={navigateTo}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case "cart":
        return <CartPage onNavigate={navigateTo} />;
      case "checkout":
        return <CheckoutPage onNavigate={navigateTo} />;
      case "order-tracking":
        return <OrderTrackingPage onNavigate={navigateTo} />;
      case "chat":
        return <ChatPage onNavigate={navigateTo} />;
      case "rating":
        return <RatingPage onNavigate={navigateTo} />;
      case "call":
        return <CallPage onNavigate={navigateTo} />;
      case "map-tracking":
        return <MapTrackingPage onNavigate={navigateTo} />;
      case "location-selection":
        return <LocationSelectionPage onNavigate={navigateTo} />;
      case "join-party":
        return <JoinPartyPage onNavigate={navigateTo} />;
      case "favorites":
        return (
          <FavoritesPage
            onNavigate={navigateTo}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case "inbox":
        return <InboxPage onNavigate={navigateTo} />;
      case "account":
        return <AccountPage onNavigate={navigateTo} />;
      case "voucher":
        return <VoucherPage onNavigate={navigateTo} />;
      case "history":
        return <HistoryPage onNavigate={navigateTo} />;
      default:
        return (
          <HomePage
            onNavigate={navigateTo}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
    }
  };

  // 🧩 Loading khi đang xác thực
  if (authChecking) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.textMuted}>Đang kiểm tra đăng nhập...</Text>
      </View>
    );
  }

  // Ẩn bottom nav ở các trang đặc biệt
  const hideBottomNav =
    page.current === "login" ||
    page.current === "logout" ||
    page.current === "loading";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appWrapper}>
        {renderPage()}
        {!hideBottomNav && (
          <BottomNav
            currentPage={page.current}
            onNavigate={navigateTo}
            cartCount={cartCount} // ✅ realtime count
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ==============================
// 🚀 App chính (bọc provider)
// ==============================
export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

// ==============================
// 🎨 Styles
// ==============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  appWrapper: { flex: 1, backgroundColor: "#fff", position: "relative" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  textMuted: { marginTop: 10, fontSize: 14, color: "#6b7280" },
});
