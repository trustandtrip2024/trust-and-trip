"use client";

import Link from "next/link";
import { Heart, ArrowRight, PackageSearch } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import PackageCard from "@/components/PackageCard";
import type { Package } from "@/lib/data";
import { captureIntent } from "@/lib/capture-intent";

export default function WishlistClient({ allPackages }: { allPackages: Package[] }) {
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
            <div className="text-center py-24 max-w-md mx-auto">
              <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-9 w-9 text-red-300" />
              </div>
              <h2 className="font-display text-2xl font-medium mb-3">Nothing saved yet</h2>
              <p className="text-tat-charcoal/60 mb-8 leading-relaxed">
                Browse our packages and tap the heart icon to save the ones you love.
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
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
