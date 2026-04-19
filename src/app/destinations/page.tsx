export const revalidate = 30;

import DestinationCard from "@/components/DestinationCard";
import CTASection from "@/components/CTASection";
import { getDestinations } from "@/lib/sanity-queries";
import Image from "next/image";

export const metadata = {
  title: "Destinations — Trust and Trip",
  description: "Explore 60+ curated destinations designed for every kind of traveler.",
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <>
      {/* Page hero */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 bg-ink overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=2400&q=80&auto=format&fit=crop"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 to-ink" />

        <div className="container-custom relative text-center">
          <span className="eyebrow text-gold">Our World</span>
          <h1 className="mt-4 font-display text-display-lg text-cream font-medium max-w-3xl mx-auto text-balance leading-[1.02]">
            Every coordinate,
            <span className="italic text-gold font-light"> considered.</span>
          </h1>
          <p className="mt-6 text-cream/70 max-w-xl mx-auto leading-relaxed">
            From islands that feel like secrets to cities that never sleep. Browse the
            places our planners know by heart.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {destinations.map((d, i) => (
              <DestinationCard key={d.slug} destination={d} index={i} />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}

