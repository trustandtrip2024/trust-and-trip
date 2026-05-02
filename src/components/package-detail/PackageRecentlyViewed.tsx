"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Star, History } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";

interface MiniPackage {
  slug: string;
  title: string;
  image: string;
  price: number;
  duration: string;
  destinationName: string;
  rating?: number;
}

interface Props {
  /** Current package slug — excluded from the list. */
  currentSlug: string;
}

/**
 * Recently-viewed rail. Reads slugs from the persisted Zustand store
 * (set by PackageViewTracker on every detail page mount), batch-fetches
 * minimal card data via /api/packages/by-slugs, and renders a horizontal
 * strip of up to 4 cards.
 *
 * Hidden when there's nothing to show (first visit, or only the current
 * package in history).
 */
export default function PackageRecentlyViewed({ currentSlug }: Props) {
  const recentlyViewed = useWishlistStore((s) => s.recentlyViewed);
  const [items, setItems] = useState<MiniPackage[] | null>(null);

  const slugs = recentlyViewed.filter((s) => s !== currentSlug).slice(0, 4);

  useEffect(() => {
    if (slugs.length === 0) {
      setItems([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/packages/by-slugs?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setItems(data.packages ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
    // We intentionally key on the joined slug string so re-renders
    // without slug changes don't re-fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join(",")]);

  if (!items || items.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-white border-t border-tat-charcoal/8">
      <div className="container-custom">
        <div className="flex items-end justify-between gap-3 mb-5">
          <div>
            <span className="eyebrow inline-flex items-center gap-1.5">
              <History className="h-3 w-3" />
              You were just looking at
            </span>
            <h2 className="font-display text-[22px] md:text-[26px] font-medium text-tat-charcoal mt-1 leading-tight">
              Pick up where you
              <span className="italic text-tat-gold font-light"> left off.</span>
            </h2>
          </div>
        </div>

        <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/packages/${p.slug}`}
              className="group shrink-0 w-[230px] md:w-[260px] rounded-2xl overflow-hidden bg-white border border-tat-charcoal/8 hover:border-tat-charcoal/25 hover:shadow-soft transition-all"
            >
              <div className="relative h-32 md:h-36 overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="260px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3.5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-tat-charcoal/55 font-medium truncate">
                  {p.destinationName}
                </p>
                <h3 className="font-display text-[14px] font-medium text-tat-charcoal leading-snug line-clamp-2 mt-1 min-h-[36px]">
                  {p.title}
                </h3>
                <div className="flex items-center justify-between mt-2 text-[11px] text-tat-charcoal/65">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {p.duration || "—"}
                  </span>
                  {typeof p.rating === "number" && (
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-tat-gold text-tat-gold" />
                      {p.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="mt-2 pt-2 border-t border-tat-charcoal/8 text-[12px] font-semibold text-tat-charcoal">
                  ₹{p.price.toLocaleString("en-IN")}
                  <span className="text-[10px] font-normal text-tat-charcoal/55"> /person</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
