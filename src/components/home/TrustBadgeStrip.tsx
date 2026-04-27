import { Clock, ShieldCheck, Star, Users, BadgeIndianRupee } from "lucide-react";

const BADGES = [
  { icon: Clock,            label: "Itinerary in 24 hours",    sub: "From a real planner" },
  { icon: BadgeIndianRupee, label: "₹0 to start",              sub: "No card. Pay only when sure." },
  { icon: Star,             label: "4.9 / 5 on Google",        sub: "200+ verified reviews" },
  { icon: Users,            label: "8,000+ happy travelers",   sub: "Since 2019, across 60 countries" },
  { icon: ShieldCheck,      label: "Free changes within 48 h", sub: "After itinerary, before booking" },
];

const ACCREDITATIONS = [
  { label: "Govt. of India · Recognized" },
  { label: "IATA Verified" },
  { label: "TAAI Member" },
  { label: "Ministry of Tourism" },
];

export default function TrustBadgeStrip() {
  return (
    <section
      aria-label="Why travelers trust us"
      className="bg-tat-paper border-y border-tat-charcoal/8"
    >
      <div className="container-custom py-6 md:py-8">
        <ul
          role="list"
          className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-5"
        >
          {BADGES.map(({ icon: Icon, label, sub }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 md:py-3 bg-tat-cream-warm/50 border border-tat-charcoal/5"
            >
              <span className="shrink-0 h-9 w-9 rounded-full bg-tat-gold/15 text-tat-gold flex items-center justify-center">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] md:text-[13px] font-semibold text-tat-charcoal leading-tight truncate">
                  {label}
                </p>
                <p className="text-[10px] md:text-[11px] text-tat-charcoal/55 leading-tight truncate">
                  {sub}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 pt-4 border-t border-tat-charcoal/8 flex flex-wrap items-center justify-center gap-2 md:gap-3">
          <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-tat-charcoal/45">
            Recognised by
          </span>
          {ACCREDITATIONS.map((a) => (
            <span
              key={a.label}
              className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-medium text-tat-charcoal/70 px-2.5 py-1 rounded-full border border-tat-charcoal/15 bg-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-tat-gold" aria-hidden />
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
