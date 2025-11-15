import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

// Token storage keys
const ACCESS_TOKEN_KEY = "@food_delivery_access_token";
const REFRESH_TOKEN_KEY = "@food_delivery_refresh_token";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  count?: number;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode?: number;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokensLoaded: boolean = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    this.baseURL = API_URL;
    this.loadingPromise = this.loadTokens();
  }

  // Load tokens from AsyncStorage
  private async loadTokens(): Promise<void> {
    if (this.tokensLoaded) return;

    try {
      const [accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(ACCESS_TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
      ]);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokensLoaded = true;
      console.log("✅ Tokens loaded:", {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken,
      });
    } catch (error) {
      console.error("Failed to load tokens:", error);
      this.tokensLoaded = true;
    }
  }

  // Ensure tokens are loaded before any operation
  private async ensureTokensLoaded(): Promise<void> {
    if (this.loadingPromise) {
      await this.loadingPromise;
      this.loadingPromise = null;
    }
  }

  // Save tokens to AsyncStorage
  async setTokens(accessToken: string, refreshToken: string) {
    try {
      await Promise.all([
        AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
      ]);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    } catch (error) {
      console.error("Failed to save tokens:", error);
    }
  }

  // Clear tokens
  async clearTokens() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      ]);
      this.accessToken = null;
      this.refreshToken = null;
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
  }

  // Get access token
  async getAccessToken(): Promise<string | null> {
    await this.ensureTokensLoaded();
    return this.accessToken;
  }

  // Make HTTP request
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Ensure tokens are loaded first
    await this.ensureTokensLoaded();

    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add Authorization header if token exists
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
      console.log(`🔐 Sending request to ${endpoint} with auth token`);
    } else {
      console.log(`⚠️ Sending request to ${endpoint} WITHOUT auth token`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle token refresh on 401
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          headers["Authorization"] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          return await retryResponse.json();
        }
      }

      if (!response.ok) {
        throw {
          success: false,
          message: data.message || "Request failed",
          error: data.error || response.statusText,
          statusCode: response.status,
        } as ApiError;
      }

      return data;
    } catch (error: any) {
      if (error.success === false) {
        throw error;
      }
      throw {
        success: false,
        message: "Network error",
        error: error.message || "Failed to connect to server",
        statusCode: 0,
      } as ApiError;
    }
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        await this.clearTokens();
        return false;
      }

      const data = await response.json();
      if (data.success && data.data.accessToken) {
        await this.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      await this.clearTokens();
      return false;
    }
  }

  // HTTP methods
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return this.request<T>(`${endpoint}${queryString}`, {
      method: "GET",
    });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
