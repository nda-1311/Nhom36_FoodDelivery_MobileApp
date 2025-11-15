import { COLORS, RADIUS, SHADOWS } from "@/constants/design";
import { useAdmin } from "@/hooks/useAdmin";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Edit2,
  Gift,
  HelpCircle,
  History,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingBag,
  Star,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AccountPageProps {
  onNavigate: (page: string, data?: any) => void;
  data?: { refresh?: boolean };
}

interface UserInfo {
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalOrders: number;
  memberSince: string;
  avatar: string;
}

export default function AccountPage({ onNavigate, data }: AccountPageProps) {
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isAdmin } = useAdmin(); // Check if user is admin
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "User",
    phone: "",
    email: "",
    rating: 0,
    totalOrders: 0,
    memberSince: "",
    avatar: "U",
  });

  // Fetch user data from Backend API
  useEffect(() => {
    const fetchUserData = async () => {
      setUserLoading(true);
      try {
        // Import authService dynamically to avoid circular dependency
        const { authService } = await import("@/lib/api/auth");

        // Check if user is authenticated
        const isAuthenticated = await authService.isAuthenticated();
        console.log("📱 AccountPage - isAuthenticated:", isAuthenticated);

        if (!isAuthenticated) {
          console.log("User not authenticated");
          setUserLoading(false);
          return;
        }

        // Fetch user profile from backend API
        console.log("📡 AccountPage - Fetching user profile...");
        const response = await authService.getCurrentUser();
        console.log("📡 AccountPage - Response:", response);

        if (!response.success || !response.data) {
          console.error("Error getting user:", response.message);
          setUserLoading(false);
          return;
        }

        const user = response.data;

        // TODO: Fetch total orders count from backend
        // For now, set to 0
        const totalOrders = 0;

        const userName = user.fullName || "User";
        const userEmail = user.email || "";
        const userPhone = user.phoneNumber || "";
        const userRating = 0; // TODO: Get from backend if available

        // Format member since date
        const createdDate = new Date(user.createdAt);
        const memberSince = createdDate.toLocaleDateString("vi-VN", {
          month: "long",
          year: "numeric",
        });

        // Get initials for avatar
        const initials = userName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        setUserInfo({
          name: userName,
          phone: userPhone,
          email: userEmail,
          rating: userRating,
          totalOrders: totalOrders,
          memberSince: memberSince,
          avatar: initials,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [refreshKey]); // Re-run when refreshKey changes

  // Trigger refresh when coming back from ProfilePage
  useEffect(() => {
    if (data?.refresh) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [data?.refresh]);

  // ✅ Đăng xuất khỏi Backend API
  const handleLogout = async () => {
    try {
      setLoading(true);

      // Import authService dynamically
      const { authService } = await import("@/lib/api/auth");

      // Logout from backend (clears tokens)
      await authService.logout();

      console.log("✅ Đã đăng xuất thành công");
      onNavigate("login");
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng xuất!");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Profile Card with Gradient Avatar */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{userInfo.avatar}</Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{userInfo.name}</Text>
            <View style={styles.ratingRow}>
              <Star size={16} color="#facc15" fill="#facc15" />
              <Text style={styles.ratingValue}>{userInfo.rating}</Text>
              <Text style={styles.orderCount}>
                ({userInfo.totalOrders} đơn hàng)
              </Text>
            </View>
            <Text style={styles.memberSince}>
              Thành viên từ {userInfo.memberSince}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onNavigate("profile")}
          >
            <Edit2 size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: "#FFE5DD" }]}>
            <ShoppingBag size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{userInfo.totalOrders}</Text>
          <Text style={styles.statLabel}>Tổng đơn</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: "#FFF4CC" }]}>
            <Star size={24} color={COLORS.accent} />
          </View>
          <Text style={styles.statValue}>{userInfo.rating}</Text>
          <Text style={styles.statLabel}>Đánh giá</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: "#CCF5FA" }]}>
            <Gift size={24} color={COLORS.secondary} />
          </View>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Ưu đãi</Text>
        </View>
      </View>

      {/* Account Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

        <View style={styles.infoCard}>
          <View style={styles.iconCircle}>
            <User size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Họ và tên</Text>
            <Text style={styles.infoValue}>{userInfo.name}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconCircle}>
            <Phone size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>
              {userInfo.phone || "Chưa cập nhật"}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconCircle}>
            <Mail size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userInfo.email}</Text>
          </View>
        </View>
      </View>

      {/* Settings Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>

        {/* Admin Dashboard - Only show if user is admin */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.menuCard, styles.adminCard]}
            onPress={() => onNavigate("admin-dashboard")}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#FFE5DD" }]}>
              <Shield size={22} color={COLORS.primary} />
            </View>
            <Text style={[styles.menuLabel, styles.adminLabel]}>
              Trang quản trị Admin
            </Text>
            <ChevronRight size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => onNavigate("history")}
        >
          <View style={[styles.menuIcon, { backgroundColor: "#FFE5DD" }]}>
            <History size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.menuLabel}>Lịch sử đơn hàng</Text>
          <ChevronRight size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => onNavigate("notifications")}
        >
          <View style={[styles.menuIcon, { backgroundColor: "#CCF5FA" }]}>
            <Bell size={22} color={COLORS.secondary} />
          </View>
          <Text style={styles.menuLabel}>Thông báo</Text>
          <ChevronRight size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => onNavigate("payment-method")}
        >
          <View style={[styles.menuIcon, { backgroundColor: "#FFF4CC" }]}>
            <CreditCard size={22} color={COLORS.accent} />
          </View>
          <Text style={styles.menuLabel}>Phương thức thanh toán</Text>
          <ChevronRight size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => onNavigate("address-management")}
        >
          <View style={[styles.menuIcon, { backgroundColor: "#EDE7F6" }]}>
            <MapPin size={22} color="#8b5cf6" />
          </View>
          <Text style={styles.menuLabel}>Địa chỉ giao hàng</Text>
          <ChevronRight size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => onNavigate("support")}
        >
          <View style={[styles.menuIcon, { backgroundColor: "#CFFAFE" }]}>
            <HelpCircle size={22} color="#06b6d4" />
          </View>
          <Text style={styles.menuLabel}>Trợ giúp</Text>
          <ChevronRight size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          <LinearGradient
            colors={["#ef4444", "#dc2626"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <LogOut size={20} color="#ffffff" />
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },

  // Profile Card
  profileCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: RADIUS.l,
    padding: 20,
    ...SHADOWS.medium,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.small,
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingValue: {
    fontWeight: "600",
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 4,
  },
  orderCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  memberSince: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },

  // Stats Section
  statsSection: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 16,
    alignItems: "center",
    ...SHADOWS.small,
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
  },

  // Info Card
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.l,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: "#FFE5DD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  // Menu Card
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.l,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.m,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  adminCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: "#FFE0D6",
  },
  adminLabel: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  // Logout
  logoutSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  logoutButton: {
    borderRadius: RADIUS.l,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  logoutGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
});
