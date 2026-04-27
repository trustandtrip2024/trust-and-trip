import { Check, X } from "lucide-react";

const ROWS: { feature: string; us: string; them: string }[] = [
  { feature: "Real human planner",      us: "Yes — assigned to your trip",   them: "Generic chat / call center" },
  { feature: "Itinerary turnaround",    us: "24 hours, free",                them: "Pre-built templates only" },
  { feature: "Hidden fees at checkout", us: "Zero — final price is final",   them: "Convenience + service fees" },
  { feature: "Free changes after plan", us: "Within 48 h, no questions",     them: "Reschedule = repay" },
  { feature: "Pay only when sure",      us: "₹0 to start. 30% deposit only", them: "Full payment up front" },
  { feature: "Direct WhatsApp support", us: "On-trip, 24×7, real human",     them: "Tickets + agent rotations" },
];

export default function WhyNotAggregators() {
  return (
    <section
      aria-labelledby="vs-aggregators-title"
      className="bg-tat-paper border-y border-tat-charcoal/8 py-14 md:py-20"
    >
      <div className="container-custom max-w-5xl">
        <div className="text-center mb-10">
          <span className="eyebrow">Why us — not them</span>
          <h2
            id="vs-aggregators-title"
            className="heading-section mt-2 text-balance"
          >
            What you actually get with a
            <span className="italic font-display text-tat-burnt font-normal"> real planner.</span>
          </h2>
          <p className="mt-4 text-tat-charcoal/65 max-w-xl mx-auto text-balance">
            We're not a marketplace. Every itinerary here is hand-built by a planner who's been to the destination — not a script you fill in.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-tat-charcoal/10 bg-white">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] text-[11px] md:text-xs uppercase tracking-[0.18em] font-semibold border-b border-tat-charcoal/10 bg-tat-cream-warm/40">
            <div className="px-3 md:px-5 py-3 text-tat-charcoal/55">Feature</div>
            <div className="px-3 md:px-5 py-3 text-center bg-tat-gold/10 text-tat-charcoal">
              Trust and Trip
            </div>
            <div className="px-3 md:px-5 py-3 text-center text-tat-charcoal/55">
              Aggregators
            </div>
          </div>
          {ROWS.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1.2fr_1fr_1fr] items-stretch text-[12px] md:text-sm ${
                i < ROWS.length - 1 ? "border-b border-tat-charcoal/8" : ""
              }`}
            >
              <div className="px-3 md:px-5 py-3 md:py-4 text-tat-charcoal/80 font-medium">
                {row.feature}
              </div>
              <div className="px-3 md:px-5 py-3 md:py-4 bg-tat-gold/5 flex items-start gap-2 text-tat-charcoal">
                <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" aria-hidden />
                <span>{row.us}</span>
              </div>
              <div className="px-3 md:px-5 py-3 md:py-4 flex items-start gap-2 text-tat-charcoal/55">
                <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" aria-hidden />
                <span>{row.them}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
