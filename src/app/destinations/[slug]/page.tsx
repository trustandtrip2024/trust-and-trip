export const revalidate = 30;
export const dynamicParams = true;

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDestinationBySlug, getAllDestinationSlugs, getPackagesByDestination } from "@/lib/sanity-queries";
import type { Package } from "@/lib/data";
import { DESTINATION_GALLERY } from "@/lib/gallery-images";
import DestinationGallery from "@/components/DestinationGallery";
import PackageSlider from "@/components/PackageSlider";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { Calendar, Clock, MapPin, ChevronRight, ArrowRight, Sun, IndianRupee, Users, Check, Heart, Star } from "lucide-react";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const slugs = await getAllDestinationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const d = await getDestinationBySlug(params.slug);
  if (!d) return {};
  return {
    title: `${d.name} Tour Packages — ${d.tagline}`,
    description: `Explore ${d.name}, ${d.country}. ${d.overview?.slice(0, 155)}…`,
    openGraph: {
      title: `${d.name} — ${d.tagline}`,
      description: d.overview?.slice(0, 200),
      images: [{ url: d.heroImage, width: 1200, height: 630, alt: d.name }],
    },
    alternates: { canonical: `https://trustandtrip.com/destinations/${d.slug}` },
  };
}

export default async function DestinationDetail({ params }: Props) {
  const destination = await getDestinationBySlug(params.slug);
  if (!destination) return notFound();

  const packages = await getPackagesByDestination(destination.slug);
  const gallery = DESTINATION_GALLERY[destination.slug] ?? [];

  // Aggregate the package list into per-travel-type buckets so we can render
  // entry-style chips ("12 honeymoon trips · from ₹X"). Driven entirely by
  // existing data, no new schema fields.
  const TRAVEL_TYPES: Package["travelType"][] = ["Couple", "Family", "Group", "Solo"];
  const TRAVEL_TYPE_LABEL: Record<Package["travelType"], string> = {
    Couple: "Couples",
    Family: "Families",
    Group: "Groups",
    Solo: "Solo",
  };
  const byType = TRAVEL_TYPES.map((t) => {
    const list = packages.filter((p) => p.travelType === t);
    const minPrice = list.reduce((m, p) => (m === 0 ? p.price : Math.min(m, p.price)), 0);
    return { type: t, count: list.length, minPrice };
  }).filter((x) => x.count > 0);

  // Aggregate review/rating across this destination's packages — synthesised
  // from package metadata, no extra round trip.
  const totalReviews = packages.reduce((s, p) => s + (p.reviews ?? 0), 0);
  const ratedCount = packages.filter((p) => p.rating).length;
  const avgRating = ratedCount
    ? packages.reduce((s, p) => s + (p.rating ?? 0), 0) / ratedCount
    : 0;

  // Schema.org ItemList of bookable trips for this destination — search
  // engines pick this up alongside the TouristDestination block.
  const tripsListLd = packages.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${destination.name} — trip packages`,
    numberOfItems: packages.length,
    itemListElement: packages.slice(0, 25).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://trustandtrip.com/packages/${p.slug}`,
      name: p.title,
    })),
  } : null;

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "TouristDestination",
        name: destination.name, description: destination.overview,
        url: `https://trustandtrip.com/destinations/${destination.slug}`,
        image: destination.heroImage,
        touristType: ["Couple", "Family", "Group", "Solo"],
        includesAttraction: (destination.thingsToDo || []).map((t) => ({ "@type": "TouristAttraction", name: t })),
        ...(avgRating > 0 && totalReviews > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(avgRating.toFixed(1)),
            reviewCount: totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      }} />
      {tripsListLd && <JsonLd data={tripsListLd} />}

      {/* Hero */}
      <section className="relative h-[75vh] min-h-[500px] w-full overflow-hidden bg-tat-charcoal">
        <Image src={destination.heroImage} alt={destination.name} fill priority className="object-cover animate-slow-zoom" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/92 via-tat-charcoal/30 to-tat-charcoal/40" />

        <div className="absolute top-24 inset-x-0 z-10 container-custom flex items-center gap-2 text-xs text-tat-paper/60">
          <Link href="/" className="hover:text-tat-gold">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/destinations" className="hover:text-tat-gold">Destinations</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-tat-gold">{destination.name}</span>
        </div>

        <div className="relative h-full flex items-end pb-12 md:pb-16 container-custom text-tat-paper z-10">
          <div className="max-w-3xl">
            <span className="eyebrow text-tat-gold mb-3 block">{destination.country} · {destination.region}</span>
            <h1 className="font-display text-display-xl font-medium leading-[0.95] text-balance">
              {destination.name}
            </h1>
            <p className="mt-3 text-xl italic font-display text-tat-gold font-light">{destination.tagline}</p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Pill icon={IndianRupee} label={`From ₹${destination.priceFrom.toLocaleString("en-IN")}`} />
              <Pill icon={Calendar} label={destination.bestTimeToVisit || "Year-round"} />
              <Pill icon={Clock} label={destination.idealDuration || "5–7 days"} />
              <Pill icon={Users} label="Couples · Families · Groups" />
            </div>
          </div>
        </div>
      </section>

      {/* Photo gallery strip — clickable with lightbox */}
      {gallery.length > 0 && (
        <DestinationGallery images={gallery} name={destination.name} />
      )}

      {/* Overview + quick facts */}
      <section className="py-14 md:py-18">
        <div className="container-custom grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-16 items-start">
          <div>
            <span className="eyebrow">About {destination.name}</span>
            <h2 className="heading-section mt-3 mb-5 text-balance">
              The soul of <span className="italic text-tat-gold font-light">{destination.name}.</span>
            </h2>
            <p className="text-tat-charcoal/70 leading-relaxed mb-6">{destination.overview}</p>

            {/* Highlight tags */}
            <div className="flex flex-wrap gap-2">
              {(destination.highlights || []).map((h) => (
                <span key={h} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-tat-gold/10 border border-tat-gold/20 text-tat-charcoal/80">
                  <Check className="h-3 w-3 text-tat-gold" />{h}
                </span>
              ))}
            </div>
          </div>

          {/* Quick facts card */}
          <div className="bg-tat-paper rounded-2xl border border-tat-charcoal/8 p-6 space-y-4">
            <h3 className="font-display text-lg font-medium">Quick facts</h3>
            {[
              { icon: IndianRupee, label: "Starting price", value: `₹${destination.priceFrom.toLocaleString("en-IN")} / person` },
              { icon: Calendar, label: "Best time to visit", value: destination.bestTimeToVisit || "Year-round" },
              { icon: Clock, label: "Ideal duration", value: destination.idealDuration || "5–7 days" },
              { icon: MapPin, label: "Region", value: `${destination.country} · ${destination.region}` },
              { icon: Sun, label: "Best for", value: "Couples, Families, Groups" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 py-3 border-b border-tat-charcoal/6 last:border-0 last:pb-0">
                <div className="h-8 w-8 rounded-full bg-tat-gold/10 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-tat-gold" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-tat-charcoal/40 font-medium">{label}</p>
                  <p className="text-sm font-medium text-tat-charcoal mt-0.5">{value}</p>
                </div>
              </div>
            ))}

            <Link href={`/packages?destination=${destination.slug}`}
              className="flex items-center justify-center gap-2 w-full bg-tat-charcoal text-tat-paper py-3 rounded-xl text-sm font-medium hover:bg-tat-gold hover:text-tat-charcoal transition-colors mt-2">
              View all experiences <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Things to do */}
      {(destination.thingsToDo || []).length > 0 && (
        <section className="py-14 bg-tat-cream/40">
          <div className="container-custom">
            <span className="eyebrow">Experiences</span>
            <h2 className="heading-section mt-2 mb-8 text-balance">
              Moments to collect in
              <span className="italic text-tat-gold font-light"> {destination.name}.</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(destination.thingsToDo || []).map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 flex items-start gap-4 border border-tat-charcoal/5">
                  <span className="shrink-0 h-8 w-8 rounded-full bg-tat-gold/20 flex items-center justify-center text-sm font-display text-tat-gold font-medium">
                    {i + 1}
                  </span>
                  <p className="text-tat-charcoal/80 leading-relaxed text-sm">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trip styles — link chips per travel-type with count + min price.
          Each chip drops the user into the packages list pre-filtered to this
          destination + travel-type. Synthesises rating aggregate across the
          destination so the strip doubles as social proof. */}
      {byType.length > 0 && (
        <section className="py-12 md:py-14">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
              <div>
                <span className="eyebrow">Trip styles</span>
                <h2 className="heading-section mt-2 text-balance">
                  Pick the trip
                  <span className="italic text-tat-gold font-light"> that fits.</span>
                </h2>
              </div>
              {avgRating > 0 && totalReviews > 0 && (
                <div className="inline-flex items-center gap-2 text-sm text-tat-charcoal/65">
                  <Star className="h-4 w-4 fill-tat-gold text-tat-gold" />
                  <span className="font-semibold text-tat-charcoal">{avgRating.toFixed(1)}</span>
                  <span>· {totalReviews.toLocaleString("en-IN")} reviews across {packages.length} trips</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {byType.map((t) => (
                <Link
                  key={t.type}
                  href={`/packages?destination=${destination.slug}&type=${t.type}`}
                  className="group rounded-2xl bg-tat-paper hover:bg-white border border-tat-charcoal/8 hover:border-tat-gold/40 transition-all p-4 md:p-5"
                >
                  <span className="inline-flex items-center gap-2 text-tat-burnt">
                    {t.type === "Couple" ? (
                      <Heart className="h-4 w-4" aria-hidden />
                    ) : (
                      <Users className="h-4 w-4" aria-hidden />
                    )}
                    <span className="text-[10px] uppercase tracking-[0.18em] font-semibold">
                      {TRAVEL_TYPE_LABEL[t.type]}
                    </span>
                  </span>
                  <p className="mt-2 font-display text-lg md:text-xl font-medium text-tat-charcoal leading-tight">
                    {t.count} {t.count === 1 ? "trip" : "trips"}
                  </p>
                  {t.minPrice > 0 && (
                    <p className="text-xs text-tat-charcoal/55 mt-0.5">
                      from ₹{t.minPrice.toLocaleString("en-IN")}
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-tat-burnt group-hover:gap-1.5 transition-all">
                    Browse <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Packages slider */}
      {packages.length > 0 && (
        <section className="py-14 md:py-16">
          <div className="container-custom">
            <PackageSlider
              id={`dest-${destination.slug}`}
              eyebrow="Curated journeys"
              heading={`Experiences built for <span class="italic text-tat-gold font-light">${destination.name}.</span>`}
              packages={packages}
              viewAllHref={`/packages?destination=${destination.slug}`}
              viewAllLabel="All experiences"
            />
          </div>
        </section>
      )}

      <CTASection
        title={`Dreaming of ${destination.name}?`}
        subtitle="Talk to a planner who knows this destination inside-out. We'll craft it just for you."
      />
    </>
  );
}

function Pill({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-tat-paper/15 backdrop-blur-sm border border-tat-paper/20 text-tat-paper/80 text-[11px] px-3 py-1.5 rounded-full">
      <Icon className="h-3 w-3 text-tat-gold" />{label}
    </span>
  );
}
