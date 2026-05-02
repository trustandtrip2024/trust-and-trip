"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, History, Heart, Star } from "lucide-react";
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

/**
 * Returning-visitor rail. Shown above the main shelves only when the
 * persisted wishlist store has any of:
 *   - recentlyViewed slugs, OR
 *   - wishlisted slugs
 * Recent wins; wishlist fills any remaining slots up to 6.
 *
 * Hidden entirely on first-time visits — no empty state, no cold-start
 * placeholder. Lets the homepage rearrange itself for known users
 * without confusing first-timers.
 */
export default function HomeContinuePlanning() {
  const recentlyViewed = useWishlistStore((s) => s.recentlyViewed);
  const wishlist = useWishlistStore((s) => s.wishlist);
  const [items, setItems] = useState<MiniPackage[] | null>(null);

  // Merge recent + wishlist, dedup, cap at 6.
  const slugs = Array.from(new Set([...recentlyViewed, ...wishlist])).slice(0, 6);

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
    // Re-fetch only when the slug list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join(",")]);

  if (!items || items.length === 0) return null;

  const recentSet = new Set(recentlyViewed);
  const heading =
    recentlyViewed.length > 0 ? "Pick up where you left off." : "Your saved trips.";

  return (
    <section
      aria-label="Continue planning"
      className="py-12 md:py-16 bg-white border-t border-tat-charcoal/8"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-3 mb-5">
          <div>
            <span className="eyebrow inline-flex items-center gap-1.5">
              <History className="h-3 w-3" />
              Continue planning
            </span>
            <h2 className="font-display text-[24px] md:text-[30px] font-medium text-tat-charcoal leading-tight mt-1">
              <span className="italic text-tat-gold font-light">{heading.split(" ")[0]}</span>{" "}
              {heading.split(" ").slice(1).join(" ")}
            </h2>
          </div>
          <Link
            href="/packages"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-tat-charcoal/70 hover:text-tat-charcoal transition-colors"
          >
            Browse all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ul
          role="list"
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
        >
          {items.map((p) => {
            const isWishlisted = !recentSet.has(p.slug);
            return (
              <li key={p.slug} className="shrink-0 w-[230px] md:w-[260px]">
                <Link
                  href={`/packages/${p.slug}`}
                  className="group block rounded-2xl overflow-hidden bg-white border border-tat-charcoal/8 hover:border-tat-charcoal/25 hover:shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
                >
                  <div className="relative h-32 md:h-36 overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="260px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    {isWishlisted && (
                      <span
                        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-tat-charcoal"
                        aria-label="Saved to wishlist"
                      >
                        <Heart className="h-3 w-3 fill-tat-orange text-tat-orange" aria-hidden />
                        Saved
                      </span>
                    )}
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
                        <Clock className="h-3 w-3" aria-hidden />
                        {p.duration || "—"}
                      </span>
                      {typeof p.rating === "number" && (
                        <span className="inline-flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-tat-gold text-tat-gold" aria-hidden />
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
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
