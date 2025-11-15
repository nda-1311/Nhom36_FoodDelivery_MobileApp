import { apiClient } from "@/lib/api";
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
import AddressManagementPage from "@/app/pages/AddressManagementPage";
import CallPage from "@/app/pages/CallPage";
import CartPage from "@/app/pages/CartPage";
import ChangePasswordPage from "@/app/pages/ChangePasswordPage";
import ChatDriverPage from "@/app/pages/ChatDriverPage";
import ChatPage from "@/app/pages/ChatPage";
import CheckoutPage from "@/app/pages/CheckoutPage";
import FavoritesPage from "@/app/pages/FavoritesPage";
import FoodDetailsPage from "@/app/pages/FoodDetailsPage";
import ForgotPasswordPage from "@/app/pages/ForgotPasswordPage";
import HistoryPage from "@/app/pages/HistoryPage";
import HomePage from "@/app/pages/HomePage";
import InboxPage from "@/app/pages/InboxPage";
import JoinPartyPage from "@/app/pages/JoinPartyPage";
import LocationSelectionPage from "@/app/pages/LocationSelectionPage";
import LoginPage from "@/app/pages/LoginPage";
import LogoutPage from "@/app/pages/LogoutPage";
import MapTrackingPage from "@/app/pages/MapTrackingPage";
import NotificationsPage from "@/app/pages/NotificationsPage";
import OrderDetailPage from "@/app/pages/OrderDetailPage";
import OrderTrackingPage from "@/app/pages/OrderTrackingPage";
import PaymentMethodPage from "@/app/pages/PaymentMethodPage";
import ProfilePage from "@/app/pages/ProfilePage";
import RatingPage from "@/app/pages/RatingPage";
import RegisterPage from "@/app/pages/RegisterPage";
import RestaurantPage from "@/app/pages/RestaurantPage";
import SearchPage from "@/app/pages/SearchPage";
import SupportPage from "@/app/pages/SupportPage";
import TrackOrderPage from "@/app/pages/TrackOrderPage";
import VoucherPage from "@/app/pages/VoucherPage";

// 🔐 Admin pages
import AdminDashboardPage from "@/app/pages/AdminDashboardPage";
import AdminFoodItemsPage from "@/app/pages/AdminFoodItemsPage";
import AdminOrdersPage from "@/app/pages/AdminOrdersPage";
import AdminRestaurantsPage from "@/app/pages/AdminRestaurantsPage";
import AdminStatisticsPage from "@/app/pages/AdminStatisticsPage";
import AdminUsersPage from "@/app/pages/AdminUsersPage";

// �🛒 Context & Components
import BottomNav from "./components/bottom-nav";
import { CartProvider, useCart } from "./store/cart-context"; // ✅ dùng context realtime thay vì useCartCount

// ==============================
// 🔖 Loại trang
// ==============================
type PageType =
  | "login"
  | "register"
  | "forgot-password"
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
  | "history"
  | "track-order"
  | "chat-driver"
  | "profile"
  | "change-password"
  | "order-detail"
  | "address-management"
  | "payment-method"
  | "notifications"
  | "support"
  | "admin-dashboard"
  | "admin-users"
  | "admin-orders"
  | "admin-restaurants"
  | "admin-food-items"
  | "admin-statistics";

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
  const [user, setUser] = useState<any>(null); // Track authenticated user for future features
  const [authChecking, setAuthChecking] = useState(true);

  const { cartCount } = useCart(); // ✅ lấy realtime count từ context

  // Add console log to confirm user is being tracked (suppress lint warning)
  console.log("Current user:", user?.id || "Not logged in");

  // ✅ Kiểm tra đăng nhập với Backend JWT
  useEffect(() => {
    const checkSession = async () => {
      setPage({ current: "loading" });

      try {
        const token = await apiClient.getAccessToken();

        console.log("Session check:", {
          hasToken: !!token,
        });

        if (!token) {
          setUser(null);
          setPage({ current: "login" });
          setAuthChecking(false);
        } else {
          // User is logged in, set to home
          setUser({ id: "current_user" }); // Simplified user object
          setPage({ current: "home" });
          setAuthChecking(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
        setPage({ current: "login" });
        setAuthChecking(false);
      }
    };

    checkSession();

    // Listen to custom auth events
    const handleAuthChange = () => {
      checkSession();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth:changed", handleAuthChange);
      return () => {
        window.removeEventListener("auth:changed", handleAuthChange);
      };
    }
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
      case "register":
        return <RegisterPage onNavigate={navigateTo} />;
      case "forgot-password":
        return <ForgotPasswordPage onNavigate={navigateTo} />;
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
      case "track-order":
        return <TrackOrderPage onNavigate={navigateTo} data={page.data} />;
      case "chat-driver":
        return <ChatDriverPage onNavigate={navigateTo} data={page.data} />;
      case "profile":
        return <ProfilePage onNavigate={navigateTo} />;
      case "change-password":
        return <ChangePasswordPage onNavigate={navigateTo} />;
      case "order-detail":
        return <OrderDetailPage onNavigate={navigateTo} data={page.data} />;
      case "rating":
        return <RatingPage onNavigate={navigateTo} data={page.data} />;
      case "address-management":
        return <AddressManagementPage onNavigate={navigateTo} />;
      case "payment-method":
        return <PaymentMethodPage onNavigate={navigateTo} />;
      case "notifications":
        return <NotificationsPage onNavigate={navigateTo} />;
      case "support":
        return <SupportPage onNavigate={navigateTo} />;
      // 🔐 Admin pages
      case "admin-dashboard":
        return <AdminDashboardPage onNavigate={navigateTo} />;
      case "admin-users":
        return <AdminUsersPage onNavigate={navigateTo} />;
      case "admin-orders":
        return <AdminOrdersPage onNavigate={navigateTo} />;
      case "admin-restaurants":
        return <AdminRestaurantsPage onNavigate={navigateTo} />;
      case "admin-food-items":
        return <AdminFoodItemsPage onNavigate={navigateTo} />;
      case "admin-statistics":
        return <AdminStatisticsPage onNavigate={navigateTo} />;
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

  // Ẩn bottom nav ở các trang đặc biệt và các trang admin
  const hideBottomNav =
    page.current === "login" ||
    page.current === "register" ||
    page.current === "forgot-password" ||
    page.current === "logout" ||
    page.current === "loading" ||
    page.current === "admin-dashboard" ||
    page.current === "admin-users" ||
    page.current === "admin-orders" ||
    page.current === "admin-restaurants" ||
    page.current === "admin-food-items" ||
    page.current === "admin-statistics";

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
