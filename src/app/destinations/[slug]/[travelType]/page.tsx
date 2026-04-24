// SEO landing page: /destinations/[slug]/[travelType]
// e.g. /destinations/bali/honeymoon, /destinations/kerala/family
//
// Statically generated for the popular {destination × travel-type} matrix to
// rank for long-tail queries like "Bali honeymoon packages from India".

export const revalidate = 60;
export const dynamicParams = false; // 404 anything not in generateStaticParams

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDestinationBySlug, getPackagesByDestination } from "@/lib/sanity-queries";
import JsonLd from "@/components/JsonLd";
import PackageSlider from "@/components/PackageSlider";
import { ChevronRight, IndianRupee, Calendar, Clock, ArrowRight } from "lucide-react";
import type { Package } from "@/lib/data";

const BASE = "https://trustandtrip.com";

// Canonical travel-type config — keys are URL slugs, values are SEO copy + filters.
const TRAVEL_TYPES: Record<string, {
  label: string;
  packageType: Package["travelType"];
  hero: string;
  intro: string;
  whyCopy: string[];
}> = {
  honeymoon: {
    label: "Honeymoon",
    packageType: "Couple",
    hero: "Honeymoon packages designed for couples",
    intro: "Romantic resorts, candlelit dinners, hand-picked private moments — handcrafted itineraries for newlyweds.",
    whyCopy: [
      "Private transfers + romantic touches included",
      "Sunset/seaview rooms wherever possible",
      "24/7 concierge through your trip",
    ],
  },
  family: {
    label: "Family",
    packageType: "Family",
    hero: "Family holiday packages — kids welcome",
    intro: "Family-friendly hotels, easy itineraries, age-appropriate experiences. Stress-free planning so you can focus on the memories.",
    whyCopy: [
      "Family rooms / connecting rooms verified by us",
      "Age-appropriate activities suggested in every itinerary",
      "Flexible meal plans + kid-friendly menus",
    ],
  },
  group: {
    label: "Group",
    packageType: "Group",
    hero: "Group tour packages — friends, colleagues, milestones",
    intro: "Coordinated transport, group rates, optional shared rooms. Built for friend trips, college reunions, work outings, and milestone celebrations.",
    whyCopy: [
      "Group discounts on stays + activities",
      "Single point of contact for the whole group",
      "Custom add-ons for special occasions",
    ],
  },
  solo: {
    label: "Solo",
    packageType: "Solo",
    hero: "Solo trip packages — safe, sociable, well-paced",
    intro: "Carefully curated solo-friendly stays, optional group activities, no single-supplement surprises.",
    whyCopy: [
      "Female-friendly + verified-safe accommodations",
      "Optional activities to meet other travellers",
      "Transparent costs, no hidden single-occupancy fees",
    ],
  },
};

const POPULAR_DESTINATION_SLUGS = [
  "bali", "maldives", "thailand", "dubai", "singapore", "vietnam",
  "kerala", "goa", "kashmir", "rajasthan", "himachal-pradesh", "andaman",
  "ladakh", "sri-lanka", "switzerland", "santorini",
];

interface Props { params: { slug: string; travelType: string } }

