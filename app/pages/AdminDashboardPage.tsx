import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/design";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase/client";
import { LinearGradient } from "expo-linear-gradient";
import {
  BarChart3,
  ChevronLeft,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AdminDashboardPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Statistics {
  totalUsers: number;
  totalOrders: number;
  totalRestaurants: number;
  totalFoodItems: number;
  totalRevenue: number;
  pendingOrders: number;
  ordersLast7Days: number;
  newUsersLast7Days: number;
}

export default function AdminDashboardPage({
  onNavigate,
}: AdminDashboardPageProps) {
  const { isAdmin, role, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch statistics using RPC or direct queries
      const [usersRes, ordersRes, restaurantsRes, foodItemsRes] =
        await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase
            .from("restaurants")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("food_items")
            .select("*", { count: "exact", head: true }),
        ]);

      // Get completed orders revenue
      const { data: completedOrders } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "completed");

      const totalRevenue =
        completedOrders?.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        ) || 0;

      // Get pending orders count
      const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Get orders in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: ordersLast7 } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      // Get new users in last 7 days
      const { count: newUsersLast7 } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      setStats({
        totalUsers: usersRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRestaurants: restaurantsRes.count || 0,
        totalFoodItems: foodItemsRes.count || 0,
        totalRevenue,
        pendingOrders: pendingCount || 0,
        ordersLast7Days: ordersLast7 || 0,
        newUsersLast7Days: newUsersLast7 || 0,
      });
    } catch (error) {
      console.error("Error loading statistics:", error);
      Alert.alert("Lỗi", "Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert(
        "Truy cập bị từ chối",
        "Bạn không có quyền truy cập trang này"
      );
      onNavigate("home");
      return;
    }

    if (isAdmin) {
      loadStatistics();
    }
  }, [isAdmin, adminLoading, onNavigate, loadStatistics]);

  if (adminLoading || loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const menuItems = [
    {
      id: "users",
      title: "Quản lý người dùng",
      icon: Users,
      color: "#4CAF50",
      page: "admin-users",
    },
    {
      id: "orders",
      title: "Quản lý đơn hàng",
      icon: ShoppingBag,
      color: "#2196F3",
      page: "admin-orders",
    },
    {
      id: "restaurants",
      title: "Quản lý nhà hàng",
      icon: Store,
      color: "#FF9800",
      page: "admin-restaurants",
    },
    {
      id: "food-items",
      title: "Quản lý món ăn",
      icon: Package,
      color: "#E91E63",
      page: "admin-food-items",
    },
    {
      id: "statistics",
      title: "Báo cáo thống kê",
      icon: BarChart3,
      color: "#9C27B0",
      page: "admin-statistics",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => onNavigate("home")}
            style={styles.backButton}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role.toUpperCase()}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#4CAF50" }]}>
              <Users color="#fff" size={32} />
              <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Người dùng</Text>
              {stats?.newUsersLast7Days ? (
                <Text style={styles.statSubLabel}>
                  +{stats.newUsersLast7Days} tuần này
                </Text>
              ) : null}
            </View>

            <View style={[styles.statCard, { backgroundColor: "#2196F3" }]}>
              <ShoppingBag color="#fff" size={32} />
              <Text style={styles.statValue}>{stats?.totalOrders || 0}</Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
              {stats?.pendingOrders ? (
                <Text style={styles.statSubLabel}>
                  {stats.pendingOrders} đang chờ
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#FF9800" }]}>
              <Store color="#fff" size={32} />
              <Text style={styles.statValue}>
                {stats?.totalRestaurants || 0}
              </Text>
              <Text style={styles.statLabel}>Nhà hàng</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#E91E63" }]}>
              <Package color="#fff" size={32} />
              <Text style={styles.statValue}>{stats?.totalFoodItems || 0}</Text>
              <Text style={styles.statLabel}>Món ăn</Text>
            </View>
          </View>

          <View style={styles.revenueCard}>
            <TrendingUp color="#fff" size={40} />
            <Text style={styles.revenueValue}>
              {(stats?.totalRevenue || 0).toLocaleString("vi-VN")} đ
            </Text>
            <Text style={styles.revenueLabel}>Tổng doanh thu</Text>
            {stats?.ordersLast7Days ? (
              <Text style={styles.revenueSubLabel}>
                {stats.ordersLast7Days} đơn hàng 7 ngày qua
              </Text>
            ) : null}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => onNavigate(item.page)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <item.icon color="#fff" size={28} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.m,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    paddingTop: SPACING.l,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.l,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.m,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: SPACING.l,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: SPACING.m,
    gap: SPACING.m,
  },
  statCard: {
    flex: 1,
    padding: SPACING.l,
    borderRadius: RADIUS.l,
    ...SHADOWS.medium,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginTop: SPACING.s,
  },
  statLabel: {
    fontSize: 14,
    color: "#fff",
    marginTop: SPACING.xs,
  },
  statSubLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: SPACING.xs,
  },
  revenueCard: {
    backgroundColor: "#9C27B0",
    padding: SPACING.xl,
    borderRadius: RADIUS.l,
    ...SHADOWS.medium,
    alignItems: "center",
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: SPACING.m,
  },
  revenueLabel: {
    fontSize: 16,
    color: "#fff",
    marginTop: SPACING.xs,
  },
  revenueSubLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: SPACING.s,
  },
  menuContainer: {
    padding: SPACING.l,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.m,
  },
  menuItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: RADIUS.l,
    padding: SPACING.l,
    alignItems: "center",
    ...SHADOWS.small,
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
});
