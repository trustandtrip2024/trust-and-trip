import Link from "next/link";
import { ArrowRight, Award, Flame, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PackageCard, { type PackageCardProps } from "@/components/ui/PackageCard";

interface Props {
  packages: PackageCardProps[];
}

interface EditorialBadge {
  label: string;
  icon: LucideIcon;
  tone: string;
}

// First three featured cards get a curatorial label so the rail reads as
// editorial picks rather than a flat list. Beyond three the cards stand on
// their own price + rating cues.
const BADGES: (EditorialBadge | null)[] = [
  { label: "Editor's pick",   icon: Award,    tone: "bg-tat-gold text-tat-charcoal" },
  { label: "Most asked",      icon: Flame,    tone: "bg-tat-orange text-white" },
  { label: "Hand-tuned trip", icon: Sparkles, tone: "bg-tat-teal text-white" },
];

export default function FeaturedPackages({ packages }: Props) {
  if (!packages.length) return null;
  const items = packages.slice(0, 8);

  return (
    <section
      id="packages"
      aria-labelledby="featured-pkg-title"
      className="py-14 md:py-20 bg-tat-cream-warm/30 dark:bg-tat-charcoal/95 scroll-mt-44 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Featured trips
            </p>
            <h2
              id="featured-pkg-title"
              className="mt-2 font-display font-normal text-[26px] md:text-[36px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Itineraries we&apos;d send{" "}
              <em className="not-italic font-display italic text-tat-gold">our own family on.</em>
            </h2>
            <p className="mt-3 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70 max-w-2xl">
              Eight trips with full pricing, hotels, and inclusions — every one ready to customise.
            </p>
          </div>
          <Link
            href="/packages"
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            Browse all packages
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-7 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
          <ul className="flex gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0 items-stretch">
            {items.map((p, i) => {
              const badge = BADGES[i] ?? null;
              return (
                <li
                  key={p.href}
                  className="shrink-0 snap-start flex w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[24%]"
                >
                  <div className="relative w-full">
                    {badge && (
                      <span
                        className={`absolute z-10 top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${badge.tone}`}
                      >
                        <badge.icon className="h-3 w-3" aria-hidden />
                        {badge.label}
                      </span>
                    )}
                    <PackageCard {...p} density="compact" />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            Browse all packages
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
