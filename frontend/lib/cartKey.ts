"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "@/lib/api";

export async function getCartKey(): Promise<string> {
  // Nếu user đã đăng nhập, dùng user ID từ token
  try {
    const token = await apiClient.getAccessToken();
    if (token) {
      // Token exists, user is logged in, return "user" to indicate user cart
      return "user";
    }
  } catch (error) {
    console.error("Error getting token:", error);
  }

  // Nếu chưa đăng nhập, tạo key riêng cho thiết bị
  const KEY = "cart_device_key";
  let key = await AsyncStorage.getItem(KEY);
  if (!key) {
    key = crypto.randomUUID();
    await AsyncStorage.setItem(KEY, key);
  }
  return key;
}
