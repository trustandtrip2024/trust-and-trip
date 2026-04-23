"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

type Mode = "signin" | "signup" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useUserStore();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.replace("/dashboard");
    } else if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
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
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Back to home */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        {/* Logo / brand */}
        <div className="mb-8">
          <p className="font-display text-2xl font-medium text-ink">
            Trust & Trip
          </p>
          <p className="text-sm text-ink/50 mt-1">
            {mode === "signin" && "Sign in to your account"}
            {mode === "signup" && "Create a free account"}
            {mode === "reset" && "Reset your password"}
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-ink/70 leading-relaxed">{success}</p>
            <button
              onClick={() => { setSuccess(""); setMode("signin"); }}
              className="text-sm font-medium text-gold hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-ink/15 bg-white text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-ink/15 bg-white text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
              />
            </div>

            {mode !== "reset" && (
              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-ink/15 bg-white text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink/60 transition-colors"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="mt-1.5 text-xs text-ink/45 hover:text-gold transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-ink hover:bg-gold text-cream hover:text-ink rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-60 mt-2"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Please wait…</>
              ) : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Email"}
            </button>
          </form>
        )}

        {/* Toggle */}
        {!success && mode !== "reset" && (
          <p className="text-center text-sm text-ink/50 mt-6">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              className="font-medium text-ink hover:text-gold transition-colors"
            >
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        )}
        {!success && mode === "reset" && (
          <p className="text-center text-sm text-ink/50 mt-6">
            <button onClick={() => setMode("signin")} className="font-medium text-ink hover:text-gold transition-colors">
              Back to sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
