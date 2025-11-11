import { supabase } from "@/lib/supabase/client";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  Star,
  Truck,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, RADIUS, SHADOWS } from "../../constants/design";

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

interface HistoryPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function HistoryPage({ onNavigate }: HistoryPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setOrders(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return { Icon: CheckCircle2, color: "#10b981" };
      case "pending":
        return { Icon: Clock, color: COLORS.accent };
      case "cancelled":
        return { Icon: XCircle, color: "#ef4444" };
      case "preparing":
        return { Icon: Package, color: COLORS.primary };
      case "on the way":
        return { Icon: Truck, color: COLORS.secondary };
      default:
        return { Icon: ShoppingBag, color: COLORS.textSecondary };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "#10b981";
      case "pending":
        return COLORS.accent;
      case "cancelled":
        return "#ef4444";
      case "preparing":
        return COLORS.primary;
      case "on the way":
        return COLORS.secondary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "Đã giao";
      case "pending":
        return "Chờ xử lý";
      case "cancelled":
        return "Đã hủy";
      case "preparing":
        return "Đang chuẩn bị";
      case "on the way":
        return "Đang giao";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải lịch sử đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => onNavigate("home")}
          >
            <ChevronLeft size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <ShoppingBag size={48} color={COLORS.textLight} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
          <Text style={styles.emptySubtitle}>
            Bắt đầu đặt món ăn ngon ngay bây giờ!
          </Text>
          <TouchableOpacity
            onPress={() => onNavigate("home")}
            style={styles.emptyButton}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyButtonGradient}
            >
              <ShoppingBag size={20} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.emptyButtonText}>Đặt món ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={COLORS.gradientPrimary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate("home")}
        >
          <ChevronLeft size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Order List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {orders.map((order) => {
          const statusInfo = getStatusIcon(order.status);
          const StatusIcon = statusInfo.Icon;
          const statusColor = getStatusColor(order.status);

          return (
            <View key={order.id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderCodeRow}>
                  <View
                    style={[
                      styles.statusIconCircle,
                      { backgroundColor: `${statusColor}15` },
                    ]}
                  >
                    <StatusIcon
                      size={18}
                      color={statusColor}
                      strokeWidth={2.5}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderCode}>
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </Text>
                    <View style={styles.timeRow}>
                      <Clock size={12} color={COLORS.textLight} />
                      <Text style={styles.timeText}>
                        {new Date(order.created_at).toLocaleDateString(
                          "vi-VN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${statusColor}15` },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>

              {/* Order Total */}
              <View style={styles.totalRow}>
                <DollarSign
                  size={16}
                  color={COLORS.primary}
                  strokeWidth={2.5}
                />
                <Text style={styles.totalText}>
                  {order.total.toLocaleString("vi-VN")}₫
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() =>
                    onNavigate("order-detail", { orderId: order.id })
                  }
                >
                  <Package size={16} color={COLORS.primary} strokeWidth={2.5} />
                  <Text style={styles.detailButtonText}>Chi tiết</Text>
                </TouchableOpacity>

                {(order.status === "Preparing" ||
                  order.status === "On the way" ||
                  order.status === "Confirmed") && (
                  <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() =>
                      onNavigate("track-order", { orderId: order.id })
                    }
                  >
                    <LinearGradient
                      colors={COLORS.gradientPrimary as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.trackGradient}
                    >
                      <Truck size={16} color="#ffffff" strokeWidth={2.5} />
                      <Text style={styles.trackButtonText}>Theo dõi</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {order.status === "Delivered" && (
                  <TouchableOpacity
                    style={styles.ratingButton}
                    onPress={() => onNavigate("rating", { orderId: order.id })}
                  >
                    <Star size={16} color={COLORS.accent} strokeWidth={2.5} />
                    <Text style={styles.ratingButtonText}>Đánh giá</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
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
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
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

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: RADIUS.l,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Scroll Content
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  // Order Card
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderCodeRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statusIconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  orderCode: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.m,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Total Row
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.m,
    marginBottom: 12,
    gap: 4,
  },
  totalText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.primary,
  },

  // Action Buttons
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  detailButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${COLORS.primary}15`,
    paddingVertical: 10,
    borderRadius: RADIUS.m,
    gap: 6,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  trackButton: {
    flex: 1,
    borderRadius: RADIUS.m,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  trackGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  ratingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${COLORS.accent}20`,
    paddingVertical: 10,
    borderRadius: RADIUS.m,
    gap: 6,
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.accent,
  },
});
