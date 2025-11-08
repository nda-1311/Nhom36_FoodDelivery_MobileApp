// hooks/useAnonUser.ts
"use client";
import { useEffect, useState } from "react";
import { ensureAnonymousUser } from "@/lib/auth/ensureAnon";
import { supabase } from "@/lib/supabase/client";

export function useAnonUser() {
  const [userId, setUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await ensureAnonymousUser();
        if (mounted && user) setUserId(user.id);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // nếu session thay đổi (sign out/in), cập nhật lại
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const u = s?.user;
      if (u) setUserId(u.id);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  return { userId, loading };
}
