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
      setStatus(res.ok ? "ok" : "err");
      if (res.ok) setEmail("");
    } catch { setStatus("err"); }
  };

  return (
    <section className="bg-stone-900 text-white py-18 md:py-22" aria-labelledby="newsletter-title">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-3xl text-center">
        <p className="text-eyebrow uppercase font-medium text-amber-300/90">{eyebrow}</p>
        <h2 id="newsletter-title" className="mt-2 font-serif text-h1 md:text-display text-white text-balance">
          {title}
          {italicTail && (
            <>
              {" "}
              <em className="not-italic font-serif italic text-amber-300">{italicTail}</em>
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
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" aria-hidden />
            <input
              id="nl-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              aria-describedby={footerMicrocopy ? "nl-help" : undefined}
              className="w-full h-12 pl-11 pr-4 rounded-pill bg-white text-stone-900 text-body placeholder:text-stone-400 outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
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
          <p role="alert" className="mt-3 text-meta text-rose-300">Something went wrong. Try again, or email plan@trustandtrip.com.</p>
        )}
        {footerMicrocopy && (
          <p id="nl-help" className="mt-4 text-tag uppercase text-white/55">{footerMicrocopy}</p>
        )}
      </div>
    </section>
  );
}
