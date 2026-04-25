"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { analytics } from "@/lib/analytics";

export default function NewsletterInline() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setState("success");
        setEmail("");
        analytics.newsletterSubscribe();
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  return (
    <div className="bg-tat-charcoal text-tat-paper rounded-3xl p-8 md:p-10">
      <span className="eyebrow text-tat-gold">Newsletter</span>
      <h3 className="mt-3 font-display text-2xl md:text-3xl font-medium text-balance">
        Monthly travel stories,
        <span className="italic text-tat-gold font-light"> straight to your inbox.</span>
      </h3>
      <p className="mt-3 text-tat-paper/50 text-sm">No spam. Real insights. Unsubscribe anytime.</p>

      {state === "success" ? (
        <div className="mt-6 flex items-center gap-3 bg-tat-gold/15 border border-tat-gold/30 rounded-full px-5 py-3">
          <CheckCircle2 className="h-5 w-5 text-tat-gold shrink-0" />
          <p className="text-tat-paper/90 text-sm">You're subscribed! First story coming soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-2 bg-tat-paper/8 border border-tat-paper/15 rounded-full p-1.5 pl-5 focus-within:border-tat-gold transition-colors">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={state === "loading"}
            className="flex-1 bg-transparent text-tat-paper placeholder:text-tat-paper/40 text-sm outline-none py-2 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="shrink-0 bg-tat-gold text-tat-charcoal h-10 w-10 rounded-full flex items-center justify-center hover:bg-tat-paper transition-colors disabled:opacity-60"
          >
            <Send className={`h-4 w-4 ${state === "loading" ? "animate-pulse" : ""}`} />
          </button>
        </form>
      )}
      {state === "error" && <p className="text-xs text-red-400 mt-2">Something went wrong. Try again.</p>}
    </div>
  );
}
