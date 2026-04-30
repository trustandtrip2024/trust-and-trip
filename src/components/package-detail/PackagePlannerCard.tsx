"use client";

import { Phone, MessageCircle, Sparkles, Clock } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

interface Props {
  destinationName: string;
  packageTitle: string;
  waNumber: string;
}

/**
 * "Meet your planner" mid-page humanization block. Travel agents win on
 * trust + tailoring; this collapses both into one sticky-CTA-friendly card.
 *
 * The named planner is a brand persona (Akash Mishra, founder) — every trip
 * is touched by the in-house team, but giving the team a face is what
 * separates a real agency from a marketplace listing in the customer's mind.
 */
export default function PackagePlannerCard({
  destinationName, packageTitle, waNumber,
}: Props) {
  const { open: openPlanner } = useTripPlanner();

  const waMessage = encodeURIComponent(
    `Hi Akash! I'm looking at "${packageTitle}" for ${destinationName}. Could you tell me a bit more before I commit?`
  );
  const waHref = `https://wa.me/${waNumber}?text=${waMessage}`;

  function askAria() {
    if (typeof window === "undefined") return;
    const msg = `Tell me what makes "${packageTitle}" different from other ${destinationName} trips, and what I should ask the planner.`;
    try {
      window.sessionStorage.setItem("tt_aria_text_preload", msg);
    } catch {}
    window.dispatchEvent(new CustomEvent("tt:aria-open"));
  }

  return (
    <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <div className="rounded-3xl bg-gradient-to-br from-tat-cream-warm/60 via-tat-paper to-tat-cream-warm/30 dark:from-white/[0.04] dark:via-tat-charcoal dark:to-white/[0.02] ring-1 ring-tat-gold/20 p-5 md:p-7">
        <div className="flex items-start gap-4 md:gap-5">
          {/* Avatar — initials mark in brand teal */}
          <div className="shrink-0 relative">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-tat-teal text-white grid place-items-center font-display text-xl md:text-2xl font-medium ring-2 ring-tat-gold/40">
              AM
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-tat-success-bg ring-2 ring-tat-paper dark:ring-tat-charcoal"
              aria-label="Online"
              title="Online now"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Meet your planner
            </p>
            <h3 className="mt-1 font-display text-[20px] md:text-[24px] font-medium text-tat-charcoal dark:text-tat-paper leading-tight">
              Akash Mishra,{" "}
              <span className="italic font-display font-light text-tat-gold">
                founder &amp; head planner.
              </span>
            </h3>
            <p className="mt-2 text-[13px] md:text-[14px] leading-relaxed text-tat-charcoal/70 dark:text-tat-paper/70">
              Hi! I&rsquo;ll be the one drafting your {destinationName} itinerary
              from scratch — flexing pace, hotels and inclusions to fit your
              group. Ask me anything before you commit, on WhatsApp or Aria.
            </p>

            {/* Stats row — 3 quiet proof points */}
            <ul className="mt-4 flex flex-wrap items-center gap-3 md:gap-5 text-[11.5px] md:text-[12px] text-tat-charcoal/70 dark:text-tat-paper/70">
              <li className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-tat-gold" />
                <span>200+ trips to {destinationName}</span>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-tat-gold" />
                <span>Avg. response under 9 minutes</span>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-tat-gold" />
                <span>One planner, all trip long</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA row */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-11 rounded-full bg-whatsapp hover:bg-whatsapp-deep text-white text-[13px] font-semibold transition-colors"
          >
            <MessageCircle className="h-4 w-4 fill-white" />
            Chat with Akash
          </a>
          <button
            type="button"
            onClick={askAria}
            className="inline-flex items-center justify-center gap-2 h-11 rounded-full bg-tat-gold/15 hover:bg-tat-gold/25 text-tat-gold text-[13px] font-semibold transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Ask Aria first
          </button>
          <button
            type="button"
            onClick={() => openPlanner({ destinationName })}
            className="inline-flex items-center justify-center gap-2 h-11 rounded-full bg-tat-charcoal hover:bg-tat-charcoal/90 text-white text-[13px] font-semibold transition-colors"
          >
            <Phone className="h-4 w-4" />
            Request a call back
          </button>
        </div>
      </div>
    </section>
  );
}
