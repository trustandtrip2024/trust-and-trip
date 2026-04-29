"use client";

import Link from "next/link";
import { MessageCircle, Download, Mail } from "lucide-react";
import { captureIntent } from "@/lib/capture-intent";

interface Props {
  packageTitle: string;
  packageSlug: string;
  packagePrice: number;
  duration: string;
}

/**
 * Three-up action row that mirrors the Veena-style "Send Itinerary /
 * Download Brochure / Email Itinerary" block but routed through real Trust
 * and Trip channels: WhatsApp message, PDF brochure download (per-package
 * route, falls back to a customised mailto), and email itinerary capture.
 *
 * Sits directly under the hero / includes ribbon as a high-visibility,
 * low-commitment CTA before the user dives into itinerary detail.
 */
export default function QuickActionRow({
  packageTitle, packageSlug, packagePrice, duration,
}: Props) {
  const waText = encodeURIComponent(
    `Hi Trust and Trip 🙏\n\nPlease send me the full itinerary for *${packageTitle}* (${duration} · ₹${packagePrice.toLocaleString("en-IN")}/person).\n\nThanks!`
  );
  const waUrl = `https://wa.me/918115999588?text=${waText}`;
  const brochureUrl = `/api/brochure/${encodeURIComponent(packageSlug)}`;
  const mailto = `mailto:plan@trustandtrip.com?subject=${encodeURIComponent(
    `Email itinerary — ${packageTitle}`
  )}&body=${encodeURIComponent(
    `Hi planner,\n\nPlease email me the full itinerary for ${packageTitle} (${duration}).\n\nMy email: \nMy phone: \n\nThanks!`
  )}`;

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 rounded-2xl border border-tat-charcoal/8 dark:border-white/10 bg-tat-cream-warm/40 dark:bg-white/5 p-2 md:p-3">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => captureIntent("whatsapp_click", { note: "Pkg detail · send itinerary" })}
        className="group/q flex flex-col items-center gap-1.5 py-3 md:py-4 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors"
      >
        <span className="grid place-items-center h-9 w-9 rounded-full bg-whatsapp/15 group-hover/q:bg-whatsapp/25 transition-colors">
          <MessageCircle className="h-4 w-4 fill-whatsapp text-whatsapp" />
        </span>
        <span className="text-[11px] md:text-[12px] font-semibold text-tat-charcoal dark:text-tat-paper">
          Send Itinerary
        </span>
        <span className="text-[10px] text-tat-charcoal/55 dark:text-tat-paper/55 text-center leading-tight hidden md:block">
          On WhatsApp · 2 min
        </span>
      </a>

      <a
        href={brochureUrl}
        download
        className="group/q flex flex-col items-center gap-1.5 py-3 md:py-4 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors border-x border-tat-charcoal/8 dark:border-white/10"
      >
        <span className="grid place-items-center h-9 w-9 rounded-full bg-tat-gold/12 group-hover/q:bg-tat-gold/20 transition-colors">
          <Download className="h-4 w-4 text-tat-gold dark:text-tat-gold" />
        </span>
        <span className="text-[11px] md:text-[12px] font-semibold text-tat-charcoal dark:text-tat-paper">
          Download Brochure
        </span>
        <span className="text-[10px] text-tat-charcoal/55 dark:text-tat-paper/55 text-center leading-tight hidden md:block">
          PDF · ~1 MB
        </span>
      </a>

      <Link
        href={mailto}
        className="group/q flex flex-col items-center gap-1.5 py-3 md:py-4 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors"
      >
        <span className="grid place-items-center h-9 w-9 rounded-full bg-tat-teal/15 group-hover/q:bg-tat-teal/25 transition-colors">
          <Mail className="h-4 w-4 text-tat-teal dark:text-tat-paper" />
        </span>
        <span className="text-[11px] md:text-[12px] font-semibold text-tat-charcoal dark:text-tat-paper">
          Email Itinerary
        </span>
        <span className="text-[10px] text-tat-charcoal/55 dark:text-tat-paper/55 text-center leading-tight hidden md:block">
          Reply within 24 h
        </span>
      </Link>
    </div>
  );
}
