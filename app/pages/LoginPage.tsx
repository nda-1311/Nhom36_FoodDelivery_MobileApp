import { supabase } from "@/lib/supabase/client";
import { LoginPageProps } from "@/types/auth";
import { validateLoginForm } from "@/utils/validation";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const validate = (): boolean => {
    const { valid, errors } = validateLoginForm({ email, password });
    setEmailError(errors.email || "");
    setPasswordError(errors.password || "");
    return valid;
  };

  const handleLogin = async () => {
    setLoginError("");
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let message = error.message;
      if (message.includes("Invalid login credentials"))
        message = "Sai email hoặc mật khẩu. Vui lòng thử lại!";
      else if (message.includes("Email not confirmed"))
        message = "Tài khoản chưa được xác minh qua email.";

      setLoginError(message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onNavigate("home");
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1615719413546-198b25453f85?auto=format&fit=crop&w=1200&q=80",
      }}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Logo */}
        <View style={styles.logoBox}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🍱</Text>
          </View>
          <Text style={styles.title}>FoodDelivery</Text>
          <Text style={styles.subtitle}>Giao nhanh tận nơi</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            placeholder="Nhập email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, emailError && styles.inputError]}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={[styles.input, passwordError && styles.inputError]}
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          {loginError ? (
            <Text style={[styles.errorText, styles.centerText]}>
              ❌ {loginError}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>Đang đăng nhập...</Text>
              </View>
            ) : (
              <Text style={styles.loginText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.registerText}>
            Chưa có tài khoản?{" "}
            <Text
              style={styles.registerLink}
              onPress={() =>
                Alert.alert("Thông báo", "Tính năng đăng ký đang phát triển!")
              }
            >
              Đăng ký ngay
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
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
  loginButton: {
    backgroundColor: "#06b6d4",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  loginText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  registerText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 16,
    fontSize: 13,
  },
  registerLink: { color: "#06b6d4", fontWeight: "600" },
});
