"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, MessageCircle, Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { submitLead } from "@/lib/submit-lead";

const WHATSAPP = "https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I%27d%20love%20help%20planning%20a%20trip.";

export default function FinalCTA() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setError("");
    setSubmitting(true);
    const res = await submitLead({
      name: "Newsletter",
      email,
      phone: "",
      source: "newsletter",
      message: "Newsletter signup from homepage",
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      setEmail("");
    } else {
      setError(res.error ?? "Something went wrong. Try again.");
    }
  };

  return (
    <section className="py-20 md:py-28 bg-ink text-cream relative overflow-hidden">
      {/* Decorative gold glows */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      <div className="container-custom relative">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold/80 mb-4">
            Three ways to start
          </p>
          <h2 className="font-display font-medium leading-[1.05] text-balance"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Let&apos;s build something
            <span className="italic text-gold font-light"> worth remembering.</span>
          </h2>
          <p className="mt-5 text-cream/65 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Free to plan. Refundable if plans change. Always backed by a real human who knows your trip end-to-end.
          </p>
        </div>

        {/* 3 action cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* AI Planner */}
          <Link
            href="/plan"
            className="group bg-cream/8 hover:bg-cream/12 border border-cream/15 hover:border-gold/40 rounded-2xl p-6 transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-gold/15 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-gold" />
            </div>
            <h3 className="font-display text-lg font-medium mb-1.5">AI Trip Builder</h3>
            <p className="text-xs text-cream/55 leading-relaxed mb-4">
              Answer 4 quick prompts. Get a draft itinerary in 20 seconds.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-gold font-medium group-hover:gap-2 transition-all">
              Start free <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* WhatsApp */}
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-cream/8 hover:bg-cream/12 border border-cream/15 hover:border-[#25D366]/40 rounded-2xl p-6 transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-[#25D366]/15 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <MessageCircle className="h-5 w-5 text-[#25D366] fill-[#25D366]/40" />
            </div>
            <h3 className="font-display text-lg font-medium mb-1.5">Chat with a Planner</h3>
            <p className="text-xs text-cream/55 leading-relaxed mb-4">
              A real human replies in minutes. Weekdays 9am–9pm IST.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#25D366] font-medium group-hover:gap-2 transition-all">
              Open WhatsApp <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </a>

          {/* Newsletter */}
          <div className="bg-cream/8 border border-cream/15 rounded-2xl p-6">
            <div className="h-12 w-12 rounded-xl bg-cream/10 flex items-center justify-center mb-4">
              <Mail className="h-5 w-5 text-cream/80" />
            </div>
            <h3 className="font-display text-lg font-medium mb-1.5">Monthly Wanderlust</h3>
            <p className="text-xs text-cream/55 leading-relaxed mb-4">
              One email a month — offbeat routes + member-only deals.
            </p>
            {done ? (
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                You&apos;re on the list.
              </div>
            ) : (
              <form onSubmit={submit} className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@inbox.com"
                  className="flex-1 min-w-0 bg-cream/5 border border-cream/15 text-cream placeholder-cream/35 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label="Subscribe"
                  className="shrink-0 h-8 w-8 rounded-lg bg-gold hover:bg-gold/90 text-ink flex items-center justify-center transition-colors disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </form>
            )}
            {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
          </div>
        </div>

        {/* Reassurance row */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-cream/45">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            30% deposit · refundable 14 days
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Price protection
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            24/7 on-trip support
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            No hidden costs
          </span>
        </div>
      </div>
    </section>
  );
}
