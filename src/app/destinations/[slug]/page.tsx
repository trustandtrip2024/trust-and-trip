export const revalidate = 300;
export const dynamicParams = true;

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDestinationBySlug, getPriorityDestinationSlugs, getPackagesByDestination } from "@/lib/sanity-queries";
import type { Package } from "@/lib/data";
import { DESTINATION_GALLERY } from "@/lib/gallery-images";
import DestinationGallery from "@/components/DestinationGallery";
import PackageSlider from "@/components/PackageSlider";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import {
  destinationBreadcrumbLd,
  destinationFaqLd,
  destinationKeywords,
} from "@/lib/seo-destination";
import { speakableLd, founderPersonLd } from "@/lib/seo-package";
import DestinationStickyNav from "@/components/destinations/DestinationStickyNav";
import DestinationMonthBar from "@/components/destinations/DestinationMonthBar";
import DestinationFAQ from "@/components/destinations/DestinationFAQ";
import DestinationMobileCTA from "@/components/destinations/DestinationMobileCTA";
import {
  Calendar, Clock, MapPin, ChevronRight, ArrowRight, Sun, IndianRupee, Users, Check, Heart, Star, Plane, ShieldCheck,
} from "lucide-react";

interface Props { params: { slug: string } }

// Visa-free for Indian passports — single source of truth could later move
// to Sanity. Kept here so /destinations and /destinations/[slug] stay in sync.
const VISA_FREE_SLUGS = new Set([
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "jordan", "indonesia", "fiji",
]);

