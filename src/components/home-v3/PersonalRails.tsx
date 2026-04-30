"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, History, Sparkles } from "lucide-react";
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
            tail={savedItems.length === 0 ? <SaveHintCard /> : null}
          />
        )}
      </div>
    </section>
  );
}

function SaveHintCard() {
  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl bg-gradient-to-br from-tat-gold/15 to-tat-orange/10 ring-1 ring-tat-gold/30 p-5 md:p-6 justify-between">
      <div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-tat-orange shadow-sm">
          <Heart className="h-5 w-5 fill-tat-orange" />
        </span>
        <h4 className="mt-3 font-display font-medium text-[17px] md:text-[19px] leading-tight text-tat-charcoal">
          Save trips you love
        </h4>
        <p className="mt-2 text-[13px] text-tat-charcoal/70 leading-snug">
          Tap the heart on any trip and they&apos;ll show up here next time — perfect for narrowing down with the family.
        </p>
      </div>
      <Link
        href="/packages"
        prefetch={false}
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-tat-orange hover:underline underline-offset-4"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Browse trips to save
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function Rail({
  icon, eyebrow, title, ctaHref, ctaLabel, items, tail,
}: {
  icon: "heart" | "history";
  eyebrow: string;
  title: string;
  ctaHref: string;
  ctaLabel: string;
  items: PackageCardProps[];
  tail?: React.ReactNode;
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

      <div className="mt-7 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
        <ul className="flex gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0 items-stretch">
          {items.map((p) => (
            <li
              key={p.href}
              className="shrink-0 snap-start flex w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[24%]"
            >
              <PackageCard {...p} density="compact" />
            </li>
          ))}
          {tail && (
            <li className="shrink-0 snap-start flex w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[24%]">
              {tail}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
