/**
 * OrderTrackingPage.tsx
 *
 * Enhanced real-time order tracking with:
 * - Interactive map with driver location
 * - Auto-animated status timeline
 * - Product images display
 * - Beautiful gradient UI
 * - Real-time updates every 15s
 */

import { CachedImage } from "@/components/CachedImage";
import { COLORS, RADIUS, SHADOWS } from "@/constants/design";
import { useToast } from "@/hooks/use-toast";
import { useCancelOrder, useOrder } from "@/hooks/useOrders";
import { getFoodImage } from "@/utils/foodImageMap";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface OrderTrackingOptimizedProps {
  orderId: string;
  onNavigate: (screen: string, params?: any) => void;
  onBack: () => void;
}

interface OrderStatus {
  key: string;
  label: string;
  icon: string;
  color: string;
}

const ORDER_STATUSES: OrderStatus[] = [
  {
    key: "PENDING",
    label: "Chờ xác nhận",
    icon: "time-outline",
    color: "#FFA726",
  },
  {
    key: "CONFIRMED",
    label: "Đã xác nhận",
    icon: "checkmark-circle-outline",
    color: "#42A5F5",
  },
  {
    key: "PREPARING",
    label: "Đang chuẩn bị",
    icon: "restaurant-outline",
    color: "#AB47BC",
  },
  {
    key: "READY_FOR_PICKUP",
    label: "Sẵn sàng giao",
    icon: "cube-outline",
    color: "#26C6DA",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Đang giao",
    icon: "bicycle-outline",
    color: "#FF7043",
  },
  {
    key: "DELIVERED",
    label: "Đã giao",
    icon: "checkmark-done-circle",
    color: "#66BB6A",
  },
];

