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
import VideoSection from "@/components/VideoSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTASection from "@/components/CTASection";
import QuickFilters from "@/components/QuickFilters";
import DepartingSoon from "@/components/DepartingSoon";
import SocialProofWall from "@/components/SocialProofWall";
import { testimonials, experiences, stats } from "@/lib/data";
import {
  getDestinations,
  getTrendingPackages,
  getBudgetPackages,
  getNewlyAddedPackages,
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
    pilgrimPackages,
  ] = await Promise.all([
    getDestinations(),
    getTrendingPackages(),
    getBudgetPackages(),
    getNewlyAddedPackages(),
    getBestChoicePackages(),
    getPilgrimPackages(),
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

      {/* ── Quick filters ─────────────────────────────────────── */}
      <QuickFilters />

      {/* ── Departing Soon ────────────────────────────────────── */}
      <DepartingSoon packages={trendingPackages} />

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

          {/* Experience tiles — big cards, horizontal scroll mobile */}
          <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-proximity scroll-smooth no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-1"
            style={{ WebkitOverflowScrolling: "touch" }}>
            {experiences.map((exp) => (
              <Link
                key={exp.slug}
                href={`/experiences/${exp.slug}`}
                aria-label={`${exp.title} — ${exp.description}`}
                className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 snap-start shrink-0
                  w-[72vw] sm:w-[44vw] md:w-[calc(33.333%-11px)]
                  aspect-[3/4] md:aspect-[3/4]"
              >
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 640px) 72vw, (max-width: 1024px) 44vw, 33vw"
                  className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent" />

                {/* Arrow */}
                <div className="absolute top-5 right-5 h-10 w-10 rounded-full bg-cream/15 backdrop-blur-md border border-cream/20 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-500">
                  <ArrowRight className="h-4 w-4 text-cream group-hover:text-ink -rotate-45" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 text-cream">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-gold mb-2">{exp.category}</p>
                  <h3 className="font-display text-xl md:text-2xl font-medium leading-tight mb-2">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-cream/60 leading-relaxed line-clamp-2 max-w-xs">
                    {exp.description}
                  </p>
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

      {/* ── Trending Packages ─────────────────────────────────── */}
      {trendingPackages.length > 0 && (
        <section className="py-12 md:py-16" aria-labelledby="trending-heading">
          <div className="container-custom">
            <PackageSlider
              id="trending-slider"
              eyebrow="Trending Right Now"
              heading={`Journeys everyone's <span class=\"italic text-gold font-light\">talking about.</span>`}
              packages={trendingPackages}
              viewAllLabel="All trending"
            />
          </div>
        </section>
      )}

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="bg-ink text-cream py-10 md:py-14" aria-label="Trust and Trip at a glance">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {stats.map((s, i) => (
            <StatCounter key={i} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* ── 3D Dream Destinations ────────────────────────────── */}
      <section className="py-14 md:py-20" aria-labelledby="dream-heading">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 mb-8 md:mb-12">
            <div>
              <span className="eyebrow">Dream Destinations</span>
              <h2 id="dream-heading" className="heading-section mt-2 max-w-xs md:max-w-xl text-balance">
                Places that make you
                <span className="italic text-gold font-light"> stop scrolling.</span>
              </h2>
            </div>
            <Link href="/destinations" className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold transition-colors group shrink-0">
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
          <div className="mt-6 flex md:hidden justify-center">
            <Link href="/destinations" className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold transition-colors group">
              All destinations <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
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

      <GoogleReviewsSection />

      <SocialProofWall />

      <VideoSection />

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-cream overflow-hidden" aria-labelledby="testimonials-heading">
        <div className="container-custom mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <span className="eyebrow">Stories from our travelers</span>
              <h2 id="testimonials-heading" className="heading-section mt-2 text-balance">
                Five-star memories,
                <span className="italic text-gold font-light"> in their own words.</span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-ink/50 shrink-0">
              <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-gold" />Condé Nast</span>
              <span className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5 text-gold" />IATA Accredited</span>
              <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-gold" />4.9 / 5 Google &amp; TripAdvisor</span>
            </div>
          </div>
        </div>

        {/* Auto-scrolling marquee */}
        <div
          className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused] px-5 md:px-0"
          style={{ paddingLeft: "max(20px, calc((100vw - 1280px)/2))" }}
        >
          {[...testimonials, ...testimonials].map((t, i) => (
            <TestimonialCard key={i} testimonial={t} index={i} />
          ))}
        </div>
      </section>

      {/* ── Pilgrim Trips ─────────────────────────────────────── */}
      {pilgrimPackages.length > 0 && (
        <section className="py-14 md:py-20 relative overflow-hidden" aria-labelledby="pilgrim-heading">
          {/* Saffron texture background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" />
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
          <div className="relative container-custom">
            <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
              <div>
                <span className="eyebrow text-amber-700">Pilgrim Trips</span>
                <h2 id="pilgrim-heading" className="heading-section mt-2 max-w-xs md:max-w-xl text-balance">
                  Char Dham, Kedarnath &
                  <span className="italic font-light" style={{color: "#b45309"}}> sacred Uttarakhand.</span>
                </h2>
                <p className="mt-3 text-sm text-ink/60 max-w-lg">
                  Devbhumi awaits. Complete yatras by road or helicopter — with registration, transfers, and accommodation fully arranged.
                </p>
              </div>
              <Link href="/destinations/uttarakhand" className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors group shrink-0">
                All yatra packages
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {pilgrimPackages.map((pkg) => (
                <Link
                  key={pkg.slug}
                  href={`/packages/${pkg.slug}`}
                  className="group bg-white rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-display text-base font-medium leading-snug text-ink group-hover:text-amber-800 transition-colors flex-1">
                        {pkg.title}
                      </h3>
                      <span className="shrink-0 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {pkg.duration}
                      </span>
                    </div>
                    <p className="text-xs text-ink/55 leading-relaxed line-clamp-2 mb-4">{pkg.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-amber-50">
                      <div>
                        <p className="text-[10px] text-ink/40 uppercase tracking-wider">Starting from</p>
                        <p className="text-sm font-bold text-amber-800">₹{pkg.price.toLocaleString("en-IN")}<span className="text-xs font-normal text-ink/50">/person</span></p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 group-hover:gap-2 transition-all">
                        View package <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex md:hidden justify-center">
              <Link href="/destinations/uttarakhand" className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors">
                All yatra packages <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </>
  );
}
