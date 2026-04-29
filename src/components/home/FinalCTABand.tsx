"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, Gift } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

const WHATSAPP_HREF =
  "https://wa.me/918115999588?text=" +
  encodeURIComponent("Hi Trust and Trip — I'd like to plan a trip.");

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  ctaLabel?: string;
  microcopy?: string;
}

export default function FinalCTABand({
  eyebrow = "Your turn",
  titleStart = "Let's build something",
  titleItalic = "worth remembering.",
  lede = "A 2-minute form. A 24-hour reply. A trip you'll talk about for years.",
  ctaLabel = "Plan my trip — free",
  microcopy = "Free until you're sure. No card needed to start.",
}: Props = {}) {
  const { open: openPlanner } = useTripPlanner();
  return (
    <section
      aria-labelledby="final-cta-title"
      className="bg-tat-charcoal text-white py-18 md:py-22"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-3xl text-center">
        <p className="text-eyebrow uppercase font-medium text-tat-orange-soft/90">{eyebrow}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-tat-orange/15 border border-tat-orange/40 text-tat-orange-soft text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1.5">
          <Gift className="h-3 w-3" aria-hidden />
          Plan this week · ₹2,000 off your trip
        </span>
        <h2 id="final-cta-title" className="mt-2 font-display font-normal text-h1 md:text-display text-white text-balance">
          {titleStart}{" "}
          <em className="not-italic font-display italic text-tat-gold">{titleItalic}</em>
        </h2>
        <p className="mt-3 text-lead text-white/75 max-w-xl mx-auto">{lede}</p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => openPlanner()} className="tt-cta !w-auto !min-w-[220px]">
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
          <Link
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-white/85 hover:text-tat-orange-soft transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange-soft focus-visible:ring-offset-2 focus-visible:ring-offset-tat-charcoal rounded-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Or message a planner on WhatsApp
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-6 text-tag uppercase text-white/55">{microcopy}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-tat-orange-soft/80">
          <span className="h-1.5 w-1.5 rounded-full bg-tat-orange-soft animate-pulse" />
          Only 4 planner slots left this week
        </p>
      </div>
    </section>
  );
}
