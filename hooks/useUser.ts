"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export function useUser() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) setUser({ name: (u.user_metadata?.name as string) || u.email?.split("@")[0] || "there", email: u.email ?? "" });
    }).catch(() => undefined);
  }, []);
  return user;
}
