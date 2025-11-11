import { supabase } from "@/lib/supabase/client";
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
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !mounted) {
          setAdminInfo({
            isAdmin: false,
            role: "user",
            permissions: [],
            loading: false,
          });
          return;
        }

        // Check admin_config table
        const { data: adminData, error } = await supabase
          .from("admin_config")
          .select("role, permissions")
          .eq("user_id", user.id)
          .single();

        if (error || !adminData) {
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

        if (mounted) {
          setAdminInfo({
            isAdmin: true,
            role: adminData.role as "admin" | "super_admin" | "moderator",
            permissions: adminData.permissions || [],
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

    // Listen to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
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
