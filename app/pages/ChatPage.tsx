import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { ChevronLeft, Phone, Video, Send, MapPin } from "lucide-react-native";

interface ChatPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function ChatPage({ onNavigate }: ChatPageProps) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "driver",
      text: "Hi, I'm on my way to your location. The restaurant is quite busy, so delivery may be 15 mins late.",
      time: "12:03",
      avatar: "J",
    },
    {
      id: 2,
      sender: "user",
      text: "Thank you for letting me know!",
      time: "12:04",
      avatar: "👤",
    },
    {
      id: 3,
      sender: "driver",
      text: "Could you please ask the restaurant to include cutlery? I just need forks and spoons.",
      time: "12:05",
      image: "https://placehold.co/200x200?text=Cutlery",
      avatar: "J",
    },
    {
      id: 4,
      sender: "user",
      text: "Yes, let me tell the restaurant right away.",
      time: "12:05",
      avatar: "👤",
    },
    {
      id: 5,
      sender: "driver",
      text: "Great! I'll be there in about 10 minutes.",
      time: "12:06",
      avatar: "J",
    },
  ]);

  const [inputValue, setInputValue] = useState("");

  const sendMessage = () => {
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "user",
          text: inputValue,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar: "👤",
        },
      ]);
      setInputValue("");
    }
  };

  const driver = {
    name: "John Cooper",
    rating: 4.8,
    reviews: 342,
    status: "5 mins away",
    avatar: "J",
  };

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
                <Text style={styles.avatarText}>{driver.avatar}</Text>
              </View>
              <View>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.driverStatus}>{driver.status}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rightHeader}>
            <TouchableOpacity>
              <Phone size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Video size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.driverRating}>
          <Text style={styles.driverRatingText}>⭐ {driver.rating}</Text>
          <Text style={styles.driverReviewText}>
            ({driver.reviews} reviews)
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messageContainer}
        contentContainerStyle={{ paddingVertical: 10 }}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.sender === "user"
                ? styles.userMessageRow
                : styles.driverMessageRow,
            ]}
          >
            {msg.sender === "driver" && (
              <View style={[styles.bubbleAvatar, styles.driverBubbleAvatar]}>
                <Text style={styles.bubbleAvatarText}>{msg.avatar}</Text>
              </View>
            )}

            <View
              style={[
                styles.messageBubble,
                msg.sender === "user" ? styles.userBubble : styles.driverBubble,
              ]}
            >
              {msg.image && (
                <Image
                  source={{ uri: msg.image }}
                  style={styles.messageImage}
                />
              )}
              <Text style={styles.messageText}>{msg.text}</Text>
              <Text
                style={[
                  styles.messageTime,
                  msg.sender === "user" && { color: "#e0f2fe" },
                ]}
              >
                {msg.time}
              </Text>
            </View>

            {msg.sender === "user" && (
              <View style={[styles.bubbleAvatar, styles.userBubbleAvatar]}>
                <Text style={styles.userAvatarText}>{msg.avatar}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.footer}>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MapPin size={18} color="#111827" />
            <Text style={styles.actionText}>Share Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Phone size={18} color="#111827" />
            <Text style={styles.actionText}>Call Driver</Text>
          </TouchableOpacity>
        </View>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
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
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    backgroundColor: "#06b6d4",
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
  driverRating: { flexDirection: "row", gap: 4, marginTop: 4 },
  driverRatingText: { color: "#fff" },
  driverReviewText: { color: "rgba(255,255,255,0.8)" },

  messageContainer: { flex: 1, paddingHorizontal: 16 },
  messageRow: { flexDirection: "row", marginVertical: 6 },
  userMessageRow: { justifyContent: "flex-end" },
  driverMessageRow: { justifyContent: "flex-start" },

  messageBubble: { maxWidth: "75%", padding: 10, borderRadius: 16 },
  driverBubble: {
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 0,
  },
  userBubble: {
    backgroundColor: "#06b6d4",
    borderTopRightRadius: 0,
  },
  messageText: { color: "#111827", fontSize: 14 },
  messageTime: {
    fontSize: 11,
    color: "#6b7280",
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
  driverBubbleAvatar: { backgroundColor: "#06b6d4" },
  userBubbleAvatar: { backgroundColor: "#e5e7eb" },
  bubbleAvatarText: { color: "#fff", fontWeight: "700" },
  userAvatarText: { color: "#111827" },

  footer: { borderTopWidth: 1, borderTopColor: "#e5e7eb", padding: 10 },
  quickActions: { flexDirection: "row", gap: 8, marginBottom: 10 },
  actionButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  actionText: { color: "#111827", fontSize: 13, fontWeight: "500" },

  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: "#06b6d4",
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
