import { supabase } from "@/lib/supabase/client";
import {
  ChevronLeft,
  Clock,
  MapPin,
  Package,
  Phone,
  Star,
  Truck,
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

interface OrderDetailPageProps {
  onNavigate: (page: string, data?: any) => void;
  data?: { orderId: string };
}

interface OrderItem {
  id: string;
  food_item_id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderDetail {
  id: string;
  status: string;
  delivery_address: string;
  delivery_time: number;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  created_at: string;
  restaurant?: {
    name: string;
    cuisine: string;
  };
  delivery_assignment?: {
    driver: {
      name: string;
      phone: string;
      vehicle_number: string;
    };
  };
  items?: OrderItem[];
}

export default function OrderDetailPage({
  onNavigate,
  data,
}: OrderDetailPageProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data?.orderId) {
      Alert.alert("Lỗi", "Không tìm thấy mã đơn hàng");
      onNavigate("history");
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        // Fetch order info
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select(
            `
            *,
            restaurant:restaurants(name, cuisine),
            delivery_assignment:delivery_assignments(
              driver:drivers(name, phone, vehicle_number)
            )
          `
          )
          .eq("id", data.orderId)
          .single();

        if (orderError) throw orderError;

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", data.orderId);

        if (itemsError) throw itemsError;

        setOrder({
          ...orderData,
          items: itemsData || [],
        } as OrderDetail);
      } catch (error: any) {
        console.error("Error fetching order detail:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [data?.orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "#16a34a";
      case "Cancelled":
        return "#ef4444";
      case "On the way":
        return "#f59e0b";
      case "Preparing":
        return "#06b6d4";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ xác nhận";
      case "Confirmed":
        return "Đã xác nhận";
      case "Preparing":
        return "Đang chuẩn bị";
      case "On the way":
        return "Đang giao";
      case "Delivered":
        return "Đã giao";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.textMuted}>Đang tải chi tiết đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onNavigate("history")}
        >
          <Text style={styles.primaryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("history")}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <Text style={styles.orderNumber}>#{order.id.slice(0, 8)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Package size={24} color={getStatusColor(order.status)} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusLabel}>Trạng thái đơn hàng</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
          <View style={styles.timeRow}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.timeText}>
              {new Date(order.created_at).toLocaleString("vi-VN")}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Món ăn đã đặt</Text>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemImage}>
                  <Text style={styles.itemImageText}>🍽️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>Số lượng: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Không có món ăn nào</Text>
          )}
        </View>

        {/* Restaurant Info */}
        {order.restaurant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin nhà hàng</Text>
            <View style={styles.infoRow}>
              <Package size={18} color="#06b6d4" />
              <Text style={styles.infoText}>{order.restaurant.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Star size={18} color="#facc15" fill="#facc15" />
              <Text style={styles.infoText}>{order.restaurant.cuisine}</Text>
            </View>
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          <View style={styles.infoRow}>
            <MapPin size={18} color="#f97316" />
            <Text style={styles.infoText}>{order.delivery_address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={18} color="#f97316" />
            <Text style={styles.infoText}>
              Thời gian giao: {order.delivery_time} phút
            </Text>
          </View>
        </View>

        {/* Driver Info */}
        {order.delivery_assignment?.driver && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin tài xế</Text>
            <View style={styles.driverCard}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>
                  {order.delivery_assignment.driver.name?.charAt(0) || "D"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.driverName}>
                  {order.delivery_assignment.driver.name}
                </Text>
                <Text style={styles.driverVehicle}>
                  {order.delivery_assignment.driver.vehicle_number}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() =>
                  Alert.alert(
                    "Gọi tài xế",
                    order.delivery_assignment?.driver?.phone || ""
                  )
                }
              >
                <Phone size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(order.subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(order.delivery_fee)}
            </Text>
          </View>
          {order.discount !== 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá</Text>
              <Text style={[styles.summaryValue, { color: "#16a34a" }]}>
                {formatCurrency(order.discount)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
          <View style={styles.paymentMethodRow}>
            <Text style={styles.paymentMethodLabel}>
              Phương thức thanh toán:
            </Text>
            <Text style={styles.paymentMethodValue}>
              {order.payment_method === "ewallet"
                ? "Ví điện tử"
                : order.payment_method === "cash"
                ? "Tiền mặt"
                : "Thẻ"}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          {order.status === "Delivered" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                onNavigate("rating", {
                  orderId: order.id,
                  restaurantId: order.restaurant?.name,
                })
              }
            >
              <Star size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Đánh giá đơn hàng</Text>
            </TouchableOpacity>
          )}

          {(order.status === "Preparing" || order.status === "On the way") && (
            <TouchableOpacity
              style={[styles.actionButton, styles.trackButton]}
              onPress={() => onNavigate("track-order", { orderId: order.id })}
            >
              <Truck size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Theo dõi đơn hàng</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  textMuted: { color: "#6b7280", marginTop: 8 },
  errorText: { color: "#ef4444", fontSize: 16, marginBottom: 16 },
  primaryButton: {
    backgroundColor: "#f97316",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  header: {
    backgroundColor: "#06b6d4",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  orderNumber: { fontSize: 12, color: "#e0f2fe", marginTop: 2 },

  content: { padding: 16, paddingBottom: 120 },

  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  statusLabel: { fontSize: 12, color: "#6b7280" },
  statusValue: { fontSize: 16, fontWeight: "700" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  timeText: { fontSize: 12, color: "#6b7280" },

  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  itemImageText: { fontSize: 24 },
  itemName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  itemQty: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "700", color: "#f97316" },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 20,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoText: { flex: 1, fontSize: 14, color: "#374151" },

  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
  },
  driverAvatarText: { fontSize: 20, fontWeight: "700", color: "#fff" },
  driverName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  driverRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  driverRatingText: { fontSize: 13, color: "#6b7280" },
  driverVehicle: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: { fontSize: 14, color: "#6b7280" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#111827" },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#f97316" },
  paymentMethodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  paymentMethodLabel: { fontSize: 13, color: "#6b7280" },
  paymentMethodValue: { fontSize: 13, fontWeight: "600", color: "#111827" },

  actionContainer: { gap: 12 },
  actionButton: {
    backgroundColor: "#f97316",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  trackButton: { backgroundColor: "#06b6d4" },
  actionButtonText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
