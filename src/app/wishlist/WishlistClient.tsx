"use client";

import Link from "next/link";
import { Heart, ArrowRight, PackageSearch, MessageCircle, Sparkles, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import PackageCard from "@/components/PackageCard";
import type { Package } from "@/lib/data";
import { captureIntent } from "@/lib/capture-intent";
import { useTripPlanner } from "@/context/TripPlannerContext";

export default function WishlistClient({
  allPackages,
  trendingPicks,
}: {
  allPackages: Package[];
  trendingPicks: Package[];
}) {
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { open: openPlanner } = useTripPlanner();
  const saved = allPackages.filter((p) => wishlist.includes(p.slug));

  const waMessage = saved.length === 0 ? "" : encodeURIComponent(
    `Hi Trust and Trip! 🙏\n\nI've saved these packages on my wishlist:\n${saved.map((p) => `• ${p.title} (₹${p.price.toLocaleString("en-IN")})`).join("\n")}\n\nCan you help me decide or customise one of these?`
  );

  function askAriaToCompare() {
    if (typeof window === "undefined" || saved.length === 0) return;
    const list = saved.map((p) => `"${p.title}"`).join(", ");
    const msg = `I've saved these on my wishlist: ${list}. Help me compare them and pick one.`;
    try { window.sessionStorage.setItem("tt_aria_text_preload", msg); } catch {}
    window.dispatchEvent(new CustomEvent("tt:aria-open"));
  }

  function clearAll() {
    if (typeof window !== "undefined" && !window.confirm("Clear all saved packages?")) return;
    saved.forEach((p) => toggleWishlist(p.slug));
  }

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
              {/* Top action bar — surfaces planner-bundle CTAs immediately
                  so the user doesn't have to scroll past their list to
                  convert. Sticky beneath site header. */}
              <div className="sticky top-16 lg:top-20 z-20 -mx-5 px-5 sm:mx-0 sm:px-0 mb-6">
                <div className="rounded-2xl bg-white ring-1 ring-tat-charcoal/10 shadow-soft p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tat-gold/15 text-tat-gold">
                      <Heart className="h-4 w-4 fill-tat-gold" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-tat-charcoal leading-tight">
                        {saved.length} {saved.length === 1 ? "package" : "packages"} saved
                      </p>
                      <p className="text-[11px] text-tat-charcoal/55 truncate">
                        Bundle them and a planner will compare in one quote.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 ml-auto w-full sm:w-auto">
                    <a
                      href={`https://wa.me/918115999588?text=${waMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        captureIntent("whatsapp_click", {
                          note: `Wishlist top bar · ${saved.length} pkg(s)`,
                        })
                      }
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full bg-whatsapp hover:bg-whatsapp-deep text-white text-[12px] font-semibold transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5 fill-white" />
                      WhatsApp wishlist
                    </a>
                    <button
                      type="button"
                      onClick={askAriaToCompare}
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full bg-tat-gold/15 hover:bg-tat-gold/25 text-tat-gold text-[12px] font-semibold transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Compare with Aria
                    </button>
                    <button
                      type="button"
                      onClick={() => openPlanner()}
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full bg-tat-teal hover:bg-tat-teal-deep text-white text-[12px] font-semibold transition-colors"
                    >
                      Plan a trip
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={clearAll}
                      aria-label="Clear all saved"
                      className="inline-flex items-center justify-center gap-1 h-9 px-2.5 rounded-full text-tat-charcoal/55 hover:text-tat-charcoal hover:bg-tat-charcoal/8 text-[12px]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  </div>
                </div>
              </div>

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
