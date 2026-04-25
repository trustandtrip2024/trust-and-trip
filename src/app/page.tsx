export const revalidate = 30;

export const metadata = {
  title: "Trust and Trip – Crafting Reliable Travel",
  description:
    "Trust and Trip crafts reliable, handpicked travel experiences across 60+ destinations. Honeymoons, family holidays, group tours and solo adventures — planned with trust, delivered with care.",
  alternates: { canonical: "https://trustandtrip.com" },
};

import dynamic from "next/dynamic";
import HeroV2 from "@/components/homepage-v2/HeroV2";
import TrustRow from "@/components/homepage-v2/TrustRow";
import PopularDestinations from "@/components/homepage-v2/PopularDestinations";
import HowItWorks from "@/components/homepage-v2/HowItWorks";
import PackageSlider from "@/components/PackageSlider";

// Below-fold — chunk-split, still SSR'd for SEO
const FinalCTA = dynamic(() => import("@/components/homepage-v2/FinalCTA"));
const GoogleReviewsSection = dynamic(() => import("@/components/GoogleReviewsSection"));
const HomepageOffersSection = dynamic(() => import("@/components/HomepageOffersSection"));
import { experiences } from "@/lib/data";
import {
  getDestinations,
  getTrendingPackages,
  getPilgrimPackages,
} from "@/lib/sanity-queries";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const [allDestinations, trendingPackages, pilgrimPackages] = await Promise.all([
    getDestinations(),
    getTrendingPackages(),
    getPilgrimPackages(),
  ]);

  const india = allDestinations.filter((d) => d.country === "India");
  const international = allDestinations.filter((d) => d.country !== "India");

  return (
    <>
      {/* ── 1. Hero (video + search) ──────────────────────────── */}
      <HeroV2 />

      {/* ── 2. Trust row (floats on top of hero bottom) ──────── */}
      <TrustRow />

      {/* ── 3. Curated experiences — bento ───────────────────── */}
      <section className="py-20 md:py-28" aria-labelledby="experiences-heading">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 mb-10 md:mb-12">
            <div>
              <p className="eyebrow">How to travel</p>
              <h2 id="experiences-heading" className="heading-section mt-2 max-w-md text-balance">
                Travel the way
                <span className="italic text-gold font-light"> you feel it.</span>
              </h2>
              <p className="text-sm text-ink/55 mt-3 max-w-sm leading-relaxed">
                Every journey is different. Browse by the mood you&apos;re in.
              </p>
            </div>
            <Link
              href="/experiences"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-ink/65 hover:text-gold transition-colors group shrink-0"
            >
              All experiences
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-[auto] gap-3 md:gap-4">
            {experiences[0] && (
              <Link
                href={`/experiences/${experiences[0].slug}`}
                className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-ink col-span-2 row-span-2 aspect-square md:aspect-auto md:min-h-[420px]"
              >
                <Image
                  src={experiences[0].image}
                  alt={experiences[0].title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-7 text-cream">
                  <span className="inline-block text-[9px] uppercase tracking-[0.3em] text-gold/80 bg-gold/15 px-2.5 py-1 rounded-full mb-3">
                    {experiences[0].category}
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl font-medium leading-tight mb-2">
                    {experiences[0].title}
                  </h3>
                  <p className="text-sm text-cream/60 leading-relaxed line-clamp-2 mb-4">
                    {experiences[0].description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-gold group-hover:gap-3 transition-all">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            )}

            {experiences.slice(1, 5).map((exp) => (
              <Link
                key={exp.slug}
                href={`/experiences/${exp.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-ink aspect-[4/3] md:aspect-auto md:min-h-[196px]"
              >
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-cream">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-gold/70 mb-1">{exp.category}</p>
                  <h3 className="font-display text-sm md:text-base font-medium leading-tight">{exp.title}</h3>
                </div>
                <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-cream/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-3 w-3 text-cream -rotate-45" />
                </div>
              </Link>
            ))}

            {experiences.slice(5).map((exp) => (
              <Link
                key={exp.slug}
                href={`/experiences/${exp.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-ink aspect-[4/3]"
              >
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-cream">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-gold/70 mb-0.5">{exp.category}</p>
                  <h3 className="font-display text-sm font-medium leading-tight">{exp.title}</h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex md:hidden justify-center">
            <Link href="/experiences" className="text-sm font-medium text-ink/65 hover:text-gold transition-colors inline-flex items-center gap-1.5">
              All experiences <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Popular destinations (tabs India / World) ─────── */}
      <PopularDestinations india={india} international={international} />

      {/* ── 6. How it works (3 steps) ────────────────────────── */}
      <HowItWorks />

      {/* ── 7. Trending packages slider ──────────────────────── */}
      {trendingPackages.length > 0 && (
        <section className="py-20 md:py-28 bg-sand/20" aria-labelledby="trending-heading">
          <div className="container-custom">
            <PackageSlider
              id="trending-slider"
              eyebrow="Trending Right Now"
              heading={`Journeys everyone&apos;s <span class="italic text-gold font-light">talking about.</span>`}
              packages={trendingPackages}
              viewAllLabel="View all"
            />
          </div>
        </section>
      )}

      {/* ── 8. Pilgrim trips ─────────────────────────────────── */}
      {pilgrimPackages.length > 0 && (
        <section className="py-20 md:py-28" aria-labelledby="pilgrim-heading">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-10 md:mb-14">
              <div>
                <span className="eyebrow" style={{ color: "#92400e" }}>Sacred Journeys</span>
                <h2 id="pilgrim-heading" className="heading-section mt-2 max-w-sm text-balance">
                  Char Dham, Kedarnath &
                  <span className="italic font-light" style={{ color: "#b45309" }}> Devbhumi yatras.</span>
                </h2>
                <p className="mt-3 text-sm text-ink/55 max-w-md leading-relaxed">
                  Fully arranged pilgrimages by road or helicopter — registration, transfers, and stay included.
                </p>
              </div>
              <Link
                href="/destinations/uttarakhand"
                className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-ink/65 hover:text-gold transition-colors group shrink-0"
              >
                All yatra packages
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {pilgrimPackages.map((pkg) => (
                <Link
                  key={pkg.slug}
                  href={`/packages/${pkg.slug}`}
                  className="group bg-amber-50/60 border border-amber-100 hover:border-amber-300 hover:bg-white rounded-2xl p-5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-display text-base font-medium leading-snug text-ink group-hover:text-amber-900 transition-colors flex-1">
                      {pkg.title}
                    </h3>
                    <span className="shrink-0 text-[11px] font-semibold text-amber-700 bg-white border border-amber-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                      {pkg.duration}
                    </span>
                  </div>
                  <p className="text-xs text-ink/50 leading-relaxed line-clamp-2 mb-4">{pkg.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-amber-100">
                    <p className="text-sm font-semibold text-amber-800">
                      ₹{pkg.price.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-ink/40 ml-1">/ person</span>
                    </p>
                    <span className="text-xs text-ink/40 group-hover:text-amber-700 inline-flex items-center gap-1 transition-colors">
                      View <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 9. Offers ─────────────────────────────────────────── */}
      <HomepageOffersSection />

      {/* ── 10. Reviews (Google) ─────────────────────────────── */}
      <GoogleReviewsSection />

      {/* ── 11. Final CTA ────────────────────────────────────── */}
      <FinalCTA />
    </>
  );
}
