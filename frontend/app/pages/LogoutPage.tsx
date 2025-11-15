import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { authService } from "@/lib/api";
import { LogOut } from "lucide-react-native";

interface LogoutPageProps {
  onNavigate: (pageName: string, data?: any) => void;
}

export default function LogoutPage({ onNavigate }: LogoutPageProps) {
  async function handleLogout() {
    try {
      await authService.logout();

      // Dispatch auth changed event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:changed"));
      }

      Alert.alert("Thành công", "✅ Đăng xuất thành công!");
      onNavigate("login");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Lỗi", "❌ Lỗi khi đăng xuất. Vui lòng thử lại!");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <LogOut size={60} color="#ef4444" style={{ marginBottom: 10 }} />
        <Text style={styles.title}>Bạn có chắc chắn muốn đăng xuất?</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => onNavigate("home")}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fde68a",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#f9fafb",
  },
  cancelText: { color: "#4b5563", fontWeight: "600" },
  logoutButton: { backgroundColor: "#ef4444" },
  logoutText: { color: "#fff", fontWeight: "700" },
});
