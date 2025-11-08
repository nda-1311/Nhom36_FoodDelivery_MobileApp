"use client";
import { supabase } from "@/lib/supabase/client";

export async function getCartKey(): Promise<string> {
  // Nếu user đã đăng nhập, dùng UID
  try {
    const { data } = await supabase.auth.getUser();
    const uid = data?.user?.id;
    if (uid) return uid;
  } catch {}

  // Nếu chưa đăng nhập, tạo key riêng cho thiết bị
  const KEY = "cart_device_key";
  let key = localStorage.getItem(KEY);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(KEY, key);
  }
  return key;
}
