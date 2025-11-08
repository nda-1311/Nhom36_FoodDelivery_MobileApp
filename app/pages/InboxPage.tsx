import { ChevronLeft, MessageCircle, Phone } from "lucide-react-native";
import React from "react";
import {
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

export default function InboxPage({ onNavigate }: InboxPageProps) {
  const messages = [
    {
      id: 1,
      name: "John Cooper",
      role: "Food Delivery Driver",
      lastMessage: "I'm on my way! 5 mins away",
      time: "2 mins ago",
      avatar: "J",
      unread: true,
      status: "active",
      orderId: "ORD-2024-001",
    },
    {
      id: 2,
      name: "Bamsu Restaurant",
      role: "Restaurant",
      lastMessage: "Your order is being prepared",
      time: "15 mins ago",
      avatar: "B",
      unread: false,
      status: "online",
      orderId: "ORD-2024-001",
    },
    {
      id: 3,
      name: "Support Team",
      role: "Customer Support",
      lastMessage: "How can we help you today?",
      time: "1 hour ago",
      avatar: "S",
      unread: false,
      status: "online",
      orderId: null,
    },
    {
      id: 4,
      name: "Sarah Johnson",
      role: "Previous Driver",
      lastMessage: "Thanks for the 5-star rating!",
      time: "Yesterday",
      avatar: "S",
      unread: false,
      status: "offline",
      orderId: "ORD-2024-000",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("home")}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inbox</Text>
      </View>

      {/* Messages List */}
      <ScrollView style={styles.scroll}>
        {messages.map((msg) => (
          <TouchableOpacity
            key={msg.id}
            onPress={() => onNavigate("chat", msg)}
            style={styles.messageCard}
          >
            <View style={styles.messageRow}>
              {/* Avatar */}
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{msg.avatar}</Text>
                </View>
                {msg.status === "active" && (
                  <View style={[styles.statusDot, styles.statusActive]} />
                )}
                {msg.status === "online" && (
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
                        msg.unread ? styles.textNormal : styles.textMuted,
                      ]}
                    >
                      {msg.name}
                    </Text>
                    <Text style={styles.role}>{msg.role}</Text>
                  </View>
                  <Text style={styles.time}>{msg.time}</Text>
                </View>

                <Text
                  style={[
                    styles.lastMessage,
                    msg.unread ? styles.textBold : styles.textMuted,
                  ]}
                  numberOfLines={1}
                >
                  {msg.lastMessage}
                </Text>

                {msg.orderId && (
                  <Text style={styles.orderId}>{msg.orderId}</Text>
                )}
              </View>

              {/* Unread Dot */}
              {msg.unread && <View style={styles.unreadDot} />}
            </View>

            {/* Quick Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.callButton}>
                <Phone size={12} color="#0e7490" />
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatButton}>
                <MessageCircle size={12} color="#2563eb" />
                <Text style={styles.chatText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0891b2",
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
  messageCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  messageRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarWrapper: { position: "relative" },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#06b6d4",
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
  statusActive: { backgroundColor: "#22c55e" },
  statusOnline: { backgroundColor: "#3b82f6" },
  contentWrapper: { flex: 1, minWidth: 0 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: { fontSize: 14, fontWeight: "600" },
  role: { fontSize: 12, color: "#6b7280" },
  time: { fontSize: 12, color: "#9ca3af" },
  lastMessage: { fontSize: 13, marginTop: 2 },
  orderId: { fontSize: 12, color: "#0ea5e9", marginTop: 2 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#06b6d4",
    marginTop: -16,
  },
  actions: { flexDirection: "row", gap: 8, marginTop: 10, marginLeft: 60 },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#cffafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  callText: {
    color: "#0e7490",
    fontSize: 12,
    fontWeight: "600",
  },
  chatText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
  },
  textMuted: { color: "#9ca3af" },
  textNormal: { color: "#111827" },
  textBold: { fontWeight: "700", color: "#111827" },
});
