import { authService, foodService, restaurantService } from "@/lib/api";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/**
 * Example component demonstrating API usage
 *
 * Usage:
 * import { ApiTestScreen } from '@/components/ApiTestScreen';
 * <ApiTestScreen />
 */
export function ApiTestScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setResult(
      authenticated ? "User is authenticated" : "User is not authenticated"
    );
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email: "user789@example.com",
        password: "Password123!",
      });

      if (response.success) {
        setResult(
          `✅ Login successful!\nUser: ${response.data?.user.fullName}\nEmail: ${response.data?.user.email}`
        );
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      setResult(`❌ Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRestaurants = async () => {
    setIsLoading(true);
    try {
      const response = await restaurantService.getRestaurants({
        page: 1,
        limit: 5,
        isOpen: true,
      });

      if (response.success) {
        const restaurants = response.data || [];
        setResult(
          `✅ Found ${response.count} restaurants\n\n` +
            restaurants
              .map(
                (r, i) =>
                  `${i + 1}. ${r.name}\n   Rating: ${r.rating}⭐\n   Fee: ${
                    r.deliveryFee
                  }₫`
              )
              .join("\n\n")
        );
      }
    } catch (error: any) {
      setResult(`❌ Failed to get restaurants: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFood = async () => {
    setIsLoading(true);
    try {
      const response = await foodService.getMenuItems({
        page: 1,
        limit: 5,
      });

      if (response.success) {
        const items = response.data || [];
        setResult(
          `✅ Found ${response.count} menu items\n\n` +
            items
              .map(
                (item, i) =>
                  `${i + 1}. ${item.name}\n   Price: ${item.price}₫\n   ${
                    item.isVegetarian ? "🌱" : "🍖"
                  } ${item.isSpicy ? "🌶️" : ""}`
              )
              .join("\n\n")
        );
      }
    } catch (error: any) {
      setResult(`❌ Failed to get menu items: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetProfile = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getCurrentUser();

      if (response.success) {
        const user = response.data;
        setResult(
          `✅ User Profile\n\n` +
            `Name: ${user?.fullName}\n` +
            `Email: ${user?.email}\n` +
            `Phone: ${user?.phoneNumber || "N/A"}\n` +
            `Role: ${user?.role}\n` +
            `Verified: ${user?.emailVerified ? "✅" : "❌"}`
        );
      }
    } catch (error: any) {
      setResult(
        `❌ Failed to get profile: ${error.message}\n\nPlease login first.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setResult("✅ Logged out successfully");
      setIsAuthenticated(false);
    } catch (error: any) {
      setResult(`❌ Logout failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Integration Test</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text
          style={[
            styles.statusValue,
            isAuthenticated && styles.statusAuthenticated,
          ]}
        >
          {isAuthenticated ? "🟢 Authenticated" : "🔴 Not Authenticated"}
        </Text>
      </View>

      <View style={styles.buttonGroup}>
        <Text style={styles.groupTitle}>Authentication</Text>
        <Button
          title="Login (Test User)"
          onPress={handleLogin}
          disabled={isLoading}
        />
        <Button
          title="Get My Profile"
          onPress={handleGetProfile}
          disabled={isLoading}
        />
        <Button title="Logout" onPress={handleLogout} disabled={isLoading} />
      </View>

      <View style={styles.buttonGroup}>
        <Text style={styles.groupTitle}>Public Data</Text>
        <Button
          title="Get Restaurants"
          onPress={handleGetRestaurants}
          disabled={isLoading}
        />
        <Button
          title="Get Menu Items"
          onPress={handleGetFood}
          disabled={isLoading}
        />
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {result && !isLoading && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Result:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ Info</Text>
        <Text style={styles.infoText}>
          Backend API: http://localhost:5000/api/v1{"\n"}
          Test User: user789@example.com{"\n"}
          Password: Password123!{"\n\n"}
          See API_USAGE.md for complete documentation.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
  statusValue: {
    fontSize: 16,
    color: "#666",
  },
  statusAuthenticated: {
    color: "#22c55e",
    fontWeight: "600",
  },
  buttonGroup: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "monospace",
  },
  infoContainer: {
    marginTop: 20,
    marginBottom: 40,
    padding: 15,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#555",
  },
});
