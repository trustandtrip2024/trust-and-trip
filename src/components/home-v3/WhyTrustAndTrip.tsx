import { Check, X } from "lucide-react";

interface Row {
  topic: string;
  others: string;
  us: string;
}

const ROWS: Row[] = [
  {
    topic: "Itinerary",
    others: "Copy-paste templates, same as everyone else's",
    us: "Built from a blank page for your group, your pace, your budget",
  },
  {
    topic: "Who you talk to",
    others: "Bots, chatbots, a different person every reply",
    us: "One real planner on WhatsApp, answered in under 9 minutes",
  },
  {
    topic: "Pricing",
    others: "Inflated MRPs, hidden markups, surprises in the small print",
    us: "Line-item quote — hotel category, flight class, every inclusion",
  },
  {
    topic: "Commitment",
    others: "Pay 100% upfront, change-fees buried in the T&Cs",
    us: "₹0 to start. Free changes within 48 h of itinerary",
  },
  {
    topic: "The 100 small things",
    others: "You figure out visas, SIMs, connecting rooms yourself",
    us: "47-point pre-flight checklist · visa nudges · SIM at airport",
  },
];

export default function WhyTrustAndTrip() {
  return (
    <section
      id="why"
      aria-labelledby="why-title"
      className="py-14 md:py-20 bg-tat-paper dark:bg-tat-charcoal scroll-mt-28 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
            Why Trust and Trip
          </p>
          <h2
            id="why-title"
            className="mt-2 font-display font-normal text-[26px] md:text-[36px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
          >
            What sets us{" "}
            <em className="not-italic font-display italic text-tat-gold">apart.</em>
          </h2>
          <p className="mt-3 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70">
            Five things most travel agencies get wrong. Five things we promise to get right.
          </p>
        </div>

        {/* Comparison table — desktop: 3-column grid (topic / others / us)
            with a single bordered card. Mobile: stacked rows where each row
            is a topic header followed by two side-by-side mini cards. */}
        <div className="mt-8 md:mt-10 rounded-2xl bg-tat-cream-warm/40 dark:bg-white/[0.03] ring-1 ring-tat-charcoal/8 dark:ring-white/10 overflow-hidden">
          {/* Header — desktop only */}
          <div className="hidden md:grid grid-cols-[180px_1fr_1fr] gap-px bg-tat-charcoal/8 dark:bg-white/10">
            <div className="px-5 py-3 bg-tat-paper dark:bg-tat-charcoal" />
            <div className="px-5 py-3 bg-tat-paper dark:bg-tat-charcoal text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-charcoal/55 dark:text-tat-paper/55">
              Most travel agencies
            </div>
            <div className="px-5 py-3 bg-tat-gold/10 text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-gold inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-tat-gold" />
              With Trust &amp; Trip
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-tat-charcoal/8 dark:divide-white/10">
            {ROWS.map((r) => (
              <div
                key={r.topic}
                className="grid grid-cols-1 md:grid-cols-[180px_1fr_1fr] md:gap-px md:bg-tat-charcoal/8 md:dark:bg-white/10"
              >
                {/* Topic — full row on mobile, left col on desktop */}
                <div className="px-5 pt-5 pb-2 md:py-5 bg-tat-paper dark:bg-tat-charcoal font-display text-[18px] md:text-[16px] font-medium text-tat-charcoal dark:text-tat-paper">
                  {r.topic}
                </div>
                {/* Others */}
                <div className="px-5 pb-3 md:py-5 bg-tat-paper dark:bg-tat-charcoal flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tat-charcoal/8 dark:bg-white/10 text-tat-charcoal/45 dark:text-tat-paper/45">
                    <X className="h-3 w-3" aria-hidden />
                  </span>
                  <p className="text-[13px] md:text-[14px] leading-relaxed text-tat-charcoal/55 dark:text-tat-paper/50 line-through decoration-tat-charcoal/15 dark:decoration-white/15">
                    {r.others}
                  </p>
                </div>
                {/* Us */}
                <div className="px-5 pt-3 pb-5 md:py-5 bg-tat-gold/[0.06] dark:bg-tat-gold/10 flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tat-gold text-white">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  <p className="text-[13px] md:text-[14px] leading-relaxed font-medium text-tat-charcoal dark:text-tat-paper">
                    {r.us}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