const OrderTrackingOptimized: React.FC<OrderTrackingOptimizedProps> = ({
  orderId,
  onNavigate,
  onBack,
}) => {
  console.log("📍 OrderTrackingPage orderId:", orderId);

  // Clean orderId - remove @ symbol if present
  const cleanOrderId = orderId?.replace("@", "") || "";
  console.log("📍 Clean orderId:", cleanOrderId);

  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ✅ Call hooks first (before any conditional returns)
  const {
    data: order,
    isLoading,
    refetch,
    isRefetching,
  } = useOrder(cleanOrderId);
  // const { data: tracking } = useOrderTracking(orderId || "");
  const cancelOrder = useCancelOrder();
  const { toast } = useToast();

  // Get current status index
  const currentStatusIndex = useMemo(() => {
    if (!order) return 0;
    const index = ORDER_STATUSES.findIndex((s) => s.key === order.status);
    return index >= 0 ? index : 0;
  }, [order]);

  // Animate progress and pulse effect
  useEffect(() => {
    // Progress animation
    Animated.timing(progressAnim, {
      toValue: currentStatusIndex / (ORDER_STATUSES.length - 1),
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Pulse animation for current status
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [currentStatusIndex, progressAnim, pulseAnim]);

  // Handle cancel order
  const handleCancelOrder = () => {
    console.log("🔔 handleCancelOrder called!");
    setShowCancelModal(true);
  };

  // Handle confirm cancel with reason
  const handleConfirmCancel = (reason: string) => {
    console.log("🚫 Cancelling order:", cleanOrderId, "Reason:", reason);
    setShowCancelModal(false);

    cancelOrder.mutate(
      { orderId: cleanOrderId, reason },
      {
        onSuccess: (data) => {
          console.log("✅ Cancel order success:", data);
          // Show success modal
          setShowSuccessModal(true);

          // Navigate to home after 2 seconds
          setTimeout(() => {
            setShowSuccessModal(false);
            onNavigate("home");
          }, 2000);
        },
        onError: (error: any) => {
          console.error("❌ Cancel order error:", error);
          toast({
            title: "Lỗi hủy đơn",
            description: error?.message || "Không thể hủy đơn hàng lúc này",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Handle close cancel modal
  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  // List of common cancellation reasons
  const cancelReasons = [
    "Đặt nhầm món ăn",
    "Thay đổi ý định không muốn đặt nữa",
    "Thời gian giao hàng quá lâu",
    "Tìm được ưu đãi tốt hơn ở chỗ khác",
    "Đặt trùng đơn hàng",
    "Lý do khác",
  ];

  // ✅ Now check if orderId is missing (after all hooks)
  if (!cleanOrderId) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#FF6B6B", "#FF8E53"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lỗi</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.centerContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={COLORS.error}
          />
          <Text style={styles.errorText}>Không tìm thấy mã đơn hàng!</Text>
          <TouchableOpacity
            onPress={() => onNavigate("home")}
            style={styles.errorButton}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.errorButtonGradient}
            >
              <Text style={styles.errorButtonText}>Quay lại trang chủ</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={COLORS.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.centerContainer}>
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
          >
            <Ionicons
              name="restaurant-outline"
              size={64}
              color={COLORS.primary}
            />
          </Animated.View>
          <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={COLORS.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.centerContainer}>
          <Ionicons
            name="receipt-outline"
            size={64}
            color={COLORS.textSecondary}
          />
          <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        </View>
      </View>
    );
  }

  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);
  const currentStatus = ORDER_STATUSES[currentStatusIndex];

  console.log("📊 Order status:", order.status);
  console.log("📊 Can cancel:", canCancel);
  console.log("📊 Cancel order pending:", cancelOrder.isPending);

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={COLORS.gradientPrimary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Đơn hàng</Text>
          <Text style={styles.headerSubtitle}>
            #{order.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Map Container - Using Static Map */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mapGradient}
            >
              <Ionicons name="location" size={48} color="#fff" />
              <Text style={styles.mapText}>Bản đồ theo dõi</Text>
              <Text style={styles.mapSubtext}>Đang cập nhật vị trí...</Text>
            </LinearGradient>
          </View>
          <View style={styles.estimatedTimeContainer}>
            <LinearGradient
              colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)"]}
              style={styles.estimatedTime}
            >
              <Ionicons name="time-outline" size={20} color="#fff" />
              <Text style={styles.estimatedTimeText}>Dự kiến: 25-30 phút</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Current Status Card */}
        <View style={styles.currentStatusCard}>
          <LinearGradient
            colors={[currentStatus.color + "20", currentStatus.color + "10"]}
            style={styles.statusCardGradient}
          >
            <Animated.View
              style={[
                styles.statusIconContainer,
                {
                  backgroundColor: currentStatus.color,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Ionicons
                name={currentStatus.icon as any}
                size={32}
                color="#fff"
              />
            </Animated.View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>Trạng thái hiện tại</Text>
              <Text
                style={[styles.statusValue, { color: currentStatus.color }]}
              >
                {currentStatus.label}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Progress Timeline */}
        <View style={styles.timelineContainer}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="list-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Tiến trình đơn hàng</Text>
          </View>

          <View style={styles.timeline}>
            {ORDER_STATUSES.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isLast = index === ORDER_STATUSES.length - 1;

              return (
                <View key={status.key} style={styles.timelineItem}>
                  {/* Connecting Line */}
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineActive,
                      ]}
                    />
                  )}

                  {/* Status Icon */}
                  <Animated.View
                    style={[
                      styles.timelineIconWrapper,
                      isCompleted && { backgroundColor: status.color },
                      isCurrent && {
                        transform: [{ scale: pulseAnim }],
                        ...SHADOWS.medium,
                      },
                    ]}
                  >
                    <Ionicons
                      name={status.icon as any}
                      size={24}
                      color={isCompleted ? "#fff" : COLORS.border}
                    />
                  </Animated.View>

                  {/* Status Details */}
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineTitle,
                        isCompleted && styles.timelineTitleActive,
                        isCurrent && styles.timelineTitleCurrent,
                      ]}
                    >
                      {status.label}
                    </Text>
                    {isCompleted && (
                      <Text style={styles.timelineTime}>
                        {new Date().toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="restaurant" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Nhà hàng</Text>
          </View>
          <View style={styles.restaurantCard}>
            <CachedImage
              source={
                order.restaurant.imageUrl
                  ? { uri: order.restaurant.imageUrl }
                  : require("@/assets/public/restaurant-food-variety.png")
              }
              style={styles.restaurantImage}
            />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
              <View style={styles.restaurantRating}>
                <Ionicons name="star" size={16} color="#FFB800" />
                <Text style={styles.ratingText}>4.5</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.restaurantButton}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items with Images */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="fast-food" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          </View>

          {order.items.map((item: any) => (
            <View key={item.id} style={styles.foodItem}>
              <View style={styles.foodItemLeft}>
                <CachedImage
                  source={getFoodImage(item.menuItem.name, item.menuItem.image)}
                  style={styles.foodImage}
                />
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName} numberOfLines={2}>
                    {item.menuItem.name}
                  </Text>
                  <Text style={styles.foodPrice}>
                    {item.menuItem.price.toLocaleString("vi-VN")}đ
                  </Text>
                </View>
              </View>
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>x{item.quantity}</Text>
              </View>
            </View>
          ))}

          {/* Order Summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>
                {(order.total - 15000 + 10000).toLocaleString("vi-VN")}đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí giao hàng</Text>
              <Text style={styles.summaryValue}>15.000đ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: "#10b981" }]}>
                Giảm giá
              </Text>
              <Text style={[styles.summaryValue, { color: "#10b981" }]}>
                -10.000đ
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>
                {order.total.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>
        </View>

        {/* Cancel Button */}
        {canCancel && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                console.log("🔴 Cancel button pressed!");
                handleCancelOrder();
              }}
              disabled={cancelOrder.isPending}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.cancelBtnText}>
                {cancelOrder.isPending ? "Đang hủy..." : "Hủy đơn hàng"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            </View>
            <Text style={styles.modalTitle}>Hủy đơn thành công!</Text>
            <Text style={styles.modalMessage}>
              Đơn hàng của bạn đã được hủy thành công.
              {"\n"}Các món ăn đã được hoàn trả về kho.
            </Text>
            <View style={styles.modalLoadingContainer}>
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <Ionicons
                  name="home-outline"
                  size={24}
                  color={COLORS.primary}
                />
              </Animated.View>
              <Text style={styles.modalRedirectText}>
                Đang chuyển về trang chủ...
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Reason Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContent}>
            <Text style={styles.cancelModalTitle}>Chọn lý do hủy đơn</Text>
            <Text style={styles.cancelModalSubtitle}>
              Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng
            </Text>

            <ScrollView style={styles.reasonsList}>
              {cancelReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.reasonItem}
                  onPress={() => handleConfirmCancel(reason)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#EF4444"
                  />
                  <Text style={styles.reasonText}>{reason}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelModalCloseBtn}
              onPress={handleCloseCancelModal}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelModalCloseBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "600",
    textAlign: "center",
  },
  errorButton: {
    marginTop: 24,
    borderRadius: RADIUS.l,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  errorButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Map
  mapContainer: {
    height: 200,
    position: "relative",
  },
  mapPlaceholder: {
    width: "100%",
    height: "100%",
  },
  mapGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  mapSubtext: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4,
  },
  estimatedTimeContainer: {
    position: "absolute",
    top: 16,
    left: 16,
  },
  estimatedTime: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.m,
  },
  estimatedTimeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  // Current Status Card
  currentStatusCard: {
    margin: 16,
    borderRadius: RADIUS.l,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  statusCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.l,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "700",
  },

  // Timeline
  timelineContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: RADIUS.l,
    padding: 20,
    ...SHADOWS.small,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 8,
  },
  timeline: {
    position: "relative",
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 21,
    top: 44,
    bottom: -20,
    width: 2,
    backgroundColor: COLORS.border,
  },
  timelineLineActive: {
    backgroundColor: COLORS.primary,
  },
  timelineIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    zIndex: 10,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  timelineTitleActive: {
    color: COLORS.text,
    fontWeight: "600",
  },
  timelineTitleCurrent: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  timelineTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Section
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: RADIUS.l,
    padding: 16,
    ...SHADOWS.small,
  },

  // Restaurant Card
  restaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.m,
    backgroundColor: COLORS.border,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  restaurantRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 4,
  },
  restaurantButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.m,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  // Food Items
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  foodItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.m,
    backgroundColor: COLORS.border,
  },
  foodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  foodName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  foodPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "700",
  },
  quantityBadge: {
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.m,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },

  // Summary
  summaryBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 19,
    fontWeight: "700",
    color: COLORS.primary,
  },

  // Cancel Button
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: RADIUS.m,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
    marginLeft: 8,
  },

  bottomPadding: {
    height: 20,
  },

  // Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.l,
    padding: 32,
    alignItems: "center",
    width: "85%",
    maxWidth: 400,
    ...SHADOWS.large,
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  modalLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalRedirectText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Cancel Reason Modal
  cancelModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 24,
    maxHeight: "80%",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  cancelModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  cancelModalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  reasonsList: {
    maxHeight: 400,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.m,
    marginBottom: 12,
    gap: 12,
  },
  reasonText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
  },
  cancelModalCloseBtn: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.m,
    alignItems: "center",
  },
  cancelModalCloseBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
});

export default OrderTrackingOptimized;
