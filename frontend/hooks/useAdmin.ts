import { authService } from "@/lib/api/auth";
import { useEffect, useState } from "react";

export interface AdminInfo {
  isAdmin: boolean;
  role: "user" | "admin" | "super_admin" | "moderator";
  permissions: string[];
  loading: boolean;
}

export function useAdmin() {
  const [adminInfo, setAdminInfo] = useState<AdminInfo>({
    isAdmin: false,
    role: "user",
    permissions: [],
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async () => {
      try {
        // Check if user is logged in by checking for token
        const isAuthenticated = await authService.isAuthenticated();
        console.log("🔐 useAdmin - isAuthenticated:", isAuthenticated);

        if (!isAuthenticated || !mounted) {
          console.log("❌ useAdmin - Not authenticated");
          setAdminInfo({
            isAdmin: false,
            role: "user",
            permissions: [],
            loading: false,
          });
          return;
        }

        // Get current user profile from backend API
        console.log("📡 useAdmin - Fetching user profile...");
        const response = await authService.getCurrentUser();
        console.log("📡 useAdmin - Response:", response);

        if (!response.success || !response.data || !mounted) {
          console.log("❌ useAdmin - Failed to get user data");
          if (mounted) {
            setAdminInfo({
              isAdmin: false,
              role: "user",
              permissions: [],
              loading: false,
            });
          }
          return;
        }

        const user = response.data;
        const userRole = user.role?.toLowerCase();
        console.log("👤 useAdmin - User role:", userRole);

        // Check if user has admin role
        const isAdmin =
          userRole === "admin" ||
          userRole === "super_admin" ||
          userRole === "moderator";
        console.log("✅ useAdmin - Is admin?", isAdmin);

        if (mounted) {
          setAdminInfo({
            isAdmin,
            role: isAdmin
              ? (userRole as "admin" | "super_admin" | "moderator")
              : "user",
            permissions: isAdmin ? ["*"] : [], // Give all permissions to admin
            loading: false,
          });
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        if (mounted) {
          setAdminInfo({
            isAdmin: false,
            role: "user",
            permissions: [],
            loading: false,
          });
        }
      }
    };

    checkAdminStatus();

    // Re-check every 30 seconds to catch token changes
    const interval = setInterval(checkAdminStatus, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return adminInfo;
}

// Utility function to check if user has specific permission
export function hasPermission(
  permissions: string[],
  required: string
): boolean {
  return permissions.includes(required) || permissions.includes("*");
}
