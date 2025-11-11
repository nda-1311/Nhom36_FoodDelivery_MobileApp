import { supabase } from "@/lib/supabase/client";
import {
  ChevronLeft,
  Edit2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfilePageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editedProfile, setEditedProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          Alert.alert("Lỗi", "Không thể lấy thông tin người dùng");
          setLoading(false);
          return;
        }

        // Fetch user profile from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (userError) {
          console.error("Error fetching user profile:", userError);
        }

        const profileData: UserProfile = {
          id: user.id,
          name: userData?.name || user.user_metadata?.name || "User",
          email: user.email || "",
          phone: userData?.phone || user.user_metadata?.phone || "",
          address: userData?.address || "",
          avatar: userData?.avatar || user.user_metadata?.avatar,
        };

        setProfile(profileData);
        setEditedProfile(profileData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading profile:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin cá nhân");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!editedProfile.name.trim()) {
      Alert.alert("Lỗi", "Tên không được để trống");
      return;
    }

    if (!editedProfile.phone.trim()) {
      Alert.alert("Lỗi", "Số điện thoại không được để trống");
      return;
    }

    setSaving(true);

    try {
      // First, update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: editedProfile.name,
          phone: editedProfile.phone,
          address: editedProfile.address,
        },
      });

      if (authError) {
        console.error("Auth update error:", authError);
        throw authError;
      }

      // Then try to update users table (if RLS allows)
      const { error: tableError } = await supabase
        .from("users")
        .update({
          name: editedProfile.name,
          phone: editedProfile.phone,
          address: editedProfile.address,
        })
        .eq("id", profile.id);

      // If table update fails, try to insert (ignore error if RLS blocks)
      if (tableError) {
        console.log("Table update failed, trying insert:", tableError.message);
        await supabase.from("users").insert([
          {
            id: profile.id,
            email: profile.email,
            name: editedProfile.name,
            phone: editedProfile.phone,
            address: editedProfile.address,
          },
        ]);
        // Don't throw error here - auth metadata is already saved
      }

      setProfile(editedProfile);
      setIsEditing(false);

      // Show success and navigate back
      Alert.alert("Thành công", "Thông tin đã được cập nhật!", [
        {
          text: "OK",
          onPress: () => {
            // Pass refresh flag to trigger data reload
            onNavigate("account", { refresh: true });
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.textMuted}>Đang tải thông tin...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("account")}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Edit2 size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 20 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
        </View>

        {/* Profile Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

          {/* Name */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldIcon}>
              <User size={20} color="#06b6d4" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Họ và tên</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile.name}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, name: text })
                  }
                  placeholder="Nhập họ tên"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.name}</Text>
              )}
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldIcon}>
              <Mail size={20} color="#06b6d4" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldValue}>{profile.email}</Text>
              <Text style={styles.fieldNote}>Email không thể thay đổi</Text>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldIcon}>
              <Phone size={20} color="#06b6d4" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Số điện thoại</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile.phone}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, phone: text })
                  }
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.phone || "Chưa cập nhật"}
                </Text>
              )}
            </View>
          </View>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldIcon}>
              <MapPin size={20} color="#06b6d4" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Địa chỉ giao hàng</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.textareaInput]}
                  value={editedProfile.address}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, address: text })
                  }
                  placeholder="Nhập địa chỉ"
                  multiline
                  numberOfLines={2}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.address || "Chưa cập nhật"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Edit/Save Buttons */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={saving}
            >
              <X size={18} color="#ef4444" />
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Save size={18} color="#fff" />
                  <Text style={styles.saveButtonText}>Lưu</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Change Password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bảo mật</Text>
          <TouchableOpacity
            style={styles.passwordButton}
            onPress={() => onNavigate("change-password")}
          >
            <Lock size={20} color="#06b6d4" />
            <Text style={styles.passwordButtonText}>Đổi mật khẩu</Text>
            <ChevronLeft
              size={20}
              color="#9ca3af"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                Alert.alert("Lỗi", "Không thể đăng xuất");
              } else {
                onNavigate("login");
              }
            } catch {
              Alert.alert("Lỗi", "Có lỗi xảy ra");
            }
          }}
        >
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    marginLeft: 12,
  },

  content: { padding: 16, paddingBottom: 120 },

  avatarContainer: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "700", color: "#fff" },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: { fontSize: 14, color: "#6b7280" },

  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  fieldContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  fieldIcon: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  fieldValue: { fontSize: 15, color: "#111827", fontWeight: "500" },
  fieldNote: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
    fontStyle: "italic",
  },

  input: {
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textareaInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  cancelButtonText: { fontSize: 14, fontWeight: "600", color: "#ef4444" },
  saveButton: {
    backgroundColor: "#06b6d4",
  },
  saveButtonText: { fontSize: 14, fontWeight: "600", color: "#fff" },

  passwordButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  passwordButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },

  logoutButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
