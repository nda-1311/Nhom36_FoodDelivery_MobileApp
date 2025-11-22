/**
 * API Client Configuration
 * Central configuration for API base URL and auth token
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// API Base URL
export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

// Token storage keys
const ACCESS_TOKEN_KEY = "@food_delivery_access_token";
const REFRESH_TOKEN_KEY = "@food_delivery_refresh_token";

/**
 * Get authentication token from AsyncStorage
 */
export async function getAuthToken(): Promise<string> {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return token || "";
  } catch (error) {
    console.error("Error getting auth token:", error);
    return "";
  }
}

/**
 * Save authentication token to AsyncStorage
 */
export async function saveAuthToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error("Error saving auth token:", error);
  }
}

/**
 * Remove authentication token from AsyncStorage
 */
export async function removeAuthToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
}
