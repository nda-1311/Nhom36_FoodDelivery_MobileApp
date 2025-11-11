import { SPACING } from "@/constants/design";
import { Mic, MicOff, Phone, Volume2, VolumeX } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CallPageProps {
  onNavigate?: (page: string, data?: any) => void; // ✅ làm optional
}

export default function CallPage({ onNavigate = () => {} }: CallPageProps) {
  // ✅ thêm fallback
  const [callTime, setCallTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCallTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const driver = {
    name: "John Cooper",
    avatar: "J",
    rating: 4.8,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Cuộc gọi với tài xế</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Driver Info */}
        <View style={styles.driverInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{driver.avatar}</Text>
          </View>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverRating}>⭐ {driver.rating}</Text>
        </View>

        {/* Call Timer */}
        <Text style={styles.timer}>{formatTime(callTime)}</Text>

        {/* Control Buttons */}
        <View style={styles.controls}>
          {/* Speaker */}
          <TouchableOpacity
            onPress={() => setIsSpeaker(!isSpeaker)}
            style={[
              styles.controlButton,
              isSpeaker ? styles.activeButton : styles.inactiveButton,
            ]}
          >
            {isSpeaker ? (
              <Volume2 size={28} color={isSpeaker ? "#fff" : "#111"} />
            ) : (
              <VolumeX size={28} color={isSpeaker ? "#fff" : "#111"} />
            )}
          </TouchableOpacity>

          {/* Mute */}
          <TouchableOpacity
            onPress={() => setIsMuted(!isMuted)}
            style={[
              styles.controlButton,
              isMuted ? styles.activeButton : styles.inactiveButton,
            ]}
          >
            {isMuted ? (
              <MicOff size={28} color={isMuted ? "#fff" : "#111"} />
            ) : (
              <Mic size={28} color={isMuted ? "#fff" : "#111"} />
            )}
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={styles.status}>
          <Text style={styles.statusText}>
            {isMuted ? "Micro đang tắt" : "Micro đang bật"}
          </Text>
          <Text style={styles.statusText}>
            {isSpeaker ? "Loa ngoài đang bật" : "Loa ngoài đang tắt"}
          </Text>
        </View>
      </View>

      {/* Footer / End Call */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => onNavigate("chat")}
          style={styles.endCallButton}
        >
          <Phone size={26} color="#fff" />
          <Text style={styles.endCallText}>Kết thúc cuộc gọi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    backgroundColor: "#06b6d4",
    paddingVertical: 16,
    alignItems: "center",
  },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "700" },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  driverInfo: { alignItems: "center", marginBottom: 40 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: { fontSize: 36, fontWeight: "700", color: "#fff" },
  driverName: { fontSize: 22, fontWeight: "700", color: "#111827" },
  driverRating: { color: "#6b7280", marginTop: 4 },

  timer: {
    fontSize: 42,
    fontWeight: "700",
    color: "#06b6d4",
    marginBottom: 40,
    fontFamily: "monospace",
  },

  controls: {
    flexDirection: "row",
    gap: 30,
    marginBottom: 40,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#06b6d4",
    elevation: 4,
  },
  inactiveButton: {
    backgroundColor: "#e5e7eb",
  },

  status: { alignItems: "center", marginBottom: 40 },
  statusText: { fontSize: 14, color: "#6b7280", marginVertical: 2 },

  footer: { 
    padding: 20,
    paddingBottom: SPACING.bottomNav,
  },
  endCallButton: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    borderRadius: 40,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  endCallText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 6,
  },
});
