"use client";

import { Clock, ShieldCheck, Star, Users, BadgeIndianRupee } from "lucide-react";

const BADGES = [
  { icon: Clock,            label: "Itinerary in 24 hours",    sub: "From a real planner" },
  { icon: BadgeIndianRupee, label: "₹0 to start",              sub: "No card. Pay only when sure." },
  { icon: Star,             label: "4.9 / 5 on Google",        sub: "200+ verified reviews" },
  { icon: Users,            label: "8,000+ happy travelers",   sub: "Since 2019, across 60 countries" },
  { icon: ShieldCheck,      label: "Free changes within 48 h", sub: "After itinerary, before booking" },
];

// Mix of regulator/industry recognitions and partner tourism boards.
// Logo assets aren't shipped — render branded text pills instead.
const BOARDS = [
  { label: "Govt. of India · Recognized", tone: "regulator" as const },
  { label: "IATA Verified",               tone: "regulator" as const },
  { label: "TAAI Member",                 tone: "regulator" as const },
  { label: "Ministry of Tourism, India",  tone: "regulator" as const },
  { label: "Tourism Australia",           tone: "country"   as const },
  { label: "Singapore Tourism Board",     tone: "country"   as const },
  { label: "Switzerland Tourism",         tone: "country"   as const },
  { label: "Visit Maldives",              tone: "country"   as const },
  { label: "Indonesia · Wonderful Bali",  tone: "country"   as const },
  { label: "Tourism Authority Thailand",  tone: "country"   as const },
  { label: "Sri Lanka Tourism",           tone: "country"   as const },
  { label: "Visit Dubai",                 tone: "country"   as const },
  { label: "Japan National Tourism Org.", tone: "country"   as const },
  { label: "Tourism Malaysia",            tone: "country"   as const },
  { label: "Vietnam · Timeless Charm",    tone: "country"   as const },
];

function BadgeCard({
  Icon,
  label,
  sub,
}: {
  Icon: typeof Clock;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 md:py-3 bg-tat-cream-warm/50 border border-tat-charcoal/5 dark:bg-white/5 dark:border-white/10">
      <span className="shrink-0 h-9 w-9 rounded-full bg-tat-gold/15 text-tat-gold flex items-center justify-center">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] md:text-[13px] font-semibold text-tat-charcoal dark:text-white leading-tight truncate">
          {label}
        </p>
        <p className="text-[10px] md:text-[11px] text-tat-charcoal/60 dark:text-white/65 leading-tight truncate">
          {sub}
        </p>
      </div>
    </div>
  );
}

function BoardPill({ label, tone }: { label: string; tone: "regulator" | "country" }) {
  return (
    <span
      className={
        "inline-flex shrink-0 items-center gap-1.5 text-[10px] md:text-[11px] font-medium px-2.5 py-1 rounded-full border " +
        (tone === "regulator"
          ? "bg-white text-tat-charcoal/75 border-tat-charcoal/15 dark:bg-white/10 dark:text-white/85 dark:border-white/15"
          : "bg-tat-cream-warm/60 text-tat-charcoal/75 border-tat-orange/30 dark:bg-tat-orange/10 dark:text-white/85 dark:border-tat-orange/40")
      }
    >
      <span
        className={
          "h-1.5 w-1.5 rounded-full " +
          (tone === "regulator" ? "bg-tat-gold" : "bg-tat-orange")
        }
        aria-hidden
      />
      {label}
    </span>
  );
}

export default function TrustBadgeStrip() {
  return (
    <section
      aria-label="Why travelers trust us"
      className="bg-tat-paper border-y border-tat-charcoal/8 dark:bg-tat-charcoal dark:border-white/10"
    >
      <div className="container-custom py-6 md:py-8">
        {/* Stats row — marquee on mobile, grid on desktop */}
        <div
          className="md:hidden -mx-5 overflow-hidden mask-fade-x"
          aria-hidden={false}
        >
          <ul
            role="list"
            className="flex w-max gap-3 animate-marquee motion-reduce:animate-none px-5"
          >
            {[...BADGES, ...BADGES].map(({ icon: Icon, label, sub }, i) => (
              <li key={`${label}-${i}`} className="w-[230px] shrink-0">
                <BadgeCard Icon={Icon} label={label} sub={sub} />
              </li>
            ))}
          </ul>
        </div>

        <ul
          role="list"
          className="hidden md:grid md:grid-cols-5 gap-5"
        >
          {BADGES.map(({ icon: Icon, label, sub }) => (
            <li key={label}>
              <BadgeCard Icon={Icon} label={label} sub={sub} />
            </li>
          ))}
        </ul>

        {/* Recognised by — marquee with tourism boards */}
        <div className="mt-5 pt-4 border-t border-tat-charcoal/8 dark:border-white/10">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-tat-charcoal/45 dark:text-white/60 text-center mb-3">
            Recognised by · Partner tourism boards
          </p>
          <div className="-mx-5 overflow-hidden mask-fade-x">
            <ul
              role="list"
              className="flex w-max gap-2.5 md:gap-3 animate-marquee motion-reduce:animate-none px-5"
            >
              {[...BOARDS, ...BOARDS].map((b, i) => (
                <li key={`${b.label}-${i}`}>
                  <BoardPill label={b.label} tone={b.tone} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
