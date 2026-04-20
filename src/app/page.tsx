export const revalidate = 30;

import Hero from "@/components/Hero";
import StatCounter from "@/components/StatCounter";
import DestinationTile from "@/components/DestinationTile";
import PackageSlider from "@/components/PackageSlider";
import TestimonialCard from "@/components/TestimonialCard";
import VideoSection from "@/components/VideoSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTASection from "@/components/CTASection";
import { testimonials, experiences, stats } from "@/lib/data";
import {
  getDestinations,
  getTrendingPackages,
  getBudgetPackages,
  getNewlyAddedPackages,
  getBestChoicePackages,
} from "@/lib/sanity-queries";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Globe2,
  Heart,
  IndianRupee,
  Flame,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";

export default async function HomePage() {
  const [
    allDestinations,
    trendingPackages,
    budgetPackages,
    newlyAddedPackages,
    bestChoicePackages,
  ] = await Promise.all([
    getDestinations(),
    getTrendingPackages(),
    getBudgetPackages(),
    getNewlyAddedPackages(),
    getBestChoicePackages(),
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

      {/* ── Marquee strip ─────────────────────────────────────── */}
      <section aria-hidden="true" className="border-y border-ink/10 bg-cream py-4 overflow-hidden">
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

      {/* ── Pick a Feeling ─────────────────────────────────────── */}
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
              aria-label="View all travel experiences"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold transition-colors group shrink-0"
            >
              All experiences
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 3-col tile grid — horizontal scroll on mobile for bigger tiles */}
          <div className="flex sm:grid sm:grid-cols-3 gap-2.5 md:gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 pb-1 sm:pb-0">
            {experiences.map((exp, i) => (
              <Link
                key={exp.slug}
                href={`/experiences#${exp.slug}`}
                aria-label={`${exp.title} — ${exp.description}`}
                className="group relative overflow-hidden rounded-xl md:rounded-2xl aspect-[3/4] sm:aspect-square md:aspect-[4/5] bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 snap-start shrink-0 w-[52vw] sm:w-auto"
              >
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 640px) 52vw, (max-width: 1024px) 33vw, 300px"
                  className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-5 text-cream">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gold mb-1 opacity-80">
                    {exp.category}
                  </p>
                  <h3 className="font-display text-sm md:text-xl font-medium leading-tight">
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

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="bg-ink text-cream py-10 md:py-14" aria-label="Trust and Trip at a glance">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {stats.map((s, i) => (
            <StatCounter key={i} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* ── Browse by Travel Style ────────────────────────────── */}
      <section className="py-14 md:py-20 bg-sand/30" aria-labelledby="style-heading">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
            <div>
              <span className="eyebrow">Travel Style</span>
              <h2
                id="style-heading"
                className="heading-section mt-2 max-w-xs md:max-w-lg text-balance"
              >
                Every trip starts with
                <span className="italic text-gold font-light"> a feeling.</span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {[
              { label: "Honeymoon", icon: "💑", type: "Couple", bg: "from-rose-200/60 to-pink-100/40" },
              { label: "Family", icon: "👨‍👩‍👧‍👦", type: "Family", bg: "from-sky-200/60 to-blue-100/40" },
              { label: "Group", icon: "🎉", type: "Group", bg: "from-emerald-200/60 to-green-100/40" },
              { label: "Solo", icon: "🧭", type: "Solo", bg: "from-violet-200/60 to-purple-100/40" },
              { label: "Adventure", icon: "🏔️", type: "Adventure", bg: "from-amber-200/60 to-orange-100/40" },
            ].map(({ label, icon, type, bg }) => (
              <Link
                key={type}
                href={`/packages?type=${type}`}
                className={`group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-gradient-to-br ${bg} border border-ink/5 hover:border-gold/30 hover:shadow-soft transition-all duration-300 hover:-translate-y-1`}
              >
                <span className="text-3xl md:text-4xl">{icon}</span>
                <span className="font-display text-sm md:text-base font-medium text-ink group-hover:text-gold transition-colors">
                  {label}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-ink/30 group-hover:text-gold group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore India ─────────────────────────────────────── */}
      {domesticDestinations.length > 0 && (
        <section className="py-14 md:py-20" aria-labelledby="domestic-heading">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-7 md:mb-10">
              <div>
                <span className="eyebrow flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-gold" aria-hidden="true" />
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
                aria-label="View all Indian destinations"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold transition-colors group shrink-0"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            {/* Mobile: horizontal scroll rail; md+: 3-col grid */}
            <div className="flex md:grid md:grid-cols-3 gap-2.5 md:gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-1 md:pb-0">
              {domesticDestinations.map((d, i) => (
                <div key={d.slug} className="snap-start shrink-0 w-[58vw] sm:w-[44vw] md:w-auto">
                  <DestinationTile destination={d} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Go International ──────────────────────────────────── */}
      {internationalDestinations.length > 0 && (
        <section className="py-14 md:py-20 bg-sand/30" aria-labelledby="intl-heading">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-7 md:mb-10">
              <div>
                <span className="eyebrow flex items-center gap-1.5">
                  <Globe2 className="h-3 w-3 text-gold" aria-hidden="true" />
                  Go International
                </span>
                <h2
                  id="intl-heading"
                  className="heading-section mt-2 max-w-xs md:max-w-lg text-balance"
                >
                  World-class destinations,
                  <span className="italic text-gold font-light"> Indian prices.</span>
                </h2>
              </div>
              <Link
                href="/destinations"
                aria-label="View all international destinations"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold transition-colors group shrink-0"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            {/* Mobile: horizontal scroll rail; md+: 3-col grid */}
            <div className="flex md:grid md:grid-cols-3 gap-2.5 md:gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-1 md:pb-0">
              {internationalDestinations.map((d, i) => (
                <div key={d.slug} className="snap-start shrink-0 w-[58vw] sm:w-[44vw] md:w-auto">
                  <DestinationTile destination={d} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trending Experiences (slider) ─────────────────────── */}
      {trendingPackages.length > 0 && (
        <section className="py-14 md:py-20" aria-labelledby="trending-heading">
          <div className="container-custom">
            <PackageSlider
              id="trending-slider"
              eyebrow="Trending Experiences"
              heading={`Journeys everyone's <span class=\"italic text-gold font-light\">talking about.</span>`}
              packages={trendingPackages}
              viewAllLabel="All trending"
            />
          </div>
        </section>
      )}

      {/* ── Newly Added (slider) ──────────────────────────────── */}
      {newlyAddedPackages.length > 0 && (
        <section className="py-14 md:py-20 bg-sand/30" aria-labelledby="new-heading">
          <div className="container-custom">
            <PackageSlider
              id="new-slider"
              eyebrow="Newly Added"
              heading={`Fresh itineraries, <span class=\"italic text-gold font-light\">just dropped.</span>`}
              packages={newlyAddedPackages}
              viewAllLabel="All packages"
            />
          </div>
        </section>
      )}

      {/* ── Budget Picks (slider) ─────────────────────────────── */}
      {budgetPackages.length > 0 && (
        <section className="py-14 md:py-20" aria-labelledby="budget-heading">
          <div className="container-custom">
            <PackageSlider
              id="budget-slider"
              eyebrow="Budget Friendly"
              heading={`Big journeys, <span class=\"italic text-gold font-light\">under ₹35,000.</span>`}
              packages={budgetPackages}
              viewAllLabel="Budget picks"
            />
          </div>
        </section>
      )}

      {/* ── Best Choices (slider) ─────────────────────────────── */}
      {bestChoicePackages.length > 0 && (
        <section className="py-14 md:py-20 bg-sand/30" aria-labelledby="best-heading">
          <div className="container-custom">
            <PackageSlider
              id="best-slider"
              eyebrow="Best Choices"
              heading={`Top-rated by our <span class=\"italic text-gold font-light\">happiest travelers.</span>`}
              packages={bestChoicePackages}
              viewAllLabel="Top rated"
            />
          </div>
        </section>
      )}

      <WhyChooseUs />

      <VideoSection />

      {/* ── Testimonials ──────────────────────────────────────── */}
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
          <div className="mt-10 flex flex-wrap items-center gap-5 text-sm text-ink/60">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-gold shrink-0" aria-hidden="true" />
              <span>Featured on Condé Nast</span>
            </div>
            <span className="text-ink/20 hidden sm:block" aria-hidden="true">·</span>
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-gold shrink-0" aria-hidden="true" />
              <span>IATA Accredited</span>
            </div>
            <span className="text-ink/20 hidden sm:block" aria-hidden="true">·</span>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-gold shrink-0" aria-hidden="true" />
              <span>4.9 / 5 on Google</span>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
