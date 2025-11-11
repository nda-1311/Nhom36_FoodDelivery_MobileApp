import { supabase } from "@/lib/supabase/client";
import { Check, ChevronLeft, Eye, EyeOff, Lock } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast, { ToastType } from "@/components/Toast";

interface ChangePasswordPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function ChangePasswordPage({
  onNavigate,
}: ChangePasswordPageProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("error");

  const passwordRequirements = [
    { text: "Ít nhất 8 ký tự", met: newPassword.length >= 8 },
    { text: "Chứa chữ hoa", met: /[A-Z]/.test(newPassword) },
    { text: "Chứa chữ thường", met: /[a-z]/.test(newPassword) },
    { text: "Chứa số", met: /[0-9]/.test(newPassword) },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      setToastMessage("Vui lòng nhập mật khẩu hiện tại");
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (!newPassword.trim()) {
      setToastMessage("Vui lòng nhập mật khẩu mới");
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (!isPasswordValid) {
      setToastMessage("Mật khẩu mới không đáp ứng các yêu cầu");
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setToastMessage("Mật khẩu xác nhận không khớp");
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (currentPassword === newPassword) {
      setToastMessage("Mật khẩu mới phải khác mật khẩu hiện tại");
      setToastType("error");
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      // Verify current password by attempting to sign in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      // Try to sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setToastMessage("Mật khẩu hiện tại không đúng");
        setToastType("error");
        setShowToast(true);
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setToastMessage("Mật khẩu đã được thay đổi thành công! 🎉");
      setToastType("success");
      setShowToast(true);
      
      setTimeout(() => {
        onNavigate("profile");
      }, 2000);
    } catch (error: any) {
      console.error("Error changing password:", error);
      let message = "Không thể đổi mật khẩu. Vui lòng thử lại!";

      if (error.message?.includes("New password should be different")) {
        message = "Mật khẩu mới phải khác mật khẩu cũ";
      } else if (error.message?.includes("Password should be at least")) {
        message = "Mật khẩu phải có ít nhất 6 ký tự";
      }

      setToastMessage(message);
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.successCircle}>
          <Check size={40} color="#16a34a" />
        </View>
        <Text style={styles.successTitle}>Thành công!</Text>
        <Text style={styles.successText}>
          Mật khẩu của bạn đã được thay đổi
        </Text>
        <Text style={styles.redirectText}>Đang quay lại trang cá nhân...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        duration={3000}
        onHide={() => setShowToast(false)}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("profile")}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Lock size={24} color="#06b6d4" />
            <Text style={styles.infoText}>
              Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh và không chia
              sẻ với người khác.
            </Text>
          </View>

          {/* Current Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Mật khẩu hiện tại</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? (
                  <Eye size={20} color="#6b7280" />
                ) : (
                  <EyeOff size={20} color="#6b7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Mật khẩu mới</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showNew}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNew(!showNew)}
              >
                {showNew ? (
                  <Eye size={20} color="#6b7280" />
                ) : (
                  <EyeOff size={20} color="#6b7280" />
                )}
              </TouchableOpacity>
            </View>

            {/* Password Requirements */}
            {newPassword.length > 0 && (
              <View style={styles.requirementsContainer}>
                {passwordRequirements.map((req, idx) => (
                  <View key={idx} style={styles.requirementRow}>
                    {req.met ? (
                      <Check size={16} color="#16a34a" />
                    ) : (
                      <View style={styles.unmetDot} />
                    )}
                    <Text
                      style={[
                        styles.requirementText,
                        req.met && styles.requirementTextMet,
                      ]}
                    >
                      {req.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Xác nhận mật khẩu mới</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? (
                  <Eye size={20} color="#6b7280" />
                ) : (
                  <EyeOff size={20} color="#6b7280" />
                )}
              </TouchableOpacity>
            </View>

            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <Text style={styles.errorText}>Mật khẩu không khớp</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isPasswordValid || loading) && styles.submitButtonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={!isPasswordValid || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Đổi mật khẩu</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },

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
    textAlign: "center",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  infoCard: {
    backgroundColor: "#ecfeff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 13, color: "#0e7490", lineHeight: 18 },

  fieldContainer: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  requirementsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    gap: 8,
  },
  requirementRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  unmetDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#d1d5db",
  },
  requirementText: { fontSize: 13, color: "#6b7280" },
  requirementTextMet: { color: "#16a34a", fontWeight: "500" },

  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },

  submitButton: {
    backgroundColor: "#06b6d4",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  successText: { fontSize: 14, color: "#6b7280", marginBottom: 8 },
  redirectText: { fontSize: 12, color: "#9ca3af" },
});
