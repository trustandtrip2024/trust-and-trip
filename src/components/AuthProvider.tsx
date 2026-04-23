"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setLoading } = useUserStore();

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => setSession(session))
      .catch((err) => {
        console.error("[auth] getSession failed:", err);
        setSession(null);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return <>{children}</>;
}
