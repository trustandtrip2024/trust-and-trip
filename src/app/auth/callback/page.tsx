"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-tat-paper flex items-center justify-center">
        <div className="flex items-center gap-2 text-tat-charcoal/50 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing you in…
        </div>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}

function AuthCallbackInner() {
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
        // OAuth signup flows stash metadata (e.g. role=creator) in
        // sessionStorage because Supabase OAuth has no `data` field at
        // start. Apply it now if present, then route by final role.
        let role = data.session.user.user_metadata?.role as string | undefined;
        try {
          const raw = window.sessionStorage.getItem("tt_oauth_pending_metadata");
          if (raw) {
            const meta = JSON.parse(raw) as Record<string, string>;
            window.sessionStorage.removeItem("tt_oauth_pending_metadata");
            if (Object.keys(meta).length) {
              await supabase.auth.updateUser({
                data: { ...data.session.user.user_metadata, ...meta },
              });
              if (meta.role) role = meta.role;
            }
          }
        } catch {
          // bad json or storage disabled — ignore
        }
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
      <div className="min-h-screen bg-tat-paper flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white border border-red-100 rounded-2xl p-6 text-center">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="font-medium text-tat-charcoal mb-1">Sign-in link couldn't be used</p>
          <p className="text-xs text-tat-charcoal/60 mb-5 break-words">{error}</p>
          <Link href="/login" className="inline-block px-4 py-2.5 bg-tat-charcoal text-tat-paper rounded-xl text-sm font-semibold hover:bg-tat-gold hover:text-tat-charcoal transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tat-paper flex items-center justify-center">
      <div className="flex items-center gap-2 text-tat-charcoal/50 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Signing you in…
      </div>
    </div>
  );
}
