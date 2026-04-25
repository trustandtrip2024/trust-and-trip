"use client";

import Link from "next/link";
import PackageSlider from "@/components/PackageSlider";
import type { Package } from "@/lib/data";

interface Tag {
  label: string;
  href: string;
  emoji?: string;
}

interface Props {
  id: string;
  eyebrow: string;
  heading: string;
  tags: Tag[];
  packages: Package[];
  viewAllHref?: string;
  viewAllLabel?: string;
  tagAccent?: "ember" | "gold" | "crimson";
}

const ACCENT: Record<string, string> = {
  ember:   "hover:bg-tat-orange hover:text-tat-paper hover:border-tat-orange",
  gold:    "hover:bg-tat-gold hover:text-tat-charcoal hover:border-tat-gold",
  crimson: "hover:bg-tat-orange hover:text-tat-paper hover:border-tat-orange",
};

export default function TaggedPackageSlider({
  id, eyebrow, heading, tags, packages, viewAllHref, viewAllLabel, tagAccent = "ember",
}: Props) {
  if (!packages.length) return null;
  return (
    <div>
      {/* Tag scroller — horizontal, marquee feel */}
      {tags.length > 0 && (
        <div className="-mx-5 px-5 md:mx-0 md:px-0 mb-5 md:mb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory md:snap-none pb-1">
            {tags.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`shrink-0 snap-start inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full border border-tat-charcoal/12 bg-tat-paper text-tat-charcoal/75 text-xs font-medium tracking-wide transition-all duration-200 ${ACCENT[tagAccent]}`}
              >
                {t.emoji && <span className="text-sm leading-none">{t.emoji}</span>}
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <PackageSlider
        id={id}
        eyebrow={eyebrow}
        heading={heading}
        packages={packages}
        viewAllHref={viewAllHref}
        viewAllLabel={viewAllLabel}
      />
    </div>
  );
}
