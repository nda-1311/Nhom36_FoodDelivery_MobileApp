import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/design";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase/client";
import { LinearGradient } from "expo-linear-gradient";
import {
  BarChart3,
  ChevronLeft,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

// Alias for convenience
const SP = {
  xs: SPACING.xs,
  s: SPACING.s,
  m: SPACING.m,
  l: SPACING.l,
  xl: SPACING.xl,
  xxl: SPACING.xxl,
};
const RD = {
  xs: RADIUS.xs,
  s: RADIUS.s,
  m: RADIUS.m,
  l: RADIUS.l,
  xl: RADIUS.xl,
};

interface AdminStatisticsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface TopItem {
  id: string;
  name: string;
  count: number;
  revenue: number;
}

interface Statistics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  avgOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  dailyRevenue: DailyRevenue[];
  topFoodItems: TopItem[];
  topRestaurants: TopItem[];
  ordersByStatus: { status: string; count: number }[];
}

export default function AdminStatisticsPage({
  onNavigate,
}: AdminStatisticsPageProps) {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7days" | "30days" | "90days">("30days");

  const loadStatistics = React.useCallback(async () => {
    try {
      setLoading(true);

      const periodDays = period === "7days" ? 7 : period === "30days" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      // Get orders in period
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .eq("status", "completed");

      if (ordersError) throw ordersError;

      // Get previous period for comparison
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - periodDays);

      const { data: prevOrders } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", prevStartDate.toISOString())
        .lt("created_at", startDate.toISOString())
        .eq("status", "completed");

      // Calculate totals
      const totalRevenue =
        orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;

      const prevRevenue =
        prevOrders?.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        ) || 0;
      const prevOrdersCount = prevOrders?.length || 0;

      const revenueGrowth =
        prevRevenue > 0
          ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
          : 0;
      const ordersGrowth =
        prevOrdersCount > 0
          ? ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100
          : 0;

      // Get total users
      const { count: totalUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Calculate daily revenue
      const dailyRevenueMap: Record<
        string,
        { revenue: number; orders: number }
      > = {};

      orders?.forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString("vi-VN");
        if (!dailyRevenueMap[date]) {
          dailyRevenueMap[date] = { revenue: 0, orders: 0 };
        }
        dailyRevenueMap[date].revenue += order.total_amount || 0;
        dailyRevenueMap[date].orders += 1;
      });

      const dailyRevenue = Object.entries(dailyRevenueMap)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders,
        }))
        .sort(
          (a, b) =>
            new Date(a.date.split("/").reverse().join("-")).getTime() -
            new Date(b.date.split("/").reverse().join("-")).getTime()
        )
        .slice(-14); // Last 14 days

      // Get top food items (mock data for now)
      const topFoodItems: TopItem[] = [
        { id: "1", name: "Phở bò", count: 45, revenue: 2250000 },
        { id: "2", name: "Bún chả", count: 38, revenue: 1900000 },
        { id: "3", name: "Cơm tấm", count: 32, revenue: 1280000 },
        { id: "4", name: "Bánh mì", count: 28, revenue: 840000 },
        { id: "5", name: "Gỏi cuốn", count: 25, revenue: 750000 },
      ];

      // Get top restaurants (mock data for now)
      const topRestaurants: TopItem[] = [
        { id: "1", name: "Nhà hàng A", count: 85, revenue: 4250000 },
        { id: "2", name: "Nhà hàng B", count: 72, revenue: 3600000 },
        { id: "3", name: "Nhà hàng C", count: 58, revenue: 2900000 },
        { id: "4", name: "Nhà hàng D", count: 43, revenue: 2150000 },
        { id: "5", name: "Nhà hàng E", count: 35, revenue: 1750000 },
      ];

      // Get orders by status
      const { data: allOrders } = await supabase
        .from("orders")
        .select("status")
        .gte("created_at", startDate.toISOString());

      const statusMap: Record<string, number> = {};
      allOrders?.forEach((order) => {
        statusMap[order.status] = (statusMap[order.status] || 0) + 1;
      });

      const ordersByStatus = Object.entries(statusMap).map(
        ([status, count]) => ({ status, count })
      );

      setStats({
        totalRevenue,
        totalOrders,
        totalUsers: totalUsers || 0,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        revenueGrowth,
        ordersGrowth,
        dailyRevenue,
        topFoodItems,
        topRestaurants,
        ordersByStatus,
      });
    } catch (error) {
      console.error("Error loading statistics:", error);
      Alert.alert("Lỗi", "Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert("Truy cập bị từ chối", "Bạn không có quyền truy cập");
      onNavigate("admin-dashboard");
      return;
    }

    if (isAdmin) {
      loadStatistics();
    }
  }, [isAdmin, adminLoading, onNavigate, loadStatistics]);

  if (adminLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thống kê...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      delivering: "Đang giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#FF9800",
      confirmed: "#2196F3",
      preparing: "#9C27B0",
      delivering: "#00BCD4",
      completed: "#4CAF50",
      cancelled: "#F44336",
    };
    return colors[status] || "#757575";
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => onNavigate("admin-dashboard")}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo cáo thống kê</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer}>
        {/* Period Filter */}
        <View style={styles.periodContainer}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "7days" && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod("7days")}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === "7days" && styles.periodButtonTextActive,
              ]}
            >
              7 ngày
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "30days" && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod("30days")}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === "30days" && styles.periodButtonTextActive,
              ]}
            >
              30 ngày
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "90days" && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod("90days")}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === "90days" && styles.periodButtonTextActive,
              ]}
            >
              90 ngày
            </Text>
          </TouchableOpacity>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <DollarSign size={24} color={COLORS.primary} />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Tổng doanh thu</Text>
              <Text style={styles.metricValue}>
                {stats?.totalRevenue.toLocaleString("vi-VN")}đ
              </Text>
              <View style={styles.growthContainer}>
                {stats && stats.revenueGrowth >= 0 ? (
                  <TrendingUp size={14} color="#4CAF50" />
                ) : (
                  <TrendingDown size={14} color="#F44336" />
                )}
                <Text
                  style={[
                    styles.growthText,
                    {
                      color:
                        stats && stats.revenueGrowth >= 0
                          ? "#4CAF50"
                          : "#F44336",
                    },
                  ]}
                >
                  {Math.abs(stats?.revenueGrowth || 0).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <ShoppingBag size={24} color={COLORS.secondary} />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Tổng đơn hàng</Text>
              <Text style={styles.metricValue}>{stats?.totalOrders}</Text>
              <View style={styles.growthContainer}>
                {stats && stats.ordersGrowth >= 0 ? (
                  <TrendingUp size={14} color="#4CAF50" />
                ) : (
                  <TrendingDown size={14} color="#F44336" />
                )}
                <Text
                  style={[
                    styles.growthText,
                    {
                      color:
                        stats && stats.ordersGrowth >= 0
                          ? "#4CAF50"
                          : "#F44336",
                    },
                  ]}
                >
                  {Math.abs(stats?.ordersGrowth || 0).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Users size={24} color={COLORS.accent} />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Người dùng</Text>
              <Text style={styles.metricValue}>{stats?.totalUsers}</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <BarChart3 size={24} color="#9C27B0" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Giá trị TB/đơn</Text>
              <Text style={styles.metricValue}>
                {stats?.avgOrderValue.toLocaleString("vi-VN", {
                  maximumFractionDigits: 0,
                })}
                đ
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Revenue Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doanh thu theo ngày</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chartContainer}
          >
            <View style={styles.chart}>
              {stats?.dailyRevenue.map((item, index) => {
                const maxRevenue = Math.max(
                  ...stats.dailyRevenue.map((d) => d.revenue)
                );
                const height =
                  maxRevenue > 0 ? (item.revenue / maxRevenue) * 150 : 0;

                return (
                  <View key={index} style={styles.chartBar}>
                    <Text style={styles.chartValue}>
                      {(item.revenue / 1000).toFixed(0)}k
                    </Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: height || 2,
                          backgroundColor: COLORS.primary,
                        },
                      ]}
                    />
                    <Text style={styles.chartLabel} numberOfLines={1}>
                      {item.date.split("/").slice(0, 2).join("/")}
                    </Text>
                    <Text style={styles.chartOrders}>{item.orders} đơn</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Orders by Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn hàng theo trạng thái</Text>
          <View style={styles.statusContainer}>
            {stats?.ordersByStatus.map((item, index) => (
              <View key={index} style={styles.statusItem}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                />
                <Text style={styles.statusLabel}>
                  {getStatusLabel(item.status)}
                </Text>
                <Text style={styles.statusCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Food Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top món ăn</Text>
          {stats?.topFoodItems.map((item, index) => (
            <View key={item.id} style={styles.topItemCard}>
              <View style={styles.topItemRank}>
                <Text style={styles.topItemRankText}>{index + 1}</Text>
              </View>
              <View style={styles.topItemContent}>
                <Text style={styles.topItemName}>{item.name}</Text>
                <Text style={styles.topItemStats}>
                  {item.count} đơn • {item.revenue.toLocaleString("vi-VN")}đ
                </Text>
              </View>
              <Package size={20} color={COLORS.textSecondary} />
            </View>
          ))}
        </View>

        {/* Top Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top nhà hàng</Text>
          {stats?.topRestaurants.map((item, index) => (
            <View key={item.id} style={styles.topItemCard}>
              <View style={styles.topItemRank}>
                <Text style={styles.topItemRankText}>{index + 1}</Text>
              </View>
              <View style={styles.topItemContent}>
                <Text style={styles.topItemName}>{item.name}</Text>
                <Text style={styles.topItemStats}>
                  {item.count} đơn • {item.revenue.toLocaleString("vi-VN")}đ
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SP.m,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    paddingTop: SP.m,
    paddingBottom: SP.m,
    ...SHADOWS.medium,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SP.m,
  },
  backButton: {
    padding: SP.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  periodContainer: {
    flexDirection: "row",
    padding: SP.m,
    gap: SP.s,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SP.s,
    borderRadius: RD.m,
    backgroundColor: "#fff",
    alignItems: "center",
    ...SHADOWS.small,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  periodButtonTextActive: {
    color: "#fff",
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SP.m,
    gap: SP.m,
  },
  metricCard: {
    backgroundColor: "#fff",
    borderRadius: RD.m,
    padding: SP.m,
    width: "48%",
    ...SHADOWS.small,
  },
  metricIcon: {
    marginBottom: SP.s,
  },
  metricContent: {
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  growthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginTop: SP.l,
    paddingHorizontal: SP.m,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SP.m,
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: RD.m,
    padding: SP.m,
    ...SHADOWS.small,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SP.s,
    paddingVertical: SP.s,
  },
  chartBar: {
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  chartValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  bar: {
    width: 40,
    borderRadius: RD.xs,
    minHeight: 2,
  },
  chartLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    width: 50,
    textAlign: "center",
  },
  chartOrders: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "600",
  },
  statusContainer: {
    backgroundColor: "#fff",
    borderRadius: RD.m,
    padding: SP.m,
    ...SHADOWS.small,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SP.s,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SP.m,
  },
  statusLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  statusCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  topItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: RD.m,
    padding: SP.m,
    marginBottom: SP.s,
    ...SHADOWS.small,
  },
  topItemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SP.m,
  },
  topItemRankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  topItemContent: {
    flex: 1,
  },
  topItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  topItemStats: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