export async function generateStaticParams() {
  const params: { slug: string; travelType: string }[] = [];
  for (const slug of POPULAR_DESTINATION_SLUGS) {
    for (const travelType of Object.keys(TRAVEL_TYPES)) {
      params.push({ slug, travelType });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props) {
  const cfg = TRAVEL_TYPES[params.travelType];
  if (!cfg) return {};
  const dest = await getDestinationBySlug(params.slug);
  if (!dest) return {};
  const title = `${dest.name} ${cfg.label} Packages — From ₹${dest.priceFrom.toLocaleString("en-IN")}`;
  const description = `Best ${cfg.label.toLowerCase()} packages for ${dest.name} — handcrafted by Trust and Trip. ${cfg.intro.slice(0, 100)}`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/destinations/${dest.slug}/${params.travelType}` },
    openGraph: {
      title,
      description,
      images: [{ url: dest.heroImage, width: 1200, height: 630, alt: `${dest.name} ${cfg.label}` }],
    },
  };
}

export default async function DestinationTravelTypePage({ params }: Props) {
  const cfg = TRAVEL_TYPES[params.travelType];
  if (!cfg) return notFound();

  const dest = await getDestinationBySlug(params.slug);
  if (!dest) return notFound();

  const allPackages = await getPackagesByDestination(dest.slug);
  // Match either the typed travelType or a title/description hint (covers Sanity rows
  // with looser type tagging).
  const packages = allPackages.filter((p) => {
    if (p.travelType === cfg.packageType) return true;
    const hay = `${p.title ?? ""} ${p.description ?? ""}`.toLowerCase();
    return hay.includes(cfg.label.toLowerCase());
  });

  const minPrice = packages.length ? Math.min(...packages.map((p) => p.price)) : dest.priceFrom;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Destinations", item: `${BASE}/destinations` },
      { "@type": "ListItem", position: 3, name: dest.name, item: `${BASE}/destinations/${dest.slug}` },
      { "@type": "ListItem", position: 4, name: `${cfg.label} packages`, item: `${BASE}/destinations/${dest.slug}/${params.travelType}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        name: `${dest.name} for ${cfg.label}`,
        description: cfg.intro,
        url: `${BASE}/destinations/${dest.slug}/${params.travelType}`,
        image: dest.heroImage,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice: minPrice,
          highPrice: packages.length ? Math.max(...packages.map((p) => p.price)) : minPrice,
          offerCount: packages.length || 1,
        },
      }} />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-ink">
        <Image src={dest.heroImage} alt={`${dest.name} for ${cfg.label}`} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/50 to-ink/40" />

        <div className="absolute top-24 inset-x-0 z-10 container-custom flex items-center gap-2 text-xs text-cream/60 flex-wrap">
          <Link href="/" className="hover:text-gold">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/destinations" className="hover:text-gold">Destinations</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/destinations/${dest.slug}`} className="hover:text-gold">{dest.name}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gold">{cfg.label}</span>
        </div>

        <div className="relative h-full flex items-end pb-12 md:pb-16 container-custom text-cream z-10">
          <div className="max-w-3xl">
            <span className="eyebrow text-gold mb-3 block">{dest.name} · {dest.country}</span>
            <h1 className="font-display text-4xl md:text-6xl font-medium leading-[0.95] text-balance">
              {cfg.hero}
            </h1>
            <p className="mt-3 text-lg text-cream/80 max-w-xl leading-relaxed">{cfg.intro}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Pill icon={IndianRupee} label={`From ₹${minPrice.toLocaleString("en-IN")}`} />
              <Pill icon={Calendar} label={dest.bestTimeToVisit || "Year-round"} />
              <Pill icon={Clock} label={dest.idealDuration || "5–7 days"} />
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-14 container-custom">
        <h2 className="heading-section text-center max-w-2xl mx-auto mb-10">
          Why our {cfg.label.toLowerCase()} trips to {dest.name} stand out
        </h2>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {cfg.whyCopy.map((p, i) => (
            <div key={i} className="bg-cream rounded-2xl p-6 border border-ink/8 shadow-soft">
              <div className="h-9 w-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center font-display text-sm font-medium mb-4">
                {i + 1}
              </div>
              <p className="text-sm text-ink/80 leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="bg-sand py-14">
        <div className="container-custom">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <span className="eyebrow text-gold">Hand-picked</span>
              <h2 className="heading-section mt-1">{cfg.label} packages in {dest.name}</h2>
            </div>
            <Link href={`/destinations/${dest.slug}`} className="text-sm text-ink/70 hover:text-gold inline-flex items-center gap-1">
              All {dest.name} packages <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {packages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ink/8 p-10 text-center">
              <p className="text-ink/60 mb-4">
                We don&apos;t have an off-the-shelf {cfg.label.toLowerCase()} package for {dest.name} listed online —
                but we build custom itineraries for {cfg.label.toLowerCase()} trips here regularly.
              </p>
              <Link href="/customize-trip" className="btn-primary inline-flex items-center gap-2">
                Build a custom {cfg.label.toLowerCase()} trip
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <PackageSlider
              id={`${dest.slug}-${params.travelType}-packages`}
              eyebrow="Curated for you"
              heading={`${cfg.label} packages in ${dest.name}`}
              packages={packages}
              viewAllHref={`/destinations/${dest.slug}`}
              viewAllLabel={`All ${dest.name} packages`}
            />
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 container-custom">
        <div className="bg-ink rounded-3xl p-10 md:p-14 text-cream text-center max-w-3xl mx-auto">
          <span className="eyebrow text-gold">Customise it</span>
          <h2 className="heading-section text-cream mt-2">
            None of these match your dates?
          </h2>
          <p className="mt-3 text-cream/70 max-w-xl mx-auto leading-relaxed">
            Tell us what you have in mind and we&apos;ll send a {cfg.label.toLowerCase()}
            itinerary for {dest.name} tailored to your dates and budget within 24 hours.
          </p>
          <Link href={`/customize-trip?destination=${encodeURIComponent(dest.slug)}&travelType=${encodeURIComponent(cfg.packageType)}`}
            className="btn-primary mt-6 inline-flex items-center gap-2">
            Plan my {cfg.label.toLowerCase()} trip
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function Pill({ icon: Icon, label }: { icon: typeof IndianRupee; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-cream/12 border border-cream/20 backdrop-blur-sm text-cream rounded-full px-3.5 py-1.5 text-xs font-medium">
      <Icon className="h-3.5 w-3.5 text-gold" />
      {label}
    </span>
  );
}
