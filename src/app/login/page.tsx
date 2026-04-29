"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";
import OAuthButtons from "@/components/OAuthButtons";

type Mode = "signin" | "signup" | "reset";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode: Mode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const { user, loading, setSession } = useUserStore();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const dashboardFor = (u: { user_metadata?: { role?: string } } | null) =>
    u?.user_metadata?.role === "creator" ? "/creators/dashboard" : "/dashboard";

  useEffect(() => {
    if (!loading && user) router.replace(dashboardFor(user));
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (mode === "signin") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else {
        // Push the new session into the Zustand store immediately so the
        // dashboard layout sees a valid user on first render and doesn't
        // kick back to /login from its auth-gate effect.
        setSession(data.session);
        router.replace(dashboardFor(data.user));
      }
    } else if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
      else setSuccess("Check your email to confirm your account, then sign in.");
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard`,
      });
      if (error) setError(error.message);
      else setSuccess("Password reset email sent. Check your inbox.");
    }

    setSubmitting(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-tat-paper flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Back to home */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-tat-charcoal/50 hover:text-tat-charcoal transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        {/* Logo / brand */}
        <div className="mb-8">
          <p className="font-display text-h2 font-medium text-tat-charcoal">
            Trust & Trip
          </p>
          <p className="text-sm text-tat-charcoal/50 mt-1">
            {mode === "signin" && "Sign in to your account"}
            {mode === "signup" && "Create a free account"}
            {mode === "reset" && "Reset your password"}
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-tat-success-bg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-tat-success-fg" />
            </div>
            <p className="text-sm text-tat-charcoal/70 leading-relaxed">{success}</p>
            <button
              onClick={() => { setSuccess(""); setMode("signin"); }}
              className="text-sm font-medium text-tat-gold hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            {/* OAuth buttons — sit above the email/password form for
                fastest sign-in. Same component on creator pages. */}
            {mode !== "reset" && (
              <>
                <OAuthButtons next="/dashboard" />
                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-tat-charcoal/10" />
                  <span className="text-[11px] uppercase tracking-[0.12em] text-tat-charcoal/40">
                    or with email
                  </span>
                  <span className="h-px flex-1 bg-tat-charcoal/10" />
                </div>
              </>
            )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
              />
            </div>

            {mode !== "reset" && (
              <div>
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-tat-charcoal/35 hover:text-tat-charcoal/60 transition-colors"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="mt-1.5 text-xs text-tat-charcoal/45 hover:text-tat-gold transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {error && (
              <p className="text-xs text-tat-danger-fg bg-tat-danger-bg px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-60 mt-2"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Please wait…</>
              ) : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Email"}
            </button>
          </form>
          </>
        )}

        {/* Toggle */}
        {!success && mode !== "reset" && (
          <p className="text-center text-sm text-tat-charcoal/50 mt-6">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              className="font-medium text-tat-charcoal hover:text-tat-gold transition-colors"
            >
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        )}
        {!success && mode === "reset" && (
          <p className="text-center text-sm text-tat-charcoal/50 mt-6">
            <button onClick={() => setMode("signin")} className="font-medium text-tat-charcoal hover:text-tat-gold transition-colors">
              Back to sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
