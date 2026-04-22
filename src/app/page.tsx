export const revalidate = 30;

export const metadata = {
  title: "Trust and Trip – Crafting Reliable Travel",
  description:
    "Trust and Trip crafts reliable, handpicked travel experiences across 60+ destinations. Honeymoons, family holidays, group tours and solo adventures — planned with trust, delivered with care.",
  alternates: { canonical: "https://trustandtrip.com" },
};

import Hero from "@/components/Hero";
import StatCounter from "@/components/StatCounter";
import Destination3DCard from "@/components/Destination3DCard";
import DestinationTile from "@/components/DestinationTile";
import PackageSlider from "@/components/PackageSlider";
import TestimonialCard from "@/components/TestimonialCard";
import GoogleReviewsSection from "@/components/GoogleReviewsSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTASection from "@/components/CTASection";
import { testimonials, experiences, stats } from "@/lib/data";
import {
  getDestinations,
  getTrendingPackages,
  getBestChoicePackages,
  getPilgrimPackages,
} from "@/lib/sanity-queries";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Globe2,
  Heart,
  MapPin,
} from "lucide-react";

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

      {/* ── Pick a feeling ────────────────────────────────────── */}
      <section className="py-20 md:py-28" aria-labelledby="feeling-heading">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 mb-10 md:mb-14">
            <div>
              <span className="eyebrow">How to travel</span>
              <h2 id="feeling-heading" className="heading-section mt-2 max-w-sm text-balance">
                Pick a feeling, not just a
                <span className="italic text-gold font-light"> destination.</span>
              </h2>
            </div>
            <Link
              href="/experiences"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-gold transition-colors group shrink-0"
            >
              All experiences
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div
            className="flex gap-4 overflow-x-auto snap-x snap-proximity no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-1"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {experiences.map((exp) => (
              <Link
                key={exp.slug}
                href={`/experiences/${exp.slug}`}
                className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-ink snap-start shrink-0 w-[72vw] sm:w-[44vw] md:w-[calc(33.333%-11px)] aspect-[3/4]"
              >
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 640px) 72vw, (max-width: 1024px) 44vw, 33vw"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                <div className="absolute top-5 right-5 h-9 w-9 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/15 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-400">
                  <ArrowRight className="h-3.5 w-3.5 text-cream group-hover:text-ink -rotate-45" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-cream">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-gold mb-2">{exp.category}</p>
                  <h3 className="font-display text-xl md:text-2xl font-medium leading-tight mb-1.5">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-cream/55 leading-relaxed line-clamp-2">{exp.description}</p>
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

      {/* ── Dream destinations (3D) ───────────────────────────── */}
      <section className="py-20 md:py-28" aria-labelledby="dream-heading">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 mb-10 md:mb-14">
            <div>
              <span className="eyebrow">Dream Destinations</span>
              <h2 id="dream-heading" className="heading-section mt-2 max-w-sm text-balance">
                Places that make you
                <span className="italic text-gold font-light"> stop scrolling.</span>
              </h2>
            </div>
            <Link href="/destinations" className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-gold transition-colors group shrink-0">
              All destinations
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                name: "Bali",
                country: "Indonesia",
                tagline: "Temples, terraced rice fields, and sunsets you'll never forget.",
                image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85&auto=format&fit=crop",
                slug: "bali",
                priceFrom: 45000,
                badge: "Popular",
              },
              {
                name: "Maldives",
                country: "Maldives",
                tagline: "Overwater villas, coral reefs, and infinite turquoise horizon.",
                image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=85&auto=format&fit=crop",
                slug: "maldives",
                priceFrom: 85000,
                badge: "Luxury",
              },
              {
                name: "Kerala",
                country: "India",
                tagline: "Backwaters, spice gardens, and God's own coastline.",
                image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85&auto=format&fit=crop",
                slug: "kerala",
                priceFrom: 18000,
                badge: "Trending",
              },
            ].map((dest) => (
              <Destination3DCard key={dest.slug} {...dest} />
            ))}
          </div>
          <div className="mt-8 flex md:hidden justify-center">
            <Link href="/destinations" className="text-sm font-medium text-ink/60 hover:text-gold transition-colors inline-flex items-center gap-1.5">
              All destinations <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

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

      {/* ── Why choose us ─────────────────────────────────────── */}
      <WhyChooseUs />

      {/* ── Google Reviews ────────────────────────────────────── */}
      <GoogleReviewsSection />

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-cream overflow-hidden" aria-labelledby="testimonials-heading">
        <div className="container-custom mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="eyebrow">Traveller Stories</span>
              <h2 id="testimonials-heading" className="heading-section mt-2 text-balance">
                Five-star memories,
                <span className="italic text-gold font-light"> in their own words.</span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-xs text-ink/40">
              <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-gold/60" />Condé Nast</span>
              <span className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5 text-gold/60" />IATA Accredited</span>
              <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-gold/60" />4.9 / 5 rating</span>
            </div>
          </div>
        </div>
        <div
          className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused]"
          style={{ paddingLeft: "max(20px, calc((100vw - 1280px)/2))" }}
        >
          {[...testimonials, ...testimonials].map((t, i) => (
            <TestimonialCard key={i} testimonial={t} index={i} />
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
}
