import { COLORS, SPACING } from "@/constants/design";
import { supabase } from "@/lib/supabase/client";
import { ChevronLeft, MessageCircle, Phone } from "lucide-react-native";
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

interface InboxPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Conversation {
  id: string;
  user_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_role: string;
  other_user_avatar: string;
  order_id: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function InboxPage({ onNavigate }: InboxPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
    subscribeToConversations();

    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const loadConversations = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Show demo data if not authenticated
        loadDemoConversations();
        return;
      }

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setConversations(data);
      } else {
        loadDemoConversations();
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      loadDemoConversations();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadDemoConversations = () => {
    const demoData: Conversation[] = [
      {
        id: "demo-1",
        user_id: "current-user",
        other_user_id: "driver-1",
        other_user_name: "John Cooper",
        other_user_role: "driver",
        other_user_avatar: "J",
        order_id: "ORD-2024-001",
        last_message: "Tôi đang trên đường đến! 5 phút nữa đến nơi",
        last_message_time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        unread_count: 2,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "demo-2",
        user_id: "current-user",
        other_user_id: "restaurant-1",
        other_user_name: "Bamsu Restaurant",
        other_user_role: "restaurant",
        other_user_avatar: "B",
        order_id: "ORD-2024-001",
        last_message: "Đơn hàng của bạn đang được chuẩn bị",
        last_message_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        unread_count: 0,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    setConversations(demoData);
  };

  const subscribeToConversations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      supabase
        .channel("conversations-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "conversations",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setConversations((prev) => [
                payload.new as Conversation,
                ...prev,
              ]);
            } else if (payload.eventType === "UPDATE") {
              setConversations((prev) =>
                prev
                  .map((conv) =>
                    conv.id === payload.new.id
                      ? (payload.new as Conversation)
                      : conv
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.updated_at).getTime() -
                      new Date(a.updated_at).getTime()
                  )
              );
            } else if (payload.eventType === "DELETE") {
              setConversations((prev) =>
                prev.filter((conv) => conv.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();
    } catch (error) {
      console.error("Error subscribing to conversations:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  const getRoleText = (role: string) => {
    const roleMap: { [key: string]: string } = {
      driver: "Tài xế giao hàng",
      restaurant: "Nhà hàng",
      support: "Hỗ trợ khách hàng",
      user: "Người dùng",
    };
    return roleMap[role] || role;
  };

  const getStatusColor = (role: string, unreadCount: number) => {
    if (unreadCount > 0) return "active";
    if (role === "driver") return "active";
    return "online";
  };

  const handleOpenChat = (conversation: Conversation) => {
    const chatData = {
      id: conversation.other_user_id,
      name: conversation.other_user_name,
      role: conversation.other_user_role,
      avatar: conversation.other_user_avatar,
      orderId: conversation.order_id,
    };
    onNavigate("chat", chatData);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("home")}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
      </View>

      {/* Messages List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: SPACING.bottomNav }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadConversations(true)}
            colors={[COLORS.primary]}
          />
        }
      >
        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageCircle size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
            <Text style={styles.emptySubtext}>
              Tin nhắn của bạn sẽ hiển thị ở đây
            </Text>
          </View>
        ) : (
          conversations.map((conv) => {
            const status = getStatusColor(
              conv.other_user_role,
              conv.unread_count
            );
            return (
              <TouchableOpacity
                key={conv.id}
                onPress={() => handleOpenChat(conv)}
                style={styles.messageCard}
              >
                <View style={styles.messageRow}>
                  {/* Avatar */}
                  <View style={styles.avatarWrapper}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {conv.other_user_avatar}
                      </Text>
                    </View>
                    {status === "active" && (
                      <View style={[styles.statusDot, styles.statusActive]} />
                    )}
                    {status === "online" && (
                      <View style={[styles.statusDot, styles.statusOnline]} />
                    )}
                  </View>

                  {/* Content */}
                  <View style={styles.contentWrapper}>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text
                          style={[
                            styles.name,
                            conv.unread_count > 0
                              ? styles.textNormal
                              : styles.textMuted,
                          ]}
                        >
                          {conv.other_user_name}
                        </Text>
                        <Text style={styles.role}>
                          {getRoleText(conv.other_user_role)}
                        </Text>
                      </View>
                      <Text style={styles.time}>
                        {formatTime(conv.last_message_time)}
                      </Text>
                    </View>

                    <View style={styles.lastMessageRow}>
                      <Text
                        style={[
                          styles.lastMessage,
                          conv.unread_count > 0
                            ? styles.textBold
                            : styles.textMuted,
                        ]}
                        numberOfLines={1}
                      >
                        {conv.last_message || "Chưa có tin nhắn"}
                      </Text>
                      {conv.unread_count > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>
                            {conv.unread_count}
                          </Text>
                        </View>
                      )}
                    </View>

                    {conv.order_id && (
                      <Text style={styles.orderId}>
                        Đơn hàng: {conv.order_id}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => onNavigate("call")}
                  >
                    <Phone size={12} color={COLORS.success} />
                    <Text style={styles.callText}>Gọi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => handleOpenChat(conv)}
                  >
                    <MessageCircle size={12} color={COLORS.warning} />
                    <Text style={styles.chatText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  scroll: { flex: 1 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  messageCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  messageRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarWrapper: { position: "relative" },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  statusActive: { backgroundColor: COLORS.success },
  statusOnline: { backgroundColor: COLORS.info },
  contentWrapper: { flex: 1, minWidth: 0 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: { fontSize: 14, fontWeight: "600" },
  role: { fontSize: 12, color: COLORS.textSecondary },
  time: { fontSize: 12, color: COLORS.textLight },
  lastMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  lastMessage: { fontSize: 13, flex: 1 },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },
  orderId: { fontSize: 12, color: COLORS.secondary, marginTop: 2 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: -16,
  },
  actions: { flexDirection: "row", gap: 8, marginTop: 10, marginLeft: 60 },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.warning + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  callText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "600",
  },
  chatText: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: "600",
  },
  textMuted: { color: COLORS.textLight },
  textNormal: { color: COLORS.text },
  textBold: { fontWeight: "700", color: COLORS.text },
});
