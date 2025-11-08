import { supabase } from "@/lib/supabase/client";
import {
  ChevronLeft,
  Edit2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AccountPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function AccountPage({ onNavigate }: AccountPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const userInfo = {
    name: "John Doe",
    phone: "+1 (555) 123-4567",
    email: "john.doe@example.com",
    address: "201 Katlian No.21 Street, San Francisco, CA",
    rating: 4.8,
    totalOrders: 42,
    memberSince: "January 2023",
    avatar: "JD",
  };

  // ✅ Đăng xuất khỏi Supabase
  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Lỗi đăng xuất:", error.message);
        Alert.alert("Đăng xuất thất bại", error.message);
      } else {
        console.log("✅ Đã đăng xuất Supabase thành công");
        onNavigate("login");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng xuất!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      {/* Profile */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInfo.avatar}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{userInfo.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={16} color="#facc15" fill="#facc15" />
            <Text style={styles.ratingValue}>{userInfo.rating}</Text>
            <Text style={styles.orderCount}>
              ({userInfo.totalOrders} orders)
            </Text>
          </View>
          <Text style={styles.memberSince}>
            Member since {userInfo.memberSince}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Edit2 size={20} color="#06b6d4" />
        </TouchableOpacity>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>👤</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{userInfo.name}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Phone size={18} color="#06b6d4" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{userInfo.phone}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Mail size={18} color="#06b6d4" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{userInfo.email}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <MapPin size={18} color="#06b6d4" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Delivery Address</Text>
            <Text style={styles.infoValue}>{userInfo.address}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: "#ecfeff" }]}>
            <Text style={[styles.statValue, { color: "#06b6d4" }]}>
              {userInfo.totalOrders}
            </Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "#fef9c3" }]}>
            <Text style={[styles.statValue, { color: "#f59e0b" }]}>
              {userInfo.rating}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "#dcfce7" }]}>
            <Text style={[styles.statValue, { color: "#16a34a" }]}>5</Text>
            <Text style={styles.statLabel}>Vouchers</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        {[
          { label: "📜 View Order History", page: "history" },
          { label: "🔔 Notifications" },
          { label: "💳 Payment Methods" },
          { label: "🔒 Privacy & Security" },
          { label: "❓ Help & Support" },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.settingItem}
            onPress={() => item.page && onNavigate(item.page)}
          >
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <LogOut size={20} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#06b6d4",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: { marginRight: 12 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 24 },
  name: { fontSize: 18, fontWeight: "700" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingValue: { fontWeight: "600", marginLeft: 4 },
  orderCount: { fontSize: 12, color: "#6b7280", marginLeft: 4 },
  memberSince: { fontSize: 12, color: "#9ca3af", marginTop: 2 },

  section: { marginHorizontal: 16, marginTop: 10 },
  sectionTitle: { fontWeight: "700", fontSize: 16, marginBottom: 10 },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  infoText: { marginLeft: 10 },
  infoLabel: { fontSize: 12, color: "#6b7280" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#111827" },

  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },

  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  settingLabel: { fontSize: 14, fontWeight: "600" },
  settingArrow: { color: "#9ca3af" },

  logoutSection: { padding: 16 },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: { color: "#fff", fontWeight: "700", marginLeft: 6 },
});
