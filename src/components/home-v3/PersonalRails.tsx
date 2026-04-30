"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, History } from "lucide-react";
import PackageCard, { type PackageCardProps } from "@/components/ui/PackageCard";
import { useWishlistStore } from "@/store/useWishlistStore";

interface Props {
  packagesBySlug: Record<string, PackageCardProps>;
}

export default function PersonalRails({ packagesBySlug }: Props) {
  const { wishlist, recentlyViewed } = useWishlistStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

  const savedItems = wishlist
    .map((slug) => packagesBySlug[slug])
    .filter((p): p is PackageCardProps => Boolean(p));
  const recentItems = recentlyViewed
    .filter((slug) => !wishlist.includes(slug))
    .map((slug) => packagesBySlug[slug])
    .filter((p): p is PackageCardProps => Boolean(p));

  if (!savedItems.length && !recentItems.length) return null;

  return (
    <section
      aria-labelledby="personal-rails-title"
      className="py-10 md:py-14 bg-tat-cream-warm/40 dark:bg-tat-charcoal/95 scroll-mt-44 lg:scroll-mt-32"
    >
      <div className="container-custom flex flex-col gap-10">
        <h2 id="personal-rails-title" className="sr-only">
          Picked up where you left off
        </h2>

        {savedItems.length > 0 && (
          <Rail
            icon="heart"
            eyebrow="Your saved trips"
            title="Ready when you are"
            ctaHref="/wishlist"
            ctaLabel="See all saved"
            items={savedItems}
          />
        )}

        {recentItems.length > 0 && (
          <Rail
            icon="history"
            eyebrow="Recently viewed"
            title="Pick up where you left off"
            ctaHref="/packages"
            ctaLabel="Browse more"
            items={recentItems}
          />
        )}
      </div>
    </section>
  );
}

function Rail({
  icon, eyebrow, title, ctaHref, ctaLabel, items,
}: {
  icon: "heart" | "history";
  eyebrow: string;
  title: string;
  ctaHref: string;
  ctaLabel: string;
  items: PackageCardProps[];
}) {
  const Icon = icon === "heart" ? Heart : History;
  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold inline-flex items-center gap-1.5">
            <Icon className="h-3 w-3" aria-hidden />
            {eyebrow}
          </p>
          <h3 className="mt-2 font-display font-normal text-[22px] md:text-[28px] leading-tight text-tat-charcoal dark:text-tat-paper">
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

      <div className="mt-5 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
        <ul className="flex gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0 items-stretch">
          {items.map((p) => (
            <li
              key={p.href}
              className="shrink-0 snap-start flex w-[80%] sm:w-[55%] md:w-[40%] lg:w-[28%] xl:w-[22%]"
            >
              <PackageCard {...p} density="compact" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
