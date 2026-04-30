"use client";

import Link from "next/link";
import { Heart, ArrowRight, PackageSearch } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import PackageCard from "@/components/PackageCard";
import type { Package } from "@/lib/data";
import { captureIntent } from "@/lib/capture-intent";

export default function WishlistClient({
  allPackages,
  trendingPicks,
}: {
  allPackages: Package[];
  trendingPicks: Package[];
}) {
  const { wishlist } = useWishlistStore();
  const saved = allPackages.filter((p) => wishlist.includes(p.slug));

  return (
    <>
      <section className="pt-28 md:pt-36 pb-10 bg-tat-paper border-b border-tat-charcoal/5">
        <div className="container-custom">
          <span className="eyebrow">Your Wishlist</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-3xl text-balance">
            Trips you're
            <span className="italic text-tat-gold font-light"> dreaming about.</span>
          </h1>
          <p className="mt-4 text-tat-charcoal/60 max-w-xl leading-relaxed">
            {saved.length > 0
              ? `${saved.length} package${saved.length > 1 ? "s" : ""} saved. Ready to turn them into a real trip?`
              : "Heart any package to save it here for later."}
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-custom">
          {saved.length === 0 ? (
            <>
              <div className="text-center py-16 max-w-md mx-auto">
                <div className="h-20 w-20 rounded-full bg-tat-orange/10 flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-9 w-9 text-tat-orange/60" />
                </div>
                <h2 className="font-display text-h2 font-medium mb-3">Nothing saved yet</h2>
                <p className="text-tat-charcoal/60 mb-8 leading-relaxed">
                  Tap the heart on any package to save it here for later.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/packages" className="btn-primary">
                    <PackageSearch className="h-4 w-4" />
                    Browse Packages
                  </Link>
                  <Link href="/customize-trip" className="btn-outline">
                    Build a custom trip
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {trendingPicks.length > 0 && (
                <div className="mt-10 pt-12 border-t border-tat-charcoal/8">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <span className="eyebrow">Trending right now</span>
                      <h3 className="mt-1.5 font-display text-h3 font-medium">
                        Travelers are loving these
                      </h3>
                    </div>
                    <Link href="/packages" className="hidden md:inline-flex items-center gap-1 text-sm text-tat-gold hover:underline">
                      See all <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {trendingPicks.map((p, i) => (
                      <PackageCard
                        key={p.slug}
                        title={p.title}
                        slug={p.slug}
                        image={p.image}
                        duration={p.duration}
                        price={p.price}
                        rating={p.rating}
                        reviews={p.reviews}
                        destinationName={p.destinationName}
                        travelType={p.travelType}
                        trending={p.trending}
                        limitedSlots={p.limitedSlots}
                        highlights={p.highlights}
                        inclusions={p.inclusions}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {saved.map((p, i) => (
                  <PackageCard
                    key={p.slug}
                    title={p.title}
                    slug={p.slug}
                    image={p.image}
                    duration={p.duration}
                    price={p.price}
                    rating={p.rating}
                    reviews={p.reviews}
                    destinationName={p.destinationName}
                    travelType={p.travelType}
                    trending={p.trending}
                    limitedSlots={p.limitedSlots}
                    highlights={p.highlights}
                    inclusions={p.inclusions}
                    index={i}
                  />
                ))}
              </div>

              <div className="mt-14 text-center">
                <p className="text-tat-charcoal/50 text-sm mb-4">Ready to book? Talk to a planner.</p>
                <a
                  href={`https://wa.me/918115999588?text=${encodeURIComponent(
                    `Hi Trust and Trip! 🙏\n\nI've saved these packages on my wishlist:\n${saved.map((p) => `• ${p.title} (₹${p.price.toLocaleString("en-IN")})`).join("\n")}\n\nCan you help me decide or customise one of these?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    captureIntent("whatsapp_click", {
                      note: `Wishlist share · ${saved.length} pkg(s): ${saved.map((p) => p.title).join(", ")}`,
                    })
                  }
                  className="btn-gold inline-flex"
                >
                  Share wishlist on WhatsApp
                </a>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
