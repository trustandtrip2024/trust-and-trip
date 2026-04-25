import { Star, Users, Award, Headphones, ShieldCheck } from "lucide-react";

const BADGES = [
  { icon: Users, value: "10,000+", label: "happy travellers" },
  { icon: Star, value: "4.8", label: "Google rating", accent: true },
  { icon: ShieldCheck, value: "IATO", label: "certified member" },
  { icon: Award, value: "ISO 9001", label: "quality-audited" },
  { icon: Headphones, value: "24/7", label: "on-trip support" },
];

export default function TrustRow() {
  return (
    <section
      aria-label="Trust at a glance"
      className="relative mt-6 md:-mt-16 z-30 container-custom"
    >
      <div className="bg-white rounded-2xl md:rounded-3xl border border-tat-charcoal/8 shadow-soft px-4 md:px-8 py-4 md:py-6">
        <ul className="flex items-center md:justify-between gap-4 md:gap-6 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
          {BADGES.map(({ icon: Icon, value, label, accent }, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 md:gap-3 shrink-0 snap-start"
            >
              <div
                className={`h-9 w-9 md:h-10 md:w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  accent ? "bg-tat-gold/15 text-tat-gold" : "bg-tat-charcoal/5 text-tat-charcoal/70"
                }`}
              >
                <Icon className={`h-4 w-4 md:h-[18px] md:w-[18px] ${accent ? "fill-tat-gold" : ""}`} />
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm md:text-base font-medium text-tat-charcoal leading-tight whitespace-nowrap">
                  {value}
                </p>
                <p className="text-[10px] md:text-[11px] text-tat-charcoal/70 leading-tight whitespace-nowrap">
                  {label}
                </p>
              </div>
              {i < BADGES.length - 1 && (
                <span className="hidden md:block h-8 w-px bg-tat-charcoal/8 ml-3 md:ml-6" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
