export const revalidate = 30;

import Hero from "@/components/Hero";
import DestinationTile from "@/components/DestinationTile";
import PackageCard from "@/components/PackageCard";
import TestimonialCard from "@/components/TestimonialCard";
import VideoSection from "@/components/VideoSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTASection from "@/components/CTASection";
import { testimonials, experiences, stats } from "@/lib/data";
import {
  getDestinations,
  getTrendingPackages,
  getBudgetPackages,
} from "@/lib/sanity-queries";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Globe2, Heart, IndianRupee, Flame, MapPin } from "lucide-react";

export default async function HomePage() {
  const [allDestinations, trendingPackages, budgetPackages] = await Promise.all([
    getDestinations(),
    getTrendingPackages(),
    getBudgetPackages(),
  ]);

  const domesticDestinations = allDestinations
    .filter((d) => d.country === "India")
    .slice(0, 9);

  const internationalDestinations = allDestinations
    .filter((d) => d.country !== "India")
    .slice(0, 9);

  return (
    <>
      <Hero />

      {/* ── Marquee strip ─────────────────────────────────────────── */}
      <section
        aria-hidden="true"
        className="border-y border-ink/10 bg-cream py-4 overflow-hidden"
      >
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, r) => (
            <div key={r} className="flex items-center gap-10 shrink-0">
              {[
                "Travel with Trust — Not Issues",
                "10% off on early bookings",
                "60+ destinations",
                "Domestic & international tours",
                "100% price transparency",
                "Honeymoon · Family · Group tours",
                "Open 8 AM – 10 PM daily",
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-10 text-sm text-ink/70">
                  <span className="font-display italic text-gold text-base">✦</span>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Pick a Feeling ─────────────────────────────────────────── */}
      <section className="py-14 md:py-20" aria-labelledby="feeling-heading">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
            <div>
              <span className="eyebrow">How to travel</span>
              <h2
                id="feeling-heading"
                className="heading-section mt-2 max-w-xs md:max-w-xl text-balance"
              >
                Pick a feeling, not just a
                <span className="italic text-gold font-light"> destination.</span>
              </h2>
            </div>
            <Link
              href="/experiences"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold transition-colors group shrink-0"
              aria-label="View all travel experiences"
            >
              All experiences
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 3-col tile grid — 2 rows × 3 cols = 6 tiles */}
          <div className="grid grid-cols-3 gap-2.5 md:gap-4">
            {experiences.map((exp, i) => (
              <Link
                key={exp.slug}
                href={`/experiences#${exp.slug}`}
                aria-label={`${exp.title} — ${exp.description}`}
                className="group relative overflow-hidden rounded-xl md:rounded-2xl aspect-square md:aspect-[4/5] bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 300px"
                  className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5 md:p-5 text-cream">
                  <p className="hidden md:block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gold mb-1">
                    {exp.category}
                  </p>
                  <h3 className="font-display text-[11px] md:text-xl font-medium leading-tight">
                    {exp.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5 flex md:hidden justify-center">
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold transition-colors group"
            >
              All experiences
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section className="bg-ink text-cream py-10 md:py-14" aria-label="Trust and Trip stats">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="text-center md:border-r md:border-cream/10 last:md:border-r-0 md:px-4"
            >
              <div className="font-display text-3xl md:text-5xl font-medium text-gold leading-none">
                {s.value}
              </div>
              <p className="mt-2 text-[9px] md:text-[10px] uppercase tracking-[0.22em] text-cream/60">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Domestic Destinations ──────────────────────────────────── */}
      {domesticDestinations.length > 0 && (
        <section className="py-14 md:py-20" aria-labelledby="domestic-heading">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-7 md:mb-10">
              <div>
                <span className="eyebrow flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-gold" />
                  Explore India
                </span>
                <h2
                  id="domestic-heading"
                  className="heading-section mt-2 max-w-xs md:max-w-lg text-balance"
                >
                  Incredible destinations
                  <span className="italic text-gold font-light"> within India.</span>
                </h2>
              </div>
              <Link
                href="/destinations"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold transition-colors group shrink-0"
                aria-label="View all Indian destinations"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* 3×3 tile grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 md:gap-4">
              {domesticDestinations.map((d, i) => (
                <DestinationTile key={d.slug} destination={d} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── International Destinations ─────────────────────────────── */}
      {internationalDestinations.length > 0 && (
        <section
          className="py-14 md:py-20 bg-sand/30"
          aria-labelledby="international-heading"
        >
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-7 md:mb-10">
              <div>
                <span className="eyebrow flex items-center gap-1.5">
                  <Globe2 className="h-3 w-3 text-gold" />
                  Go International
                </span>
                <h2
                  id="international-heading"
                  className="heading-section mt-2 max-w-xs md:max-w-lg text-balance"
                >
                  World-class destinations,
                  <span className="italic text-gold font-light"> Indian prices.</span>
                </h2>
              </div>
              <Link
                href="/destinations"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold transition-colors group shrink-0"
                aria-label="View all international destinations"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 md:gap-4">
              {internationalDestinations.map((d, i) => (
                <DestinationTile key={d.slug} destination={d} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Budget Picks ───────────────────────────────────────────── */}
      {budgetPackages.length > 0 && (
        <section className="py-14 md:py-20" aria-labelledby="budget-heading">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-7 md:mb-10">
              <div>
                <span className="eyebrow flex items-center gap-1.5">
                  <IndianRupee className="h-3 w-3 text-gold" />
                  Budget Friendly
                </span>
                <h2
                  id="budget-heading"
                  className="heading-section mt-2 max-w-xs md:max-w-lg text-balance"
                >
                  Big journeys,
                  <span className="italic text-gold font-light"> under ₹35,000.</span>
                </h2>
              </div>
              <Link
                href="/packages"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold transition-colors group shrink-0"
                aria-label="View all budget packages"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {budgetPackages.map((p, i) => (
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
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trending Packages ──────────────────────────────────────── */}
      {trendingPackages.length > 0 && (
        <section
          className="py-14 md:py-20 bg-sand/40"
          aria-labelledby="trending-heading"
        >
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-7 md:mb-10">
              <div>
                <span className="eyebrow flex items-center gap-1.5">
                  <Flame className="h-3 w-3 text-gold" />
                  Trending Now
                </span>
                <h2
                  id="trending-heading"
                  className="heading-section mt-2 max-w-xs md:max-w-lg text-balance"
                >
                  Journeys our planners
                  <span className="italic text-gold font-light"> can't stop recommending.</span>
                </h2>
              </div>
              <Link
                href="/packages"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold transition-colors group shrink-0"
                aria-label="View all trending packages"
              >
                All packages
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* 3×3 tile grid — up to 9 trending packages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {trendingPackages.slice(0, 9).map((p, i) => (
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
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <WhyChooseUs />

      <VideoSection />

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-cream" aria-labelledby="testimonials-heading">
        <div className="container-custom">
          <div className="max-w-2xl mb-10 md:mb-14">
            <span className="eyebrow">Stories from our travelers</span>
            <h2
              id="testimonials-heading"
              className="heading-section mt-2 text-balance"
            >
              Five-star memories,
              <span className="italic text-gold font-light"> in their own words.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} index={i} />
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center gap-5 text-sm text-ink/60">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-gold shrink-0" />
              <span>Featured on Condé Nast</span>
            </div>
            <span className="text-ink/20 hidden sm:block">·</span>
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-gold shrink-0" />
              <span>IATA Accredited</span>
            </div>
            <span className="text-ink/20 hidden sm:block">·</span>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-gold shrink-0" />
              <span>4.9 / 5 on Google</span>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
