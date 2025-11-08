// lib/auth/ensureAnon.ts
import { supabase } from "@/lib/supabase/client";

export async function ensureAnonymousUser() {
  // lấy session hiện tại (nếu có sẽ giữ nguyên qua F5)
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user) {
    return sessionData.session.user;
  }

  // chưa có thì đăng nhập ẩn danh
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("Anonymous sign-in failed:", error);
    throw error;
  }
  return data.user;
}
