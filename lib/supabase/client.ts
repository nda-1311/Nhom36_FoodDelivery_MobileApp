import { createClient } from "@supabase/supabase-js";

// 🧠 Thêm 2 dòng này ở đây:
console.log("🔗 SUPABASE URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log(
  "🔑 SUPABASE KEY:",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10) + "..."
);

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://YOUR_URL.supabase.co",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_PUBLIC_ANON_KEY",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "food_delivery.auth",
    },
  }
);
