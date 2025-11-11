import { generateOTP, sendOTPEmail } from "@/lib/emailService";
import { supabase } from "@/lib/supabase/client";
import { ForgotPasswordPageProps } from "@/types/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast, { ToastType } from "@/components/Toast";

type Step = "email" | "verify";

interface ValidationErrors {
  email?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ForgotPasswordPage({
  onNavigate,
}: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  // 📧 Bước 1: Gửi OTP về email
  const handleSendOTP = async () => {
    // Clear previous errors
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: "Vui lòng nhập email" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: "Email không hợp lệ" });
      return;
    }

    setLoading(true);
    try {
      // Bước 1: Kiểm tra email có tồn tại không
      const { error: supabaseOtpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (supabaseOtpError) {
        console.error("Supabase OTP error:", supabaseOtpError);
        setErrors({ email: "Email không tồn tại trong hệ thống" });
        setToastMessage("Email không tồn tại trong hệ thống");
        setToastType("error");
        setShowToast(true);
        return;
      }

      // Bước 2: Tạo mã OTP 6 số
      const generatedOTP = generateOTP();
      console.log("🔐 Generated OTP:", generatedOTP);

      // Bước 3: Lưu OTP vào database
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 phút
      const { error: insertError } = await supabase
        .from("password_reset_tokens")
        .insert({
          email: email.trim().toLowerCase(),
          otp_code: generatedOTP,
          expires_at: expiresAt,
        });

      if (insertError) {
        console.error("Insert OTP error:", insertError);
        setToastMessage("Không thể lưu mã OTP");
        setToastType("error");
        setShowToast(true);
        return;
      }

      // Bước 4: Gửi OTP qua EmailJS
      const emailSent = await sendOTPEmail(email.trim(), generatedOTP);

      if (!emailSent) {
        setToastMessage("Không thể gửi email. Vui lòng kiểm tra cấu hình EmailJS.");
        setToastType("error");
        setShowToast(true);
        return;
      }

      setStep("verify");
      setToastMessage("Mã OTP 6 số đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.");
      setToastType("success");
      setShowToast(true);
    } catch (error: any) {
      console.error("Send OTP error:", error);
      setToastMessage(error.message || "Không thể gửi mã OTP");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Bước 2: Xác thực OTP và đổi mật khẩu
  const handleVerifyAndReset = async () => {
    // Clear previous errors
    setErrors({});
    const newErrors: ValidationErrors = {};

    // Validate OTP
    if (!otp.trim()) {
      newErrors.otp = "Vui lòng nhập mã OTP";
    } else if (otp.length !== 6) {
      newErrors.otp = "Mã OTP phải có 6 số";
    } else if (!/^\d+$/.test(otp)) {
      newErrors.otp = "Mã OTP chỉ chứa số";
    }

    // Validate password
    if (!newPassword.trim()) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (!/(?=.*[a-zA-Z])/.test(newPassword)) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 1 chữ cái";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 Calling RPC function with:", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      // Gọi RPC function để verify OTP và reset password
      const { data, error } = await supabase.rpc("reset_password_with_otp", {
        user_email: email.trim().toLowerCase(),
        otp_code_input: otp.trim(),
        new_password: newPassword,
      });

      console.log("📊 RPC Response:", { data, error });

      if (error) {
        console.error("❌ RPC error:", error);
        setToastMessage(`Không thể đổi mật khẩu: ${error.message}`);
        setToastType("error");
        setShowToast(true);
        return;
      }

      console.log("✅ RPC data:", data);

      // Check result from function
      if (!data || data.success === false) {
        console.log("❌ Failed:", data?.error);
        const errorMsg = data?.error || "Mã OTP không đúng hoặc đã hết hạn";
        setErrors({ otp: errorMsg });
        setToastMessage(errorMsg);
        setToastType("error");
        setShowToast(true);
        return;
      }

      // Thành công!
      console.log("🎉 Success! Showing toast...");
      setToastMessage("Mật khẩu đã được đổi thành công! 🎉 Bạn có thể đăng nhập bằng mật khẩu mới.");
      setToastType("success");
      setShowToast(true);

      // Navigate sau 3s để người dùng thấy thông báo
      setTimeout(() => {
        console.log("Navigating to login...");
        setStep("email");
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
        onNavigate("login");
      }, 3000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      setToastMessage(error.message || "Không thể đổi mật khẩu");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1615719413546-198b25453f85?auto=format&fit=crop&w=1200&q=80",
      }}
      resizeMode="cover"
      style={styles.background}
    >
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        duration={3000}
        onHide={() => setShowToast(false)}
      />
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {step === "email" ? "Quên Mật Khẩu" : "Xác Thực OTP"}
              </Text>
              <Text style={styles.subtitle}>
                {step === "email"
                  ? "Nhập email để nhận mã OTP xác thực"
                  : "Nhập mã OTP và mật khẩu mới"}
              </Text>
            </View>

            {/* Form */}
            {step === "email" ? (
              // 📧 Bước 1: Nhập email
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) {
                        setErrors({ ...errors, email: undefined });
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSendOTP}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Gửi Mã OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              // ✅ Bước 2: Nhập OTP và mật khẩu mới
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mã OTP (6 số)</Text>
                  <TextInput
                    style={[styles.input, errors.otp && styles.inputError]}
                    placeholder="123456"
                    placeholderTextColor="#9ca3af"
                    value={otp}
                    onChangeText={(text) => {
                      setOtp(text);
                      if (errors.otp) {
                        setErrors({ ...errors, otp: undefined });
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />
                  {errors.otp && (
                    <Text style={styles.errorText}>{errors.otp}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu mới</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.newPassword && styles.inputError,
                    ]}
                    placeholder="Ít nhất 6 ký tự, có chữ cái"
                    placeholderTextColor="#9ca3af"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errors.newPassword) {
                        setErrors({ ...errors, newPassword: undefined });
                      }
                    }}
                    secureTextEntry
                    editable={!loading}
                  />
                  {errors.newPassword && (
                    <Text style={styles.errorText}>{errors.newPassword}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Xác nhận mật khẩu</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.confirmPassword && styles.inputError,
                    ]}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor="#9ca3af"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: undefined });
                      }
                    }}
                    secureTextEntry
                    editable={!loading}
                  />
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleVerifyAndReset}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Đổi Mật Khẩu</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    setStep("email");
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setErrors({});
                  }}
                  disabled={loading}
                >
                  <Text style={styles.linkText}>← Gửi lại mã OTP</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => onNavigate("login")}
              disabled={loading}
            >
              <Text style={styles.linkText}>← Quay lại đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
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
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#06b6d4",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  linkButton: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#06b6d4",
    fontSize: 14,
    fontWeight: "600",
  },
});
