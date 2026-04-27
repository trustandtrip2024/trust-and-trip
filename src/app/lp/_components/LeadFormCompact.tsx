"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { pixel } from "@/components/MetaPixel";

interface LeadResponse {
  success?: boolean;
  eventId?: string;
  error?: string;
}

interface Props {
  /** e.g. "Maldives", "Bali", "Char Dham" */
  destination: string;
  /** Lead source — typically "package_enquiry" */
  source?: string;
  /** Free-text label saved on the lead row + Bitrix deal */
  packageLabel: string;
  /** Auto-set travel_type */
  travelType?: string;
  /** Eyebrow + heading copy */
  eyebrow?: string;
  headline?: string;
  subline?: string;
  monthLabel?: string;
  /** Submit button text */
  ctaLabel?: string;
  /** WhatsApp number for follow-up CTA on success */
  whatsappNumber?: string;
}

export default function LeadFormCompact({
  destination,
  source = "package_enquiry",
  packageLabel,
  travelType = "Couple",
  eyebrow = "Free draft itinerary",
  headline = `60-second ${destination} draft.`,
  subline = "A real planner reviews it. Pay only when sure.",
  monthLabel = "Travel month (optional, e.g. June 2026)",
  ctaLabel = "Get my free draft",
  whatsappNumber = "918115999588",
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [travelMonth, setTravelMonth] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);

    // Dedup with the on-LP stream widget — skip duplicate Pixel Lead fire if
    // this phone+destination already submitted in the last 24h on this browser.
    const dedupKey = `tt_lead:${destination.toLowerCase()}:${cleanPhone}`;
    const dedupTs = typeof window !== "undefined" ? window.localStorage.getItem(dedupKey) : null;
    const alreadyFired = dedupTs && Date.now() - Number(dedupTs) < 24 * 3600 * 1000;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          email: "",
          destination,
          travel_type: travelType,
          travel_date: travelMonth || undefined,
          source,
          package_title: packageLabel,
          page_url: typeof window !== "undefined" ? window.location.href : undefined,
          utm_source:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("utm_source") ?? undefined
              : undefined,
          utm_medium:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("utm_medium") ?? undefined
              : undefined,
          utm_campaign:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("utm_campaign") ?? undefined
              : undefined,
          utm_content:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("utm_content") ?? undefined
              : undefined,
          utm_term:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("utm_term") ?? undefined
              : undefined,
        }),
      });
      const data: LeadResponse = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      // Pixel Lead with the SAME event_id as the server-side CAPI for dedup
      // — but skip the browser fire if we already fired for this phone+dest
      // recently. Server-side CAPI still fires (Supabase row + Bitrix etc).
      if (!alreadyFired) {
        pixel.lead(0, data.eventId);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(dedupKey, String(Date.now()));
        }
      }

      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-card border border-tat-orange/30 p-6 md:p-7 shadow-rail">
        <p className="tt-eyebrow text-tat-teal">Got it</p>
        <h3 className="mt-2 font-display text-h2 text-tat-charcoal leading-tight">
          A planner is on it.
        </h3>
        <p className="mt-3 text-body text-tat-charcoal/75">
          Your draft {destination} itinerary is being built. We&rsquo;ll WhatsApp you in under a minute and
          email the full draft within an hour.
        </p>
        <a
          href={`/api/wa/click?phone=${whatsappNumber}&src=lp_${destination.toLowerCase().replace(/\s+/g, "_")}_postsubmit&msg=${encodeURIComponent(
            `Hi Trust and Trip, I just enquired about a ${destination} trip.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-pill bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
        >
          Chat on WhatsApp now →
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-card border border-tat-charcoal/10 p-5 md:p-6 shadow-rail"
    >
      <p className="tt-eyebrow text-tat-orange">{eyebrow}</p>
      <h3 className="mt-1 font-display text-h2 text-tat-charcoal leading-tight">
        {headline}
      </h3>
      <p className="mt-2 text-meta text-tat-slate">{subline}</p>

      <div className="mt-5 space-y-3">
        <input
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-12 px-4 rounded-pill bg-tat-cream-warm/40 border border-tat-charcoal/15 text-tat-charcoal text-sm outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
          required
        />
        <input
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="WhatsApp number (10 digits)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full h-12 px-4 rounded-pill bg-tat-cream-warm/40 border border-tat-charcoal/15 text-tat-charcoal text-sm outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
          required
        />
        <input
          type="text"
          placeholder={monthLabel}
          value={travelMonth}
          onChange={(e) => setTravelMonth(e.target.value)}
          className="w-full h-12 px-4 rounded-pill bg-tat-cream-warm/40 border border-tat-charcoal/15 text-tat-charcoal text-sm outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
        />
      </div>

      {error && <p className="mt-3 text-meta text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 h-12 px-5 rounded-pill bg-tat-orange text-white text-sm font-semibold hover:bg-tat-orange/90 transition disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Building your draft...
          </>
        ) : (
          ctaLabel
        )}
      </button>
      <p className="mt-3 text-[11px] text-tat-charcoal/50 text-center">
        We never share your number. No spam.
      </p>
    </form>
  );
}
