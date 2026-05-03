"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import PackageCard, { type PackageCardProps } from "@/components/ui/PackageCard";
import ShelfRail, { HOME_RAIL_ITEM } from "@/components/ui/ShelfRail";
import { useWishlistStore } from "@/store/useWishlistStore";

interface Props {
  packagesBySlug: Record<string, PackageCardProps>;
}

// Saved-trips rail only. The Recently-viewed rail was removed because it
// duplicated browsing intent already covered by the trending shelves and
// often surfaced trips the visitor had already rejected (e.g. clicked
// once to confirm a price was too high). Saved trips remain because
// they're an explicit signal of intent.
export default function PersonalRails({ packagesBySlug }: Props) {
  const { wishlist } = useWishlistStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    const seen = typeof window !== "undefined" && localStorage.getItem("ttp-wishlist");
    if (!seen) return null;
    return (
      <section
        aria-hidden
        className="py-12 md:py-16 bg-tat-cream-warm/40 dark:bg-tat-charcoal/95"
      >
        <div className="container-custom">
          <div className="h-3 w-32 bg-tat-charcoal/8 rounded animate-pulse" />
          <div className="mt-3 h-6 w-72 bg-tat-charcoal/8 rounded animate-pulse" />
          <div className="mt-7 flex gap-4 lg:gap-5 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[78%] sm:w-[44%] lg:w-[31%] aspect-[4/3] rounded-2xl bg-tat-charcoal/8 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const savedItems = wishlist
    .map((slug) => packagesBySlug[slug])
    .filter((p): p is PackageCardProps => Boolean(p));

  if (!savedItems.length) return null;

  return (
    <section
      aria-labelledby="personal-rails-title"
      className="py-12 md:py-16 bg-tat-cream-warm/40 dark:bg-tat-charcoal/95 scroll-mt-28 lg:scroll-mt-32"
    >
      <div className="container-custom flex flex-col gap-10">
        <h2 id="personal-rails-title" className="sr-only">
          Your saved trips
        </h2>
        <Rail
          eyebrow="Your saved trips"
          title="Ready when you are"
          ctaHref="/wishlist"
          ctaLabel="See all saved"
          items={savedItems}
        />
      </div>
    </section>
  );
}

function Rail({
  eyebrow, title, ctaHref, ctaLabel, items,
}: {
  eyebrow: string;
  title: string;
  ctaHref: string;
  ctaLabel: string;
  items: PackageCardProps[];
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold inline-flex items-center gap-1.5">
            <Heart className="h-3 w-3" aria-hidden />
            {eyebrow}
          </p>
          <h3 className="mt-2 font-display font-normal text-[24px] md:text-[30px] leading-tight text-tat-charcoal dark:text-tat-paper">
            {title}
          </h3>
        </div>
        <Link
          href={ctaHref}
          prefetch={false}
          className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-7 -mx-5 px-5 lg:mx-0 lg:px-0">
        <ShelfRail ariaLabel={title}>
          {items.map((p) => (
            <li
              key={p.href}
              className={HOME_RAIL_ITEM}
            >
              <PackageCard {...p} density="compact" />
            </li>
          ))}
        </ShelfRail>
      </div>
    </div>
  );
}
