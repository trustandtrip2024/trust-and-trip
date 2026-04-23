export const revalidate = 30;

export const metadata = {
  title: "Trust and Trip – Crafting Reliable Travel",
  description:
    "Trust and Trip crafts reliable, handpicked travel experiences across 60+ destinations. Honeymoons, family holidays, group tours and solo adventures — planned with trust, delivered with care.",
  alternates: { canonical: "https://trustandtrip.com" },
};

import Hero from "@/components/Hero";
import StatCounter from "@/components/StatCounter";
import DestinationTile from "@/components/DestinationTile";
import PackageSlider from "@/components/PackageSlider";
import GoogleReviewsSection from "@/components/GoogleReviewsSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTASection from "@/components/CTASection";
import TourismBoardsBar from "@/components/TourismBoardsBar";
import HomepageOffersSection from "@/components/HomepageOffersSection";
import { experiences, stats } from "@/lib/data";
import {
  getDestinations,
  getTrendingPackages,
  getBestChoicePackages,
  getPilgrimPackages,
} from "@/lib/sanity-queries";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Globe2 } from "lucide-react";

export default async function HomePage() {
  const [
    allDestinations,
    trendingPackages,
    bestChoicePackages,
    pilgrimPackages,
  ] = await Promise.all([
    getDestinations(),
    getTrendingPackages(),
    getBestChoicePackages(),
    getPilgrimPackages(),
  ]);

  const domesticDestinations = allDestinations
    .filter((d) => d.country === "India")
    .slice(0, 6);

  const internationalDestinations = allDestinations
    .filter((d) => d.country !== "India")
    .slice(0, 6);

  return (
    <>
      <Hero />

      {/* ── Trust strip ───────────────────────────────────────── */}
      <section aria-hidden="true" className="border-y border-ink/8 bg-cream py-3.5 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, r) => (
            <div key={r} className="flex items-center gap-12 shrink-0">
              {[
                "Trusted by 10,000+ travellers",
                "60+ handpicked destinations",
                "100% price transparency",
                "Honeymoon · Family · Group · Solo",
                "Free itinerary planning",
                "24/7 traveller support",
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-12 text-xs text-ink/50 tracking-wide">
                  <span className="text-gold/60">✦</span>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── How we travel — bento grid ───────────────────────── */}
      <section className="py-20 md:py-28 bg-sand/15" aria-labelledby="feeling-heading">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 mb-10 md:mb-12">
            <div>
              <span className="eyebrow">How to travel</span>
              <h2 id="feeling-heading" className="heading-section mt-2 max-w-md text-balance">
                Travel the way
                <span className="italic text-gold font-light"> you feel it.</span>
              </h2>
              <p className="text-sm text-ink/50 mt-3 max-w-sm leading-relaxed">
                Every journey is different. Browse by the experience that speaks to you.
              </p>
            </div>
            <Link href="/experiences"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-gold transition-colors group shrink-0">
              All experiences
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-[auto] gap-3 md:gap-4">
            {/* Featured — spans 2 cols + 2 rows */}
            {experiences[0] && (
              <Link href={`/experiences/${experiences[0].slug}`}
                className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-ink col-span-2 row-span-2 aspect-square md:aspect-auto md:min-h-[420px]">
                <Image src={experiences[0].image} alt={experiences[0].title} fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-7 text-cream">
                  <span className="inline-block text-[9px] uppercase tracking-[0.3em] text-gold/80 bg-gold/15 px-2.5 py-1 rounded-full mb-3">{experiences[0].category}</span>
                  <h3 className="font-display text-2xl md:text-3xl font-medium leading-tight mb-2">{experiences[0].title}</h3>
                  <p className="text-sm text-cream/60 leading-relaxed line-clamp-2 mb-4">{experiences[0].description}</p>
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-gold group-hover:gap-3 transition-all">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            )}

            {/* Right column — 4 small cards */}
            {experiences.slice(1, 5).map((exp) => (
              <Link key={exp.slug} href={`/experiences/${exp.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-ink aspect-[4/3] md:aspect-auto md:min-h-[196px]">
                <Image src={exp.image} alt={exp.title} fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105" />
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

            {/* Bottom row — remaining categories */}
            {experiences.slice(5).map((exp) => (
              <Link key={exp.slug} href={`/experiences/${exp.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-ink aspect-[4/3]">
                <Image src={exp.image} alt={exp.title} fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-cream">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-gold/70 mb-0.5">{exp.category}</p>
                  <h3 className="font-display text-sm font-medium leading-tight">{exp.title}</h3>
                </div>
                <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-cream/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-3 w-3 text-cream -rotate-45" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex md:hidden justify-center">
            <Link href="/experiences" className="text-sm font-medium text-ink/60 hover:text-gold transition-colors inline-flex items-center gap-1.5">
              All experiences <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trending packages ─────────────────────────────────── */}
      {trendingPackages.length > 0 && (
        <section className="py-20 md:py-28 bg-sand/20" aria-labelledby="trending-heading">
          <div className="container-custom">
            <PackageSlider
              id="trending-slider"
              eyebrow="Trending Right Now"
              heading={`Journeys everyone's <span class="italic text-gold font-light">talking about.</span>`}
              packages={trendingPackages}
              viewAllLabel="View all"
            />
          </div>
        </section>
      )}

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="bg-ink text-cream py-12 md:py-16" aria-label="Trust and Trip at a glance">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((s, i) => (
            <StatCounter key={i} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* ── Tourism boards marquee ────────────────────────────── */}
      <TourismBoardsBar />

      {/* ── Explore India ─────────────────────────────────────── */}
      {domesticDestinations.length > 0 && (
        <section className="py-20 md:py-28 bg-sand/20" aria-labelledby="domestic-heading">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-10 md:mb-14">
              <div>
                <span className="eyebrow flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-gold" />
                  Explore India
                </span>
                <h2 id="domestic-heading" className="heading-section mt-2 max-w-sm text-balance">
                  Incredible destinations
                  <span className="italic text-gold font-light"> within India.</span>
                </h2>
              </div>
              <Link href="/destinations" className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-gold transition-colors group shrink-0">
                View all <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {domesticDestinations.map((d, i) => (
                <DestinationTile key={d.slug} destination={d} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Go International ──────────────────────────────────── */}
      {internationalDestinations.length > 0 && (
        <section className="py-20 md:py-28" aria-labelledby="intl-heading">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-10 md:mb-14">
              <div>
                <span className="eyebrow flex items-center gap-1.5">
                  <Globe2 className="h-3 w-3 text-gold" />
                  Go International
                </span>
                <h2 id="intl-heading" className="heading-section mt-2 max-w-sm text-balance">
                  World-class destinations,
                  <span className="italic text-gold font-light"> Indian prices.</span>
                </h2>
              </div>
              <Link href="/destinations" className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-gold transition-colors group shrink-0">
                View all <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {internationalDestinations.map((d, i) => (
                <DestinationTile key={d.slug} destination={d} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Top-rated packages ────────────────────────────────── */}
      {bestChoicePackages.length > 0 && (
        <section className="py-20 md:py-28 bg-sand/20" aria-labelledby="best-heading">
          <div className="container-custom">
            <PackageSlider
              id="best-slider"
              eyebrow="Editor's Picks"
              heading={`Top-rated by our <span class="italic text-gold font-light">happiest travellers.</span>`}
              packages={bestChoicePackages}
              viewAllLabel="View all"
            />
          </div>
        </section>
      )}

      {/* ── Pilgrim Trips ─────────────────────────────────────── */}
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
                <p className="mt-3 text-sm text-ink/50 max-w-md leading-relaxed">
                  Fully arranged pilgrimages by road or helicopter — registration, transfers, and stay included.
                </p>
              </div>
              <Link href="/destinations/uttarakhand" className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-gold transition-colors group shrink-0">
                All yatra packages <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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

      {/* ── Offers showcase ───────────────────────────────────── */}
      <HomepageOffersSection />

      {/* ── Why choose us ─────────────────────────────────────── */}
      <WhyChooseUs />

      {/* ── Google Reviews ────────────────────────────────────── */}
      <GoogleReviewsSection />

      <CTASection />
    </>
  );
}
