import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/design";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase/client";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle,
  ChevronLeft,
  Clock,
  DollarSign,
  Package,
  Search,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AdminOrdersPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Order {
  id: string;
  user_id: string;
  restaurant_id?: string;
  status: string;
  total_amount: number;
  created_at: string;
  user_email?: string;
  restaurant_name?: string;
  items_count?: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#FF9800",
  confirmed: "#2196F3",
  preparing: "#9C27B0",
  delivering: "#00BCD4",
  completed: "#4CAF50",
  cancelled: "#F44336",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  delivering: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export default function AdminOrdersPage({ onNavigate }: AdminOrdersPageProps) {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert("Truy cập bị từ chối", "Bạn không có quyền truy cập");
      onNavigate("admin-dashboard");
      return;
    }

    if (isAdmin) {
      loadOrders();
    }
  }, [isAdmin, adminLoading, onNavigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(ordersData || []);
      setFilteredOrders(ordersData || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.user_email?.toLowerCase().includes(query) ||
          order.restaurant_name?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, filterStatus, orders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      Alert.alert("Thành công", "Đã cập nhật trạng thái đơn hàng");
      loadOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
    }
  };

  const handleViewDetails = (order: Order) => {
    onNavigate("order-detail", { orderId: order.id });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Package size={20} color={COLORS.primary} />
          <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[item.status] || COLORS.textLight },
          ]}
        >
          <Text style={styles.statusText}>
            {STATUS_LABELS[item.status] || item.status}
          </Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <DollarSign size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            Tổng tiền: {item.total_amount?.toLocaleString("vi-VN") || 0} đ
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            {new Date(item.created_at).toLocaleString("vi-VN")}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        {item.status === "pending" && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleUpdateStatus(item.id, "confirmed")}
            >
              <CheckCircle size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleUpdateStatus(item.id, "cancelled")}
            >
              <XCircle size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Hủy</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === "confirmed" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.preparingButton]}
            onPress={() => handleUpdateStatus(item.id, "preparing")}
          >
            <Package size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Chuẩn bị</Text>
          </TouchableOpacity>
        )}
        {item.status === "preparing" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deliveringButton]}
            onPress={() => handleUpdateStatus(item.id, "delivering")}
          >
            <Package size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Giao hàng</Text>
          </TouchableOpacity>
        )}
        {item.status === "delivering" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleUpdateStatus(item.id, "completed")}
          >
            <CheckCircle size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Hoàn thành</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => onNavigate("admin-dashboard")}
            style={styles.backButton}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm đơn hàng..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === "all" && styles.activeTab]}
          onPress={() => setFilterStatus("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === "all" && styles.activeTabText,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === "pending" && styles.activeTab,
          ]}
          onPress={() => setFilterStatus("pending")}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === "pending" && styles.activeTabText,
            ]}
          >
            Chờ xác nhận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === "completed" && styles.activeTab,
          ]}
          onPress={() => setFilterStatus("completed")}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === "completed" && styles.activeTabText,
            ]}
          >
            Hoàn thành
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={80} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
          </View>
        }
      />
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
    paddingBottom: SPACING.l,
    paddingHorizontal: SPACING.l,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.m,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: RADIUS.m,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    gap: SPACING.s,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: "row",
    padding: SPACING.m,
    gap: SPACING.s,
    backgroundColor: "#fff",
    ...SHADOWS.small,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: RADIUS.s,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  listContainer: {
    padding: SPACING.l,
    gap: SPACING.m,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.m,
    padding: SPACING.l,
    ...SHADOWS.small,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.s,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  orderInfo: {
    marginBottom: SPACING.m,
    gap: SPACING.xs,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.s,
    marginTop: SPACING.s,
    paddingTop: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.s,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  preparingButton: {
    backgroundColor: "#9C27B0",
  },
  deliveringButton: {
    backgroundColor: "#00BCD4",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    marginTop: SPACING.l,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