export async function generateStaticParams() {
  // Pre-render only the top 20 destinations at build time; ISR covers
  // the long tail. `dynamicParams = true` keeps any other slug working.
  const slugs = await getPriorityDestinationSlugs(20);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const d = await getDestinationBySlug(params.slug);
  if (!d) return {};
  return {
    title: `${d.name} Tour Packages — ${d.tagline}`,
    description: `Explore ${d.name}, ${d.country}. ${d.overview?.slice(0, 155)}…`,
    keywords: destinationKeywords(d),
    authors: [{ name: "Akash Mishra", url: "https://trustandtrip.com/about" }],
    openGraph: {
      title: `${d.name} — ${d.tagline}`,
      description: d.overview?.slice(0, 200),
      type: "website",
      url: `https://trustandtrip.com/destinations/${d.slug}`,
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
  const isVisaFree = VISA_FREE_SLUGS.has(destination.slug);

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

  // Aggregate review/rating across this destination's packages.
  const totalReviews = packages.reduce((s, p) => s + (p.reviews ?? 0), 0);
  const ratedCount = packages.filter((p) => p.rating).length;
  const avgRating = ratedCount
    ? packages.reduce((s, p) => s + (p.rating ?? 0), 0) / ratedCount
    : 0;

  // Editorial featured trip — pick the highest-rated, then highest-reviewed.
  // Falls back to first package when no ratings exist.
  const featuredTrip = [...packages].sort((a, b) => {
    const r = (b.rating ?? 0) - (a.rating ?? 0);
    if (r !== 0) return r;
    return (b.reviews ?? 0) - (a.reviews ?? 0);
  })[0];

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
      <JsonLd data={destinationBreadcrumbLd(destination)} />
      <JsonLd data={destinationFaqLd(destination)} />
      <JsonLd data={speakableLd(["#destination-overview", "#destination-faqs"])} />
      <JsonLd data={founderPersonLd()} />

      {/* Hero — slightly shorter on mobile so the page action is closer to
          the fold (60vh vs 75vh). Desktop unchanged. */}
      <section className="relative h-[60vh] min-h-[420px] md:h-[75vh] md:min-h-[500px] w-full overflow-hidden bg-tat-charcoal">
        <Image src={destination.heroImage} alt={destination.name} fill priority className="object-cover animate-slow-zoom" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/92 via-tat-charcoal/30 to-tat-charcoal/40" />

        <div className="absolute top-20 md:top-24 inset-x-0 z-10 container-custom flex items-center gap-2 text-xs text-tat-paper/60">
          <Link href="/" className="hover:text-tat-gold">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/destinations" className="hover:text-tat-gold">Destinations</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-tat-gold">{destination.name}</span>
        </div>

        <div className="relative h-full flex items-end pb-10 md:pb-16 container-custom text-tat-paper z-10">
          <div className="max-w-3xl">
            <span className="eyebrow text-tat-gold mb-3 block">{destination.country} · {destination.region}</span>
            <h1 className="font-display text-display-xl font-medium leading-[0.95] text-balance">
              {destination.name}
            </h1>
            <p className="mt-3 text-xl italic font-display text-tat-gold font-light">{destination.tagline}</p>

            <div className="flex flex-wrap gap-2 md:gap-3 mt-5 md:mt-6">
              <Pill icon={IndianRupee} label={`From ₹${destination.priceFrom.toLocaleString("en-IN")}`} />
              <Pill icon={Calendar} label={destination.bestTimeToVisit || "Year-round"} />
              <Pill icon={Clock} label={destination.idealDuration || "5–7 days"} />
              {isVisaFree && (
                <span className="inline-flex items-center gap-1.5 bg-tat-success-bg/95 text-tat-success-fg text-[11px] font-semibold px-3 py-1.5 rounded-full">
                  <Plane className="h-3 w-3" />
                  Visa-free for Indian passports
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <DestinationStickyNav />

      {/* Trust ribbon — aggregated proof beneath the hero. Counts, rating,
          visa hint, planner promise. */}
      <section aria-label="Why book this with us" className="border-b border-tat-charcoal/8 dark:border-white/10 bg-tat-paper dark:bg-tat-charcoal">
        <div className="container-custom py-4 md:py-5">
          <ul role="list" className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 text-[12px] md:text-[13px]">
            {avgRating > 0 && totalReviews > 0 && (
              <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70 dark:text-tat-paper/70">
                <Star className="h-4 w-4 fill-tat-gold text-tat-gold" />
                <span><strong className="font-semibold text-tat-charcoal dark:text-tat-paper">{avgRating.toFixed(1)}</strong> · {totalReviews.toLocaleString("en-IN")} reviews</span>
              </li>
            )}
            <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70 dark:text-tat-paper/70">
              <MapPin className="h-4 w-4 text-tat-gold" />
              <span><strong className="font-semibold text-tat-charcoal dark:text-tat-paper">{packages.length}</strong> trips ready</span>
            </li>
            <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70 dark:text-tat-paper/70">
              <ShieldCheck className="h-4 w-4 text-tat-gold" />
              <span><strong className="font-semibold text-tat-charcoal dark:text-tat-paper">₹0</strong> to start · pay only when sure</span>
            </li>
            <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70 dark:text-tat-paper/70">
              <Sun className="h-4 w-4 text-tat-gold" />
              <span>Free changes within <strong className="font-semibold text-tat-charcoal dark:text-tat-paper">48 h</strong> of itinerary</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Photo gallery strip — clickable with lightbox */}
      {gallery.length > 0 && (
        <DestinationGallery images={gallery} name={destination.name} />
      )}

      {/* Overview + quick facts */}
      <section id="overview" className="py-14 md:py-18 scroll-mt-32">
        <div className="container-custom grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-16 items-start">
          <div>
            <span className="eyebrow">About {destination.name}</span>
            <h2 className="heading-section mt-3 mb-5 text-balance">
              The soul of <span className="italic text-tat-gold font-light">{destination.name}.</span>
            </h2>
            <p id="destination-overview" className="text-tat-charcoal/70 leading-relaxed mb-6">{destination.overview}</p>

            <div className="flex flex-wrap gap-2">
              {(destination.highlights || []).map((h) => (
                <span key={h} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-tat-gold/10 border border-tat-gold/20 text-tat-charcoal/80">
                  <Check className="h-3 w-3 text-tat-gold" />{h}
                </span>
              ))}
            </div>
          </div>

          {/* Quick facts card — sticky on desktop so it follows the page. */}
          <aside className="lg:sticky lg:top-32 bg-tat-paper rounded-2xl border border-tat-charcoal/8 p-6 space-y-4">
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
              className="flex items-center justify-center gap-2 w-full bg-tat-teal text-tat-paper py-3 rounded-xl text-sm font-medium hover:bg-tat-teal-deep transition-colors mt-2">
              View all experiences <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>

      {/* Best time — 12-month visualization */}
      <section id="best-time" className="py-12 md:py-14 bg-tat-cream-warm/40 scroll-mt-32">
        <div className="container-custom">
          <div className="max-w-3xl mb-6">
            <span className="eyebrow">Seasonality</span>
            <h2 className="heading-section mt-2 text-balance">
              When {destination.name}{" "}
              <span className="italic text-tat-gold font-light">shines.</span>
            </h2>
          </div>
          <DestinationMonthBar bestTimeToVisit={destination.bestTimeToVisit} />
        </div>
      </section>

      {/* Things to do */}
      {(destination.thingsToDo || []).length > 0 && (
        <section id="experiences" className="py-14 bg-tat-paper scroll-mt-32">
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

      {/* Trip styles */}
      {byType.length > 0 && (
        <section id="trips" className="py-12 md:py-14 scroll-mt-32">
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
                  <span className="inline-flex items-center gap-2 text-tat-gold">
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
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-tat-gold group-hover:gap-1.5 transition-all">
                    Browse <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Editorial featured trip — top-rated as the hero pick before the
          full slider. Drives one-click confidence for indecisive shoppers. */}
      {featuredTrip && (
        <section className="py-12 md:py-14 bg-tat-cream-warm/40">
          <div className="container-custom">
            <div className="rounded-3xl overflow-hidden bg-white ring-1 ring-tat-charcoal/8 shadow-soft grid md:grid-cols-2">
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[320px]">
                <Image
                  src={featuredTrip.image}
                  alt={featuredTrip.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-tat-gold text-white text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-white" />
                  Editor&rsquo;s pick
                </span>
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center gap-3">
                <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
                  If you only book one trip in {destination.name}
                </span>
                <h3 className="font-display text-[22px] md:text-[28px] font-medium text-tat-charcoal leading-tight">
                  {featuredTrip.title}
                </h3>
                <div className="flex items-center gap-3 text-[13px] text-tat-charcoal/65">
                  <span>{featuredTrip.duration}</span>
                  <span>·</span>
                  <span>{featuredTrip.travelType}</span>
                  {featuredTrip.rating ? (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-tat-gold text-tat-gold" />
                        {featuredTrip.rating.toFixed(1)}
                      </span>
                    </>
                  ) : null}
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-display text-2xl text-tat-charcoal">
                    ₹{featuredTrip.price.toLocaleString("en-IN")}
                    <span className="text-[11px] text-tat-charcoal/55 ml-1 font-sans">/ person</span>
                  </p>
                  <Link
                    href={`/packages/${featuredTrip.slug}`}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-tat-teal hover:bg-tat-teal-deep text-white text-[13px] font-semibold"
                  >
                    See itinerary <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Packages slider */}
      {packages.length > 0 && (
        <section id="packages" className="py-14 md:py-16 scroll-mt-32">
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

      {/* FAQ */}
      <section id="destination-faqs" className="py-14 md:py-16 bg-tat-cream-warm/30 scroll-mt-32">
        <div className="container-custom max-w-3xl">
          <span className="eyebrow">Common questions</span>
          <h2 className="heading-section mt-2 mb-6 text-balance">
            Anything you&rsquo;d ask{" "}
            <span className="italic text-tat-gold font-light">a planner.</span>
          </h2>
          <DestinationFAQ
            destinationName={destination.name}
            bestTimeToVisit={destination.bestTimeToVisit}
            idealDuration={destination.idealDuration}
            priceFrom={destination.priceFrom}
            visaFree={isVisaFree}
            packageCount={packages.length}
          />
        </div>
      </section>

      <CTASection
        title={`Dreaming of ${destination.name}?`}
        subtitle="Talk to a planner who knows this destination inside-out. We'll craft it just for you."
      />

      {/* Bottom-fixed CTA bar — mobile only. Always-visible action so the
          page never feels stranded mid-scroll. */}
      <DestinationMobileCTA
        destinationName={destination.name}
        destinationSlug={destination.slug}
        priceFrom={destination.priceFrom}
      />
      {/* Spacer so fixed CTA never overlaps page bottom on mobile. */}
      <div className="h-20 lg:hidden" aria-hidden />
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
