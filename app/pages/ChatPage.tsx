import { COLORS, SPACING } from "@/constants/design";
import { supabase } from "@/lib/supabase/client";
import { ChevronLeft, MapPin, Phone, Send, Video } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatPageProps {
  onNavigate: (page: string, data?: any) => void;
  conversationData?: any;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message_type: "text" | "image" | "location";
  content: string;
  image_url?: string;
  location_lat?: number;
  location_lng?: number;
  is_read: boolean;
  created_at: string;
}

export default function ChatPage({
  onNavigate,
  conversationData,
}: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Default demo data if no conversation provided
  const otherUser = conversationData || {
    id: "demo-driver",
    name: "John Cooper",
    role: "driver",
    avatar: "J",
    status: "5 mins away",
  };

  useEffect(() => {
    initializeChat();
    return () => {
      // Cleanup subscriptions
      supabase.removeAllChannels();
    };
  }, []);

  const initializeChat = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // Show demo messages if not authenticated
        loadDemoMessages();
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      // Find or create conversation
      let conversation = await findOrCreateConversation(user.id);
      if (!conversation) {
        loadDemoMessages();
        setLoading(false);
        return;
      }

      setConversationId(conversation.id);

      // Load messages
      await loadMessages(conversation.id);

      // Mark messages as read
      await markMessagesAsRead(conversation.id, user.id);

      // Subscribe to new messages
      subscribeToMessages(conversation.id);

      setLoading(false);
    } catch (error) {
      console.error("Error initializing chat:", error);
      loadDemoMessages();
      setLoading(false);
    }
  };

  const findOrCreateConversation = async (userId: string) => {
    try {
      // Try to find existing conversation
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .eq("other_user_id", otherUser.id)
        .single();

      if (existing) return existing;

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert([
          {
            user_id: userId,
            other_user_id: otherUser.id,
            other_user_name: otherUser.name,
            other_user_role: otherUser.role,
            other_user_avatar: otherUser.avatar,
            order_id: otherUser.orderId,
            last_message: "",
            status: "active",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return newConv;
    } catch (error) {
      console.error("Error finding/creating conversation:", error);
      return null;
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const loadDemoMessages = () => {
    const demoMessages: any[] = [
      {
        id: "1",
        sender_id: otherUser.id,
        content:
          "Xin chào, tôi đang trên đường đến địa điểm của bạn. Nhà hàng khá đông nên có thể giao hàng chậm 15 phút.",
        message_type: "text",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        sender_id: "current-user",
        content: "Cảm ơn bạn đã thông báo!",
        message_type: "text",
        created_at: new Date().toISOString(),
      },
    ];
    setMessages(demoMessages);
  };

  const subscribeToMessages = (convId: string) => {
    const channel = supabase
      .channel(`messages:${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();
  };

  const markMessagesAsRead = async (convId: string, userId: string) => {
    try {
      await supabase.rpc("mark_messages_as_read", {
        conv_id: convId,
        user_id: userId,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();
    setInputValue("");

    try {
      if (!currentUserId || !conversationId) {
        // Demo mode - just add to UI
        const demoMsg: any = {
          id: Date.now().toString(),
          sender_id: "current-user",
          content: messageText,
          message_type: "text",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, demoMsg]);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
        return;
      }

      // Send to database
      const { error } = await supabase.from("messages").insert([
        {
          conversation_id: conversationId,
          sender_id: currentUserId,
          receiver_id: otherUser.id,
          message_type: "text",
          content: messageText,
        },
      ]);

      if (error) throw error;

      // Message will be added via subscription
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error("Error sending message:", error);
      Alert.alert("Lỗi", "Không thể gửi tin nhắn");
      setInputValue(messageText); // Restore input
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMyMessage = (senderId: string) => {
    return senderId === currentUserId || senderId === "current-user";
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
        <View style={styles.headerRow}>
          <View style={styles.leftHeader}>
            <TouchableOpacity onPress={() => onNavigate("inbox")}>
              <ChevronLeft size={26} color="#fff" />
            </TouchableOpacity>
            <View style={styles.driverInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{otherUser.avatar}</Text>
              </View>
              <View>
                <Text style={styles.driverName}>{otherUser.name}</Text>
                <Text style={styles.driverStatus}>{otherUser.role}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rightHeader}>
            <TouchableOpacity onPress={() => onNavigate("call")}>
              <Phone size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Video size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {otherUser.orderId && (
          <View style={styles.orderInfo}>
            <Text style={styles.orderText}>Đơn hàng: {otherUser.orderId}</Text>
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageContainer}
        contentContainerStyle={{
          paddingVertical: 10,
          paddingBottom: SPACING.bottomNav,
        }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isMine = isMyMessage(msg.sender_id);
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isMine ? styles.userMessageRow : styles.driverMessageRow,
              ]}
            >
              {!isMine && (
                <View style={[styles.bubbleAvatar, styles.driverBubbleAvatar]}>
                  <Text style={styles.bubbleAvatarText}>
                    {otherUser.avatar}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  isMine ? styles.userBubble : styles.driverBubble,
                ]}
              >
                {msg.image_url && (
                  <Image
                    source={{ uri: msg.image_url }}
                    style={styles.messageImage}
                  />
                )}
                <Text
                  style={[
                    styles.messageText,
                    isMine && { color: COLORS.white },
                  ]}
                >
                  {msg.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    isMine && { color: "rgba(255,255,255,0.8)" },
                  ]}
                >
                  {formatTime(msg.created_at)}
                </Text>
              </View>

              {isMine && (
                <View style={[styles.bubbleAvatar, styles.userBubbleAvatar]}>
                  <Text style={styles.userAvatarText}>👤</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.footer}>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MapPin size={18} color={COLORS.text} />
            <Text style={styles.actionText}>Chia sẻ vị trí</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onNavigate("call")}
          >
            <Phone size={18} color={COLORS.text} />
            <Text style={styles.actionText}>Gọi điện</Text>
          </TouchableOpacity>
        </View>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: COLORS.primary,
    padding: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  rightHeader: { flexDirection: "row", gap: 10 },
  driverInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700" },
  driverName: { color: "#fff", fontWeight: "700" },
  driverStatus: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  orderInfo: { marginTop: 8 },
  orderText: { color: "rgba(255,255,255,0.9)", fontSize: 13 },

  messageContainer: { flex: 1, paddingHorizontal: 16 },
  messageRow: { flexDirection: "row", marginVertical: 6 },
  userMessageRow: { justifyContent: "flex-end" },
  driverMessageRow: { justifyContent: "flex-start" },

  messageBubble: { maxWidth: "75%", padding: 10, borderRadius: 16 },
  driverBubble: {
    backgroundColor: COLORS.extraLightGray,
    borderTopLeftRadius: 0,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 0,
  },
  messageText: { color: COLORS.text, fontSize: 14 },
  messageTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  messageImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 6,
  },

  bubbleAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  driverBubbleAvatar: { backgroundColor: COLORS.accent },
  userBubbleAvatar: { backgroundColor: COLORS.lightGray },
  bubbleAvatarText: { color: COLORS.white, fontWeight: "700" },
  userAvatarText: { color: COLORS.text },

  footer: { 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border, 
    padding: 10,
    paddingBottom: SPACING.bottomNav,
    backgroundColor: COLORS.white,
  },
  quickActions: { flexDirection: "row", gap: 8, marginBottom: 10 },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.extraLightGray,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  actionText: { color: COLORS.text, fontSize: 13, fontWeight: "500" },

  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    flex: 1,
    backgroundColor: COLORS.extraLightGray,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
