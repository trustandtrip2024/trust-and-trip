"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = params.get("next") ?? "/dashboard";
    const code = params.get("code");
    const errDesc = params.get("error_description");

    if (errDesc) {
      setError(errDesc);
      return;
    }

    // PKCE code exchange must happen client-side — code_verifier lives in
    // localStorage on this browser. If there's no code, supabase-js may
    // already have parsed a hash-based token; just wait for session.
    const run = async () => {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError(error.message);
          return;
        }
      } else {
        // Give detectSessionInUrl a tick to process hash fragments
        await new Promise((r) => setTimeout(r, 150));
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const role = data.session.user.user_metadata?.role;
        const dest = role === "creator" ? "/creators/dashboard" : next;
        router.replace(dest);
      } else {
        setError("Couldn't establish a session. Please sign in again.");
      }
    };

    run();
  }, [params, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white border border-red-100 rounded-2xl p-6 text-center">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="font-medium text-ink mb-1">Sign-in link couldn't be used</p>
          <p className="text-xs text-ink/60 mb-5 break-words">{error}</p>
          <Link href="/login" className="inline-block px-4 py-2.5 bg-ink text-cream rounded-xl text-sm font-semibold hover:bg-gold hover:text-ink transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex items-center gap-2 text-ink/50 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Signing you in…
      </div>
    </div>
  );
}
