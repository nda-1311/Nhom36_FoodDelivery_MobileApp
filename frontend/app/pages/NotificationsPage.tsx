import { COLORS, RADIUS, SPACING } from "@/constants/design";
import { supabase } from "@/lib/supabase/client";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronLeft,
  Gift,
  Info,
  Package,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NotificationsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Notification {
  id: string;
  user_id: string;
  type: "order" | "promotion" | "system" | "info";
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export default function NotificationsPage({
  onNavigate,
}: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Show demo notifications for non-logged in users
        setNotifications(getDemoNotifications());
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // If no notifications in DB, show demo
      if (!data || data.length === 0) {
        setNotifications(getDemoNotifications());
      } else {
        setNotifications(data);
      }
    } catch (error: any) {
      console.error("Error loading notifications:", error);
      setNotifications(getDemoNotifications());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDemoNotifications = (): Notification[] => {
    return [
      {
        id: "demo-1",
        user_id: "demo",
        type: "order",
        title: "Đơn hàng đang giao",
        message: "Đơn hàng #12345 của bạn đang trên đường giao đến",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "demo-2",
        user_id: "demo",
        type: "promotion",
        title: "Giảm giá 30% hôm nay!",
        message: "Sử dụng mã SAVE30 để được giảm 30% cho đơn hàng tiếp theo",
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "demo-3",
        user_id: "demo",
        type: "order",
        title: "Đơn hàng đã giao thành công",
        message: "Đơn hàng #12344 đã được giao thành công. Cảm ơn bạn!",
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "demo-4",
        user_id: "demo",
        type: "system",
        title: "Cập nhật hệ thống",
        message: "Ứng dụng đã được cập nhật với nhiều tính năng mới",
        is_read: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "demo-5",
        user_id: "demo",
        type: "promotion",
        title: "Voucher miễn phí ship",
        message: "Bạn nhận được voucher miễn phí ship cho đơn hàng tiếp theo",
        is_read: true,
        created_at: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && notification.id.indexOf("demo") === -1) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notification.id);
      }

      // Update local state
      setNotifications(
        notifications.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );

      // Navigate if there's a link
      if (notification.link) {
        onNavigate(notification.link);
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id)
          .eq("is_read", false);
      }

      // Update local state
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package size={24} color={COLORS.primary} />;
      case "promotion":
        return <Gift size={24} color={COLORS.accent} />;
      case "system":
        return <AlertCircle size={24} color={COLORS.info} />;
      case "info":
        return <Info size={24} color={COLORS.info} />;
      default:
        return <Bell size={24} color={COLORS.primary} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.is_read);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => onNavigate("Home")}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            style={styles.markAllButton}
            disabled={unreadCount === 0}
          >
            <CheckCircle2
              size={24}
              color={unreadCount > 0 ? COLORS.white : COLORS.primaryLight}
            />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "all" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "all" && styles.filterTabTextActive,
              ]}
            >
              Tất cả ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "unread" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("unread")}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "unread" && styles.filterTabTextActive,
              ]}
            >
              Chưa đọc ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>
              {filter === "all"
                ? "Chưa có thông báo nào"
                : "Không có thông báo chưa đọc"}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.is_read && styles.notificationUnread,
              ]}
              onPress={() => handleMarkAsRead(notification)}
            >
              <View style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  {!notification.is_read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>
                  {formatTime(notification.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
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
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.l,
    paddingHorizontal: SPACING.l,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.l,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  markAllButton: {
    padding: SPACING.xs,
  },
  filterTabs: {
    flexDirection: "row",
    gap: SPACING.s,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.m,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  filterTabActive: {
    backgroundColor: COLORS.white,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  filterTabTextActive: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SPACING.bottomNav,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: SPACING.l,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.m,
  },
  notificationUnread: {
    backgroundColor: COLORS.primaryLight + "10",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
