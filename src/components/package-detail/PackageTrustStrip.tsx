import { ShieldCheck, BadgeIndianRupee, Lock, Clock } from "lucide-react";

const ITEMS = [
  { icon: BadgeIndianRupee, label: "₹0 to start",          sub: "No card to receive itinerary" },
  { icon: Clock,            label: "Free changes 48h",     sub: "After itinerary, before booking" },
  { icon: ShieldCheck,      label: "30% deposit only",     sub: "Min ₹5,000. Balance on confirm." },
  { icon: Lock,             label: "Razorpay-secure",      sub: "UPI · cards · net-banking" },
];

/**
 * Quiet trust strip rendered immediately under the price block in the
 * sticky sidebar (and as a one-line variant under the mobile sticky bar).
 * Pure server component, no JS.
 */
export default function PackageTrustStrip({ compact = false }: { compact?: boolean } = {}) {
  if (compact) {
    return (
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-tat-charcoal/60 dark:text-tat-paper/60">
        {ITEMS.map(({ icon: Icon, label }) => (
          <li key={label} className="inline-flex items-center gap-1">
            <Icon className="h-3 w-3 text-tat-burnt dark:text-tat-gold" aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-2.5">
      {ITEMS.map(({ icon: Icon, label, sub }) => (
        <li
          key={label}
          className="flex items-start gap-2 rounded-md bg-tat-cream-warm/40 dark:bg-white/5 ring-1 ring-tat-charcoal/5 dark:ring-white/10 p-2.5"
        >
          <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-tat-burnt dark:text-tat-gold" aria-hidden />
          <div className="min-w-0">
            <p className="text-[11.5px] font-semibold text-tat-charcoal dark:text-tat-paper leading-tight">
              {label}
            </p>
            <p className="text-[10.5px] text-tat-charcoal/55 dark:text-tat-paper/55 leading-tight mt-0.5">
              {sub}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
