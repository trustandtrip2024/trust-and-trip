export const revalidate = 30;

import Hero from "@/components/Hero";
import DestinationCard from "@/components/DestinationCard";
import PackageCard from "@/components/PackageCard";
import TestimonialCard from "@/components/TestimonialCard";
import VideoSection from "@/components/VideoSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTASection from "@/components/CTASection";
import {
  testimonials,
  experiences,
  stats,
} from "@/lib/data";
import { getDestinations, getTrendingPackages } from "@/lib/sanity-queries";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Globe2, Heart, Sparkles } from "lucide-react";

export default async function HomePage() {
  const [featuredDestinations, trendingPackages] = await Promise.all([
    getDestinations(),
    getTrendingPackages(),
  ]);

  return (
    <>
      <Hero />

      {/* Marquee strip */}
      <section className="border-y border-ink/10 bg-cream py-5 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, r) => (
            <div key={r} className="flex items-center gap-12 shrink-0">
              {[
                "Travel with Trust — Not Issues",
                "10% off on early bookings",
                "60+ destinations",
                "Domestic & international tours",
                "100% price transparency",
                "Honeymoon · Family · Group tours",
                "Open 8 AM – 10 PM daily",
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-12 text-sm text-ink/70">
                  <span className="font-display italic text-gold">âœ¦</span>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Category Tiles / Experiences */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <div>
              <span className="eyebrow">How to travel</span>
              <h2 className="heading-section mt-3 max-w-xl text-balance">
                Pick a feeling, not just a
                <span className="italic text-gold font-light"> destination.</span>
              </h2>
            </div>
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold transition-colors group self-start md:self-end"
            >
              All experiences
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {experiences.map((exp, i) => (
              <Link
                key={exp.slug}
                href={`/experiences#${exp.slug}`}
                className="group relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-2xl md:rounded-3xl bg-ink"
              >
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-cream">
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-gold mb-1">
                    {exp.category}
                  </p>
                  <h3 className="font-display text-lg md:text-2xl font-medium leading-tight">
                    {exp.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-ink text-cream py-12 md:py-16">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center md:border-r md:border-cream/10 last:md:border-r-0 md:px-4">
              <div className="font-display text-4xl md:text-6xl font-medium text-gold leading-none">
                {s.value}
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-cream/60">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <div>
              <span className="eyebrow">Top destinations</span>
              <h2 className="heading-section mt-3 max-w-2xl text-balance">
                Places that keep calling our travelers
                <span className="italic text-gold font-light"> back.</span>
              </h2>
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold transition-colors group self-start md:self-end"
            >
              View all destinations
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredDestinations.map((d, i) => (
              <DestinationCard key={d.slug} destination={d} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Packages */}
      <section className="py-20 md:py-28 bg-sand/40">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <div>
              <span className="eyebrow">Trending now</span>
              <h2 className="heading-section mt-3 max-w-2xl text-balance">
                Signature journeys our planners
                <span className="italic text-gold font-light"> can't stop recommending.</span>
              </h2>
            </div>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold transition-colors group self-start md:self-end"
            >
              All packages
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {trendingPackages.map((p, i) => (
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

      <WhyChooseUs />

      <VideoSection />

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container-custom">
          <div className="max-w-2xl mb-12 md:mb-16">
            <span className="eyebrow">Stories from our travelers</span>
            <h2 className="heading-section mt-3 text-balance">
              Five-star memories,
              <span className="italic text-gold font-light"> in their own words.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} index={i} />
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-ink/60">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" />
              <span>Featured on CondÃ© Nast</span>
            </div>
            <span className="text-ink/20">Â·</span>
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-gold" />
              <span>IATA Accredited</span>
            </div>
            <span className="text-ink/20">Â·</span>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-gold" />
              <span>4.9 / 5 on Google</span>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}

