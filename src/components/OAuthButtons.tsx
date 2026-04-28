"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  /**
   * Where to send the user after OAuth completes. Defaults to /dashboard,
   * pass /creators/dashboard for creator sign-in.
   */
  next?: string;
  /**
   * Extra metadata to attach when this is a sign-up flow (e.g. role=creator).
   * Supabase OAuth doesn't support `data` directly, so we stash this in
   * sessionStorage and the auth callback applies it after exchangeCodeForSession.
   */
  signUpMetadata?: Record<string, string>;
  /** Optional className overrides on the wrapper. */
  className?: string;
  /** Visual size — full pill ("default") or compact pill ("sm"). */
  size?: "default" | "sm";
  /** Tone — "light" for white surfaces, "dark" for dark surfaces. */
  tone?: "light" | "dark";
  /** Optional label override (e.g. "Sign up with"). */
  label?: string;
}

const PENDING_KEY = "tt_oauth_pending_metadata";

export default function OAuthButtons({
  next = "/dashboard",
  signUpMetadata,
  className = "",
  size = "default",
  tone = "light",
  label,
}: Props) {
  const [busy, setBusy] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(provider: "google" | "facebook") {
    setError(null);
    setBusy(provider);

    // Stash metadata to apply on callback. Supabase OAuth doesn't accept
    // user_metadata at the start of the flow (only on email signups); we
    // patch it from the auth callback after the session lands.
    if (signUpMetadata && typeof window !== "undefined") {
      window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(signUpMetadata));
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        // Pull email + name + avatar by default — same scopes Supabase uses.
        scopes: provider === "google" ? "email profile" : "email,public_profile",
      },
    });
    if (err) {
      setError(err.message);
      setBusy(null);
      window.sessionStorage.removeItem(PENDING_KEY);
    }
  }

  const padY = size === "sm" ? "py-2.5" : "py-3";
  const text = size === "sm" ? "text-[13px]" : "text-sm";
  const base =
    tone === "dark"
      ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
      : "border-tat-charcoal/15 bg-white text-tat-charcoal hover:border-tat-charcoal/35";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <p className="text-[11px] uppercase tracking-[0.12em] text-tat-charcoal/50 text-center">
          {label}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => start("google")}
          disabled={busy !== null}
          className={`inline-flex items-center justify-center gap-2 ${padY} ${text} font-medium rounded-xl border transition disabled:opacity-60 ${base}`}
          aria-label="Continue with Google"
        >
          {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleLogo />}
          Google
        </button>
        <button
          type="button"
          onClick={() => start("facebook")}
          disabled={busy !== null}
          className={`inline-flex items-center justify-center gap-2 ${padY} ${text} font-medium rounded-xl border transition disabled:opacity-60 ${base}`}
          aria-label="Continue with Facebook"
        >
          {busy === "facebook" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FacebookLogo />}
          Facebook
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
    </div>
  );
}

function GoogleLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" fill="#34A853"/>
      <path d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.46.33-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M24 12c0-6.63-5.37-12-12-12S0 5.37 0 12c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08V12h3.05V9.36c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.95h-1.51c-1.49 0-1.95.93-1.95 1.88V12h3.32l-.53 3.47h-2.79v8.38C19.61 22.95 24 17.99 24 12z"
        fill="#1877F2"
      />
    </svg>
  );
}
