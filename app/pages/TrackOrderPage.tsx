import { orderService } from "@/lib/api/orders";
import {
  CheckCircle,
  ChevronLeft,
  Clock,
  MapPin,
  MessageSquare,
  Package,
  Phone,
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

interface TrackOrderPageProps {
  onNavigate: (page: string, data?: any) => void;
  data?: { orderId: string };
}

interface OrderData {
  id: string;
  status: string;
  delivery_address: string;
  delivery_time: number;
  total: number;
  created_at: string;
  restaurant?: {
    name: string;
    cuisine: string;
  };
  delivery_assignment?: {
    driver: {
      id: string;
      name: string;
      phone: string;
      vehicle_number: string;
      status: string;
    };
  };
}

export default function TrackOrderPage({
  onNavigate,
  data,
}: TrackOrderPageProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!data?.orderId) {
      Alert.alert("Lỗi", "Không tìm thấy mã đơn hàng");
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await orderService.trackOrder(data.orderId);

        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to track order");
        }

        const orderData = response.data;
        setOrder(orderData as OrderData);
        setLoading(false);

        // Set initial progress based on status
        switch (orderData.status) {
          case "Pending":
            setProgress(10);
            break;
          case "Confirmed":
            setProgress(25);
            break;
          case "Preparing":
            setProgress(50);
            break;
          case "On the way":
            setProgress(75);
            break;
          case "Delivered":
            setProgress(100);
            break;
          default:
            setProgress(0);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng");
        setLoading(false);
      }
    };

    fetchOrder();

    // Poll for order updates every 5 seconds (replacing realtime subscription)
    const pollInterval = setInterval(async () => {
      try {
        const response = await orderService.trackOrder(data.orderId);
        if (response.success && response.data) {
          const updated = response.data;
          setOrder(updated as OrderData);

          // Update progress
          switch (updated.status) {
            case "Pending":
              setProgress(10);
              break;
            case "Confirmed":
              setProgress(25);
              break;
            case "Preparing":
              setProgress(50);
              break;
            case "On the way":
              setProgress(75);
              break;
            case "Delivered":
              setProgress(100);
              clearInterval(pollInterval); // Stop polling when delivered
              break;
          }
        }
      } catch (error) {
        console.error("Error polling order:", error);
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [data?.orderId]);

  const getStatusSteps = () => {
    const steps = [
      {
        name: "Đơn hàng\nđã xác nhận",
        icon: "✓",
        status: "Confirmed",
        completed: progress >= 25,
      },
      {
        name: "Đang tìm\ntài xế",
        icon: "🔍",
        status: "Looking",
        completed: progress >= 35,
      },
      {
        name: "Đang chuẩn bị\nmón ăn",
        icon: "👨‍🍳",
        status: "Preparing",
        completed: progress >= 50,
      },
      {
        name: "Đang giao\nhàng",
        icon: "🚗",
        status: "On the way",
        completed: progress >= 75,
      },
      {
        name: "Đã giao\nthành công",
        icon: "📍",
        status: "Delivered",
        completed: progress >= 100,
      },
    ];
    return steps;
  };

  const getStatusMessage = () => {
    if (!order) return "Đang tải...";

    switch (order.status) {
      case "Pending":
        return "Đang xử lý đơn hàng của bạn...";
      case "Confirmed":
        return "Đơn hàng đã được xác nhận, đang tìm tài xế...";
      case "Preparing":
        return "Nhà hàng đang chuẩn bị món ăn của bạn";
      case "On the way":
        return "Tài xế đang trên đường giao hàng";
      case "Delivered":
        return "Đơn hàng đã được giao thành công!";
      default:
        return "Đang cập nhật trạng thái...";
    }
  };

  const driver = order?.delivery_assignment?.driver;

  const handleCallDriver = () => {
    if (driver?.phone) {
      Alert.alert(
        "Gọi cho tài xế",
        `Bạn có muốn gọi cho ${driver.name}?\n${driver.phone}`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Gọi",
            onPress: () => {
              if (driver) {
                onNavigate("call", { phone: driver.phone });
              }
            },
          },
        ]
      );
    } else {
      Alert.alert("Thông báo", "Chưa có thông tin tài xế");
    }
  };

  const handleChatDriver = () => {
    if (order && driver?.id) {
      onNavigate("chat-driver", { orderId: order.id, driverId: driver.id });
    } else {
      Alert.alert("Thông báo", "Chưa có tài xế được phân công");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.textMuted}>Đang tải thông tin đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity
          onPress={() => onNavigate("history")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Quay lại lịch sử</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const steps = getStatusSteps();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("history")}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
          <Text style={styles.orderNumber}>#{order.id.slice(0, 8)}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
          flexGrow: 1,
        }}
      >
        {/* Status Icon */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <View style={styles.statusIcon}>
            {progress === 100 ? (
              <CheckCircle size={40} color="#fff" />
            ) : (
              <Package size={40} color="#fff" />
            )}
          </View>
          <Text style={styles.statusText}>{getStatusMessage()}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stepsRow}
          >
            {steps.map((step, idx) => (
              <View key={idx} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step.completed && styles.stepCircleDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepIcon,
                      step.completed && styles.stepIconDone,
                    ]}
                  >
                    {step.icon}
                  </Text>
                </View>
                <Text style={styles.stepLabel}>{step.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Estimated Delivery */}
        {progress < 100 && (
          <View style={styles.estimateBox}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Clock size={20} color="#06b6d4" />
              <Text style={styles.estimateTitle}>
                Thời gian giao hàng dự kiến
              </Text>
            </View>
            <Text style={styles.estimateText}>
              {order.delivery_time || 20} phút
            </Text>
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.infoCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MapPin size={20} color="#f97316" />
            <Text style={styles.infoTitle}>Địa chỉ giao hàng</Text>
          </View>
          <Text style={styles.infoText}>{order.delivery_address}</Text>
        </View>

        {/* Driver Info */}
        {driver && progress > 25 && (
          <View style={styles.driverCard}>
            <Text style={styles.driverTitle}>Thông tin tài xế</Text>
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.avatarText}>
                  {driver.name?.charAt(0) || "D"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.driverRating}>⭐ 4.8</Text>
                <Text style={styles.vehicleText}>{driver.vehicle_number}</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallDriver}
              >
                <Phone size={16} color="#0891b2" />
                <Text style={styles.callButtonText}>Gọi điện</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chatButton}
                onPress={handleChatDriver}
              >
                <MessageSquare size={16} color="#fff" />
                <Text style={styles.chatButtonText}>Nhắn tin</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order Details Button */}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => onNavigate("order-detail", { orderId: order.id })}
        >
          <Text style={styles.detailsButtonText}>Xem chi tiết đơn hàng</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },

  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#06b6d4",
    borderRadius: 4,
  },
  progressText: { fontSize: 14, fontWeight: "600", color: "#06b6d4" },

  stepsContainer: { marginVertical: 20 },
  stepsRow: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 8,
  },
  stepItem: { alignItems: "center", width: 80 },
  stepCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepCircleDone: { backgroundColor: "#06b6d4" },
  stepIcon: { fontSize: 24 },
  stepIconDone: { color: "#fff" },
  stepLabel: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 14,
  },

  estimateBox: {
    backgroundColor: "#ecfeff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
  },
  estimateTitle: { fontSize: 14, fontWeight: "600", color: "#0e7490" },
  estimateText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#06b6d4",
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  infoText: { fontSize: 14, color: "#6b7280", marginTop: 4 },

  driverCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  driverTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#fff" },
  driverName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  driverRating: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  vehicleText: { fontSize: 12, color: "#9ca3af", marginTop: 2 },

  buttonRow: { flexDirection: "row", gap: 12 },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#e0f2fe",
    paddingVertical: 10,
    borderRadius: 8,
  },
  callButtonText: { fontSize: 14, fontWeight: "600", color: "#0891b2" },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    paddingVertical: 10,
    borderRadius: 8,
  },
  chatButtonText: { fontSize: 14, fontWeight: "600", color: "#fff" },

  detailsButton: {
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  detailsButtonText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
