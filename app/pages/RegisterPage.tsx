import { authService } from "@/lib/api";
import { RegisterPageProps } from "@/types/auth";
import { validateRegisterForm } from "@/utils/validation";
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

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [registerError, setRegisterError] = useState("");

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  const validate = (): boolean => {
    const { valid, errors } = validateRegisterForm({
      email,
      password,
      confirmPassword,
      name,
      phone,
    });

    setEmailError(errors.email || "");
    setPasswordError(errors.password || "");
    setConfirmPasswordError(errors.confirmPassword || "");
    setNameError(errors.name || "");
    setPhoneError(errors.phone || "");

    return valid;
  };

  const handleRegister = async () => {
    setRegisterError("");
    if (!validate()) return;

    setLoading(true);

    try {
      // Đăng ký tài khoản với Backend API
      const response = await authService.register({
        email,
        password,
        fullName: name,
        phoneNumber: phone,
      });

      if (!response.success) {
        let message = response.error || "Đăng ký thất bại";
        if (message.includes("already exists") || message.includes("duplicate"))
          message = "Email này đã được đăng ký. Vui lòng sử dụng email khác!";
        else if (message.includes("password"))
          message = "Mật khẩu phải có ít nhất 6 ký tự!";

        setRegisterError(message);
        setLoading(false);
        return;
      }

      setLoading(false);

      // Hiển thị thông báo thành công
      setToastMessage("Đăng ký thành công! 🎉");
      setToastType("success");
      setShowToast(true);

      // Dispatch auth changed event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:changed"));
      }

      // Chuyển sang trang home sau 2 giây
      setTimeout(() => {
        onNavigate("home");
      }, 2000);
    } catch (error) {
      console.error("Register error:", error);
      setRegisterError("Có lỗi xảy ra. Vui lòng thử lại!");
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1615719413546-198b25453f85?auto=format&fit=crop&w=1200&q=80",
      }}
      resizeMode="cover"
      style={styles.container}
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
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoBox}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🍱</Text>
            </View>
            <Text style={styles.title}>Đăng ký tài khoản</Text>
            <Text style={styles.subtitle}>Tạo tài khoản mới để tiếp tục</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Họ tên */}
            <TextInput
              placeholder="Họ và tên"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              style={[styles.input, nameError && styles.inputError]}
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}

            {/* Email */}
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, emailError && styles.inputError]}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            {/* Số điện thoại */}
            <TextInput
              placeholder="Số điện thoại"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={[styles.input, phoneError && styles.inputError]}
            />
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}

            {/* Mật khẩu */}
            <TextInput
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={[styles.input, passwordError && styles.inputError]}
            />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            {/* Xác nhận mật khẩu */}
            <TextInput
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={[styles.input, confirmPasswordError && styles.inputError]}
            />
            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}

            {/* Register Error */}
            {registerError ? (
              <Text style={[styles.errorText, styles.centerText]}>
                ❌ {registerError}
              </Text>
            ) : null}

            {/* Nút đăng ký */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.buttonText}>Đang đăng ký...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            {/* Link đăng nhập */}
            <Text style={styles.loginText}>
              Đã có tài khoản?{" "}
              <Text
                style={styles.loginLink}
                onPress={() => onNavigate("login")}
              >
                Đăng nhập ngay
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoBox: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoIcon: { fontSize: 32, color: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: { color: "#e5e7eb", fontSize: 13 },

  form: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 20,
    borderRadius: 20,
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  inputError: { borderColor: "#ef4444" },
  errorText: { color: "#ef4444", fontSize: 12, marginBottom: 4 },
  centerText: { textAlign: "center", marginTop: 4 },
  registerButton: {
    backgroundColor: "#06b6d4",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  loginText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 16,
    fontSize: 13,
  },
  loginLink: { color: "#06b6d4", fontWeight: "600" },
});
