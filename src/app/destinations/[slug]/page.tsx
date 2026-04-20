export const revalidate = 30;
export const dynamicParams = true;

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDestinationBySlug, getAllDestinationSlugs, getPackagesByDestination } from "@/lib/sanity-queries";
import PackageCard from "@/components/PackageCard";
import CTASection from "@/components/CTASection";
import { Calendar, Clock, MapPin, ChevronRight, ArrowRight } from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllDestinationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const d = await getDestinationBySlug(params.slug);
  if (!d) return {};
  return {
    title: `${d.name}, ${d.country} — Trust and Trip`,
    description: d.tagline,
  };
}

export default async function DestinationDetail({ params }: Props) {
  const destination = await getDestinationBySlug(params.slug);
  if (!destination) return notFound();

  const relatedPackages = await getPackagesByDestination(destination.slug);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-ink">
        <Image
          src={destination.heroImage}
          alt={destination.name}
          fill
          priority
          className="object-cover animate-slow-zoom"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/50" />

        {/* Breadcrumbs */}
        <div className="absolute top-24 md:top-28 inset-x-0 z-10">
          <div className="container-custom flex items-center gap-2 text-xs text-cream/70">
            <Link href="/" className="hover:text-gold">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/destinations" className="hover:text-gold">Destinations</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gold">{destination.name}</span>
          </div>
        </div>

        <div className="relative h-full flex items-end pb-16 md:pb-24 container-custom text-cream">
          <div className="max-w-3xl">
            <span className="eyebrow text-gold">{destination.country} · {destination.region}</span>
            <h1 className="mt-4 font-display text-display-xl font-medium leading-[0.95] text-balance">
              {destination.name}
            </h1>
            <p className="mt-4 text-xl md:text-2xl italic font-display text-gold font-light">
              {destination.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 md:py-24">
        <div className="container-custom grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20">
          <div>
            <span className="eyebrow">Overview</span>
            <h2 className="heading-section mt-3 text-balance">
              The soul of {destination.name}.
            </h2>
            <div className="mt-8 space-y-4 text-ink/70 leading-relaxed">
              <p>{destination.overview}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {(destination.highlights || []).map((h) => (
                <span
                  key={h}
                  className="text-xs px-3 py-1.5 rounded-full bg-cream border border-ink/10 text-ink/80"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 content-start">
            <InfoCard icon={Calendar} label="Best time to visit" value={destination.bestTimeToVisit || "Year-round"} />
            <InfoCard icon={Clock} label="Ideal duration" value={destination.idealDuration || "To be decided"} />
            <InfoCard icon={MapPin} label="Region" value={destination.region} />
            <InfoCard icon={MapPin} label="Starts from" value={`₹${destination.priceFrom.toLocaleString("en-IN")}`} />
          </div>
        </div>
      </section>

      {/* Things to do */}
      <section className="py-16 md:py-20 bg-sand/40">
        <div className="container-custom">
          <div className="max-w-2xl mb-12">
            <span className="eyebrow">Things to do</span>
            <h2 className="heading-section mt-3 text-balance">
              Moments to collect in {destination.name}.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(destination.thingsToDo || []).map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 flex items-start gap-4 border border-ink/5"
              >
                <span className="shrink-0 h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center text-sm font-display text-gold font-medium">
                  {i + 1}
                </span>
                <p className="text-ink/80 leading-relaxed text-sm">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {relatedPackages.length > 0 && (
        <section className="py-20 md:py-24">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="eyebrow">Curated journeys</span>
                <h2 className="heading-section mt-3 max-w-2xl text-balance">
                  Packages built for {destination.name}.
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedPackages.map((p, i) => (
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

      <CTASection
        title={`Dreaming of ${destination.name}?`}
        subtitle="Talk to a dedicated planner who knows this destination inside-out. We will craft an itinerary just for you."
      />
    </>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-ink/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 text-gold">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">{label}</span>
      </div>
      <p className="mt-3 font-display text-xl text-ink leading-tight">{value}</p>
    </div>
  );
}
