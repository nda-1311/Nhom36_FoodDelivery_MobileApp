import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/design";
import { supabase } from "@/lib/supabase/client";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  ChevronLeft,
  Edit2,
  Lock,
  LogOut,
  Mail,
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
  });
  const [editedProfile, setEditedProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
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
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => onNavigate("account")}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        {!isEditing ? (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
          >
            <Edit2 size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
        </View>

        {/* Profile Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

          {/* Name */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldIconCircle}>
              <User size={20} color={COLORS.primary} />
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
                  placeholderTextColor={COLORS.textLight}
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.name}</Text>
              )}
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldIconCircle}>
              <Mail size={20} color={COLORS.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldValue}>{profile.email}</Text>
              <Text style={styles.fieldNote}>Email không thể thay đổi</Text>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldIconCircle}>
              <Phone size={20} color={COLORS.primary} />
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
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.phone || "Chưa cập nhật"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Edit/Save Buttons */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={saving}
            >
              <X size={18} color="#ef4444" />
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButtonWrapper}
              onPress={handleSave}
              disabled={saving}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Save size={18} color="#ffffff" />
                    <Text style={styles.saveButtonText}>Lưu</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Change Password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bảo mật</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate("change-password")}
          >
            <View style={styles.actionIconCircle}>
              <Lock size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Đổi mật khẩu</Text>
            <ChevronLeft
              size={20}
              color={COLORS.textSecondary}
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
          <LogOut size={20} color="#ffffff" />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    marginLeft: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Content
  content: {
    padding: 16,
    paddingBottom: SPACING.bottomNav,
  },

  // Avatar Section
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.medium,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#ffffff",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.surface,
    ...SHADOWS.small,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Section
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },

  // Field Card
  fieldCard: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fieldIconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },
  fieldValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "600",
  },
  fieldNote: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 4,
    fontStyle: "italic",
  },

  // Input
  input: {
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.m,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: "500",
  },
  textareaInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  // Buttons
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.l,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ef4444",
  },
  saveButtonWrapper: {
    flex: 1,
    borderRadius: RADIUS.l,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Action Card
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: RADIUS.l,
    ...SHADOWS.medium,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
