import { supabase } from "@/lib/supabase/client";
import { ChevronLeft, Phone, Send } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatDriverPageProps {
  onNavigate: (page: string, data?: any) => void;
  data?: {
    orderId: string;
    driverId: string;
  };
}

interface Message {
  id: string;
  order_id?: string;
  sender_id: string;
  receiver_id: string;
  sender_type: "user" | "driver";
  message: string;
  image_url?: string;
  is_read: boolean;
  created_at: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle_number: string;
  status: string;
}

export default function ChatDriverPage({
  onNavigate,
  data,
}: ChatDriverPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.orderId || !data?.driverId) {
      Alert.alert("Lỗi", "Thông tin đơn hàng không hợp lệ");
      onNavigate("history");
      return;
    }

    // Get current user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };

    getUser();

    // Fetch driver info
    const fetchDriver = async () => {
      const { data: driverData, error } = await supabase
        .from("drivers")
        .select("id, name, phone, vehicle_number, status")
        .eq("id", data.driverId)
        .single();

      if (error) {
        console.error("Error fetching driver:", error);
      } else {
        setDriver(driverData);
      }
    };

    // Fetch messages
    const fetchMessages = async () => {
      const { data: messageData, error } = await supabase
        .from("messages")
        .select("*")
        .eq("order_id", data.orderId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        const formatted = (messageData || []).map((msg) => ({
          ...msg,
          sender_type: msg.sender_id === userId ? "user" : "driver",
        }));
        setMessages(formatted as Message[]);
      }

      setLoading(false);
    };

    fetchDriver();
    fetchMessages();

    // Realtime subscription for new messages
    const channel = supabase
      .channel(`messages:${data.orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${data.orderId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          const formatted: Message = {
            ...newMessage,
            sender_type: newMessage.sender_id === userId ? "user" : "driver",
          };
          setMessages((prev) => [...prev, formatted]);

          // Auto scroll to bottom
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [data?.orderId, data?.driverId]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !data?.orderId || sending || !driver) return;

    setSending(true);

    const newMessage = {
      order_id: data.orderId,
      sender_id: userId || "anonymous",
      receiver_id: driver.id,
      message: inputValue.trim(),
      is_read: false,
    };

    const { error } = await supabase.from("messages").insert([newMessage]);

    if (error) {
      console.error("Error sending message:", error);
      Alert.alert("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại!");
    } else {
      setInputValue("");
    }

    setSending(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.textMuted}>Đang tải tin nhắn...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.leftHeader}>
            <TouchableOpacity
              onPress={() =>
                onNavigate("track-order", { orderId: data?.orderId })
              }
            >
              <ChevronLeft size={26} color="#fff" />
            </TouchableOpacity>
            <View style={styles.driverInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {driver?.name?.charAt(0) || "D"}
                </Text>
              </View>
              <View>
                <Text style={styles.driverName}>
                  {driver?.name || "Tài xế"}
                </Text>
                <Text style={styles.driverStatus}>Đang giao hàng</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Gọi cho tài xế",
                driver?.phone || "Không có số điện thoại"
              )
            }
          >
            <Phone size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {driver && (
          <View style={styles.driverRating}>
            <Text style={styles.driverRatingText}>{driver.vehicle_number}</Text>
          </View>
        )}
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageContainer}
          contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 12 }}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Chưa có tin nhắn nào. Bắt đầu trò chuyện với tài xế!
              </Text>
            </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.sender_type === "user"
                    ? styles.userMessageRow
                    : styles.driverMessageRow,
                ]}
              >
                {msg.sender_type === "driver" && (
                  <View
                    style={[styles.bubbleAvatar, styles.driverBubbleAvatar]}
                  >
                    <Text style={styles.bubbleAvatarText}>
                      {driver?.name?.charAt(0) || "D"}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    msg.sender_type === "user"
                      ? styles.userBubble
                      : styles.driverBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.sender_type === "user" && styles.userMessageText,
                    ]}
                  >
                    {msg.message}
                  </Text>
                  <Text
                    style={[
                      styles.timeText,
                      msg.sender_type === "user" && styles.userTimeText,
                    ]}
                  >
                    {formatTime(msg.created_at)}
                  </Text>
                </View>

                {msg.sender_type === "user" && (
                  <View style={[styles.bubbleAvatar, styles.userBubbleAvatar]}>
                    <Text style={styles.bubbleAvatarText}>👤</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#9ca3af"
            value={inputValue}
            onChangeText={setInputValue}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              (!inputValue.trim() || sending) && styles.sendButtonDisabled,
            ]}
            disabled={!inputValue.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

  header: {
    backgroundColor: "#06b6d4",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftHeader: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  driverInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0891b2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  driverName: { fontSize: 16, fontWeight: "600", color: "#fff" },
  driverStatus: { fontSize: 12, color: "#e0f2fe" },
  driverRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  driverRatingText: { fontSize: 12, color: "#fff", fontWeight: "600" },

  messageContainer: { flex: 1, backgroundColor: "#fff" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: { fontSize: 14, color: "#9ca3af", textAlign: "center" },

  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  userMessageRow: { justifyContent: "flex-end" },
  driverMessageRow: { justifyContent: "flex-start" },

  bubbleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  driverBubbleAvatar: { backgroundColor: "#06b6d4", marginRight: 8 },
  userBubbleAvatar: { backgroundColor: "#f97316", marginLeft: 8 },
  bubbleAvatarText: { fontSize: 14, color: "#fff", fontWeight: "700" },

  messageBubble: {
    maxWidth: "70%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  driverBubble: {
    backgroundColor: "#e5e7eb",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#06b6d4",
    borderBottomRightRadius: 4,
  },
  messageText: { fontSize: 14, color: "#111827", lineHeight: 20 },
  userMessageText: { color: "#fff" },
  timeText: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimeText: { color: "#e0f2fe" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
});
