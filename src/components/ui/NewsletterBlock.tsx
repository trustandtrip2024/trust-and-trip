"use client";

import { useState, FormEvent } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

interface Props {
  eyebrow: string;
  title: string;
  italicTail?: string;
  lede: string;
  placeholder?: string;
  buttonLabel?: string;
  footerMicrocopy?: string;
}

export default function NewsletterBlock({
  eyebrow, title, italicTail, lede,
  placeholder = "you@example.com",
  buttonLabel = "Subscribe",
  footerMicrocopy,
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [coupon, setCoupon] = useState<{ code: string; amountOff: number } | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "homepage_newsletter" }),
      });
      if (res.ok) {
        const j = await res.json().catch(() => ({}));
        if (j?.coupon?.code) setCoupon({ code: j.coupon.code, amountOff: j.coupon.amountOff });
        setStatus("ok");
        setEmail("");
      } else {
        setStatus("err");
      }
    } catch { setStatus("err"); }
  };

  return (
    <section className="bg-tat-charcoal text-white py-18 md:py-22" aria-labelledby="newsletter-title">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-3xl text-center">
        <p className="text-eyebrow uppercase font-medium text-tat-orange-soft/90">{eyebrow}</p>
        <h2 id="newsletter-title" className="mt-2 font-serif text-h1 md:text-display text-white text-balance">
          {title}
          {italicTail && (
            <>
              {" "}
              <em className="not-italic font-serif italic text-tat-orange-soft">{italicTail}</em>
            </>
          )}
        </h2>
        <p className="mt-3 text-lead text-white/75 max-w-2xl mx-auto">{lede}</p>

        <form
          onSubmit={onSubmit}
          aria-label="Newsletter signup"
          className="mt-7 flex flex-col sm:flex-row items-stretch gap-2 max-w-lg mx-auto"
        >
          <label htmlFor="nl-email" className="sr-only">Email address</label>
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-tat-slate/80" aria-hidden />
            <input
              id="nl-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              aria-describedby={footerMicrocopy ? "nl-help" : undefined}
              className="w-full h-12 pl-11 pr-4 rounded-pill bg-white text-tat-charcoal text-body placeholder:text-tat-slate/60 outline-none focus-visible:ring-2 focus-visible:ring-tat-orange-soft focus-visible:ring-offset-2 focus-visible:ring-offset-tat-charcoal"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="tt-cta !w-auto !min-w-[160px] disabled:opacity-60"
          >
            {status === "loading" ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Subscribing…</>
            ) : status === "ok" ? (
              <><Check className="h-4 w-4" /> Subscribed</>
            ) : buttonLabel}
          </button>
        </form>

        {status === "err" && (
          <p role="alert" className="mt-3 text-meta text-tat-danger-fg">Something went wrong. Try again, or email plan@trustandtrip.com.</p>
        )}
        {status === "ok" && coupon && (
          <div
            role="status"
            className="mt-5 mx-auto max-w-md rounded-2xl border-2 border-dashed border-tat-orange-soft/60 bg-white/5 px-5 py-4"
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-tat-orange-soft/90 font-semibold">
              Your code · ₹{coupon.amountOff.toLocaleString("en-IN")} off
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold text-white tracking-[0.1em]">
              {coupon.code}
            </p>
            <p className="mt-2 text-meta text-white/65">
              We've also emailed it to you. Apply at booking, valid 90 days.
            </p>
          </div>
        )}
        {status === "ok" && !coupon && (
          <p className="mt-3 text-meta text-tat-orange-soft">Subscribed — check your inbox.</p>
        )}
        {footerMicrocopy && (
          <p id="nl-help" className="mt-4 text-tag uppercase text-white/55">{footerMicrocopy}</p>
        )}
      </div>
    </section>
  );
}
