"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
        router.push("/login");
      }
    });

    // Also catch a stale token on mount — if getSession returns an error, sign out cleanly
    supabase.auth.getSession().then(({ error }) => {
      if (error?.message?.includes("Refresh Token")) {
        supabase.auth.signOut().then(() => router.push("/login"));
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
