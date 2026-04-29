import { Users, Activity, FileCheck2, Globe2 } from "lucide-react";

interface Props {
  groupSize?: { min?: number; max?: number; idealFor?: string };
  difficulty?: "easy" | "moderate" | "challenging" | "extreme";
  visaInfo?: {
    required?: boolean;
    visaType?: string;
    processingDays?: number;
    notes?: string;
  };
  /** Falls back to "International" / "Domestic" hint when destination isn't
   *  obviously one or the other. */
  destinationName: string;
  isInternational?: boolean;
}

const DIFFICULTY_COPY: Record<NonNullable<Props["difficulty"]>, { label: string; sub: string }> = {
  easy:        { label: "Easy",        sub: "Most ages, no fitness req." },
  moderate:    { label: "Moderate",    sub: "Comfortable walking, some altitude" },
  challenging: { label: "Challenging", sub: "Treks / altitude — fit travelers" },
  extreme:     { label: "Extreme",     sub: "Expedition-grade fitness" },
};

/**
 * Top-of-page quick facts strip. Renders 2-4 fact cards depending on
 * which Sanity fields are populated. Returns null when nothing's set so
 * we don't render an empty strip on minimal packages.
 */
export default function PackageQuickFacts({
  groupSize,
  difficulty,
  visaInfo,
  destinationName,
  isInternational = false,
}: Props) {
  const cards: Array<{ icon: typeof Users; label: string; value: string; sub?: string }> = [];

  if (groupSize && (groupSize.min || groupSize.max || groupSize.idealFor)) {
    let value = "Flexible";
    if (groupSize.min && groupSize.max) value = `${groupSize.min}–${groupSize.max} pax`;
    else if (groupSize.max) value = `Up to ${groupSize.max}`;
    else if (groupSize.min) value = `From ${groupSize.min}`;
    cards.push({
      icon: Users,
      label: "Group size",
      value,
      sub: groupSize.idealFor,
    });
  }

  if (difficulty) {
    const d = DIFFICULTY_COPY[difficulty];
    cards.push({ icon: Activity, label: "Difficulty", value: d.label, sub: d.sub });
  }

  if (visaInfo) {
    const r = visaInfo.required;
    let value = "Visa-free";
    let sub = "Indian passport — no visa needed";
    if (r) {
      value = visaInfo.visaType ?? "Visa required";
      sub = visaInfo.processingDays
        ? `~${visaInfo.processingDays} day${visaInfo.processingDays === 1 ? "" : "s"} processing`
        : visaInfo.notes ?? "Indian passport holders apply in advance";
    } else if (visaInfo.visaType) {
      value = visaInfo.visaType;
      sub = visaInfo.notes ?? sub;
    }
    cards.push({ icon: FileCheck2, label: "Visa", value, sub });
  }

  if (cards.length === 0 && isInternational) {
    cards.push({
      icon: Globe2,
      label: "Region",
      value: "International",
      sub: `Travel to ${destinationName}`,
    });
  }

  if (cards.length === 0) return null;

  return (
    <div className="rounded-2xl border border-tat-charcoal/10 bg-white overflow-hidden">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-tat-charcoal/8">
        {cards.map(({ icon: Icon, label, value, sub }) => (
          <li key={label} className="px-5 py-4 flex items-start gap-3">
            <span className="grid place-items-center h-10 w-10 rounded-xl bg-tat-gold/10 ring-1 ring-tat-gold/25 text-tat-gold shrink-0">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-tat-charcoal/55">
                {label}
              </p>
              <p className="font-display text-h4 font-medium text-tat-charcoal leading-tight mt-0.5">
                {value}
              </p>
              {sub && (
                <p className="text-[12px] text-tat-charcoal/60 mt-0.5 leading-snug">{sub}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
