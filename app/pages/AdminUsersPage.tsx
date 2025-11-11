import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/design";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase/client";
import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  ChevronLeft,
  Mail,
  Search,
  Shield,
  Trash2,
  UserCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AdminUsersPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at: string;
  last_sign_in_at?: string;
  is_admin?: boolean;
}

export default function AdminUsersPage({ onNavigate }: AdminUsersPageProps) {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert("Truy cập bị từ chối", "Bạn không có quyền truy cập");
      onNavigate("admin-dashboard");
      return;
    }

    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, adminLoading, onNavigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Get all users from auth.users (via RPC or a custom view)
      // Since we can't directly query auth.users, we'll use the users table
      const { data: usersData, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Check admin status for each user
      const usersWithAdmin = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: adminData } = await supabase
            .from("admin_config")
            .select("role")
            .eq("user_id", user.id)
            .single();

          return {
            ...user,
            is_admin: !!adminData,
          };
        })
      );

      setUsers(usersWithAdmin);
      setFilteredUsers(usersWithAdmin);
    } catch (error) {
      console.error("Error loading users:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.email?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.phone?.includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleDeleteUser = async (userId: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa người dùng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            // This requires admin RPC function to delete from auth.users
            // For now, we can only soft delete from users table
            const { error } = await supabase
              .from("users")
              .delete()
              .eq("id", userId);

            if (error) throw error;

            Alert.alert("Thành công", "Đã xóa người dùng");
            loadUsers();
          } catch (error) {
            console.error("Error deleting user:", error);
            Alert.alert("Lỗi", "Không thể xóa người dùng");
          }
        },
      },
    ]);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <UserCircle size={40} color={COLORS.primary} />
          </View>
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.name || "Chưa có tên"}</Text>
              {item.is_admin && (
                <View style={styles.adminBadge}>
                  <Shield size={12} color="#fff" />
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
            <View style={styles.infoRow}>
              <Mail size={14} color={COLORS.textSecondary} />
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            {item.phone && (
              <Text style={styles.userPhone}>📱 {item.phone}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.userFooter}>
        <View style={styles.dateInfo}>
          <Calendar size={14} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>
            Tham gia: {new Date(item.created_at).toLocaleDateString("vi-VN")}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(item.id)}
          >
            <Trash2 size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (adminLoading || loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => onNavigate("admin-dashboard")}
            style={styles.backButton}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý người dùng</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo email, tên, số điện thoại..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{filteredUsers.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {filteredUsers.filter((u) => u.is_admin).length}
          </Text>
          <Text style={styles.statLabel}>Admin</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {
              filteredUsers.filter(
                (u) =>
                  new Date(u.created_at) >
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>Mới (7 ngày)</Text>
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <UserCircle size={80} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.m,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    paddingTop: SPACING.l,
    paddingBottom: SPACING.l,
    paddingHorizontal: SPACING.l,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.m,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: RADIUS.m,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    gap: SPACING.s,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: SPACING.l,
    ...SHADOWS.small,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContainer: {
    padding: SPACING.l,
    gap: SPACING.m,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.m,
    padding: SPACING.l,
    ...SHADOWS.small,
  },
  userHeader: {
    marginBottom: SPACING.m,
  },
  userInfo: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
    marginBottom: SPACING.xs,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.s,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  userPhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  userFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.s,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    marginTop: SPACING.l,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
