import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react-native";
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Header Title */}
        <Text style={styles.headerTitle}>Tài xế</Text>

        {/* Call Timer */}
        <Text style={styles.timer}>{formatTime(callTime)}</Text>

        {/* Driver Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <View style={styles.avatarIcon}>
              <View style={styles.personIcon}>
                <View style={styles.personHead} />
                <View style={styles.personBody} />
              </View>
            </View>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          {/* Speaker Button */}
          <TouchableOpacity
            onPress={() => setIsSpeaker(!isSpeaker)}
            style={styles.controlButton}
          >
            <View style={styles.controlIcon}>
              {isSpeaker ? (
                <Volume2 size={24} color="#4B5563" />
              ) : (
                <VolumeX size={24} color="#4B5563" />
              )}
            </View>
            <Text style={styles.controlLabel}>Loa ngoài</Text>
          </TouchableOpacity>

          {/* Mute Button */}
          <TouchableOpacity
            onPress={() => setIsMuted(!isMuted)}
            style={styles.controlButton}
          >
            <View style={styles.controlIcon}>
              {isMuted ? (
                <MicOff size={24} color="#4B5563" />
              ) : (
                <Mic size={24} color="#4B5563" />
              )}
            </View>
            <Text style={styles.controlLabel}>Tắt tiếng</Text>
          </TouchableOpacity>
        </View>

        {/* End Call Button */}
        <TouchableOpacity
          onPress={() => onNavigate("orderTracking")}
          style={styles.endCallButton}
        >
          <View style={styles.endCallIcon}>
            <PhoneOff size={28} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  headerTitle: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: "#111827",
    marginBottom: 12,
    textAlign: "center"
  },

  timer: {
    fontSize: 18,
    fontWeight: "400",
    color: "#6B7280",
    marginBottom: 48,
    fontFamily: "monospace",
  },

  avatarContainer: { 
    marginBottom: 80,
    alignItems: "center"
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#06B6D4",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  personIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  personHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 4,
  },
  personBody: {
    width: 40,
    height: 28,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#FFFFFF",
  },

  controls: {
    flexDirection: "row",
    gap: 60,
    marginBottom: 60,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  controlIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  controlLabel: { 
    fontSize: 14, 
    color: "#111827", 
    fontWeight: "500" 
  },

  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  endCallIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
});
