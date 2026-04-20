import { notFound } from "next/navigation";
import Link from "next/link";
import { getPackages, getDestinations } from "@/lib/sanity-queries";
import PackageCard from "@/components/PackageCard";
import CTASection from "@/components/CTASection";
import { ArrowRight } from "lucide-react";

// Long-tail SEO routes auto-generated
// e.g. /honeymoon-packages-bali, /family-tour-packages-kerala
const SEO_ROUTES: Record<string, {
  title: string;
  h1: string;
  description: string;
  destination?: string;
  travelType?: string;
  maxPrice?: number;
  keywords: string;
}> = {
  "honeymoon-packages-bali": {
    title: "Bali Honeymoon Packages from India 2026 — Trust and Trip",
    h1: "Bali Honeymoon Packages",
    description: "Handcrafted Bali honeymoon packages for Indian couples. Private villas, candlelit dinners, sunset tours — starting from ₹55,000/person.",
    destination: "bali",
    travelType: "Couple",
    keywords: "bali honeymoon package india, bali couple package, bali honeymoon tour",
  },
  "honeymoon-packages-maldives": {
    title: "Maldives Honeymoon Packages from India — Trust and Trip",
    h1: "Maldives Honeymoon Packages",
    description: "Overwater villas, private beaches, and sunset cruises. Maldives honeymoon packages for Indian couples starting from ₹85,000/person.",
    destination: "maldives",
    travelType: "Couple",
    keywords: "maldives honeymoon package india, maldives couple trip, maldives romantic package",
  },
  "family-tour-packages-kerala": {
    title: "Kerala Family Tour Packages 2026 — Trust and Trip",
    h1: "Kerala Family Tour Packages",
    description: "Kerala family holiday packages with backwaters, hill stations and wildlife. All ages welcome. Starting from ₹28,000/person.",
    destination: "kerala",
    travelType: "Family",
    keywords: "kerala family tour package, kerala family holiday, kerala trip with family",
  },
  "family-tour-packages-dubai": {
    title: "Dubai Family Tour Packages from India — Trust and Trip",
    h1: "Dubai Family Tour Packages",
    description: "Dubai family packages with theme parks, desert safari and skyscrapers. Starting from ₹55,000/person including stay and transfers.",
    destination: "dubai",
    travelType: "Family",
    keywords: "dubai family package india, dubai family tour, dubai holiday package family",
  },
  "budget-international-packages": {
    title: "Budget International Tour Packages from India — Trust and Trip",
    h1: "Budget International Packages",
    description: "International tour packages under ₹50,000 from India. Thailand, Bali, Nepal, Malaysia — world-class travel without the premium price.",
    maxPrice: 50000,
    keywords: "budget international tour package india, cheap international holiday, affordable foreign trip india",
  },
  "honeymoon-packages-thailand": {
    title: "Thailand Honeymoon Packages from India — Trust and Trip",
    h1: "Thailand Honeymoon Packages",
    description: "Phuket, Krabi, Bangkok — Thailand honeymoon packages for Indian couples. Beaches, temples, and Thai cuisine. Starting from ₹35,000/person.",
    destination: "thailand",
    travelType: "Couple",
    keywords: "thailand honeymoon package india, thailand couple trip, phuket honeymoon package",
  },
  "group-tour-packages-goa": {
    title: "Goa Group Tour Packages 2026 — Trust and Trip",
    h1: "Goa Group Tour Packages",
    description: "Goa group trip packages for friends — beaches, nightlife, water sports and more. Starting from ₹15,000/person.",
    destination: "goa",
    travelType: "Group",
    keywords: "goa group tour package, goa trip with friends, goa group holiday",
  },
  "solo-trip-packages-manali": {
    title: "Manali Solo Trip Packages — Trust and Trip",
    h1: "Manali Solo Trip Packages",
    description: "Manali solo travel packages with guided treks, adventure activities and safe stays. Starting from ₹18,000/person.",
    destination: "manali",
    travelType: "Solo",
    keywords: "manali solo trip, manali solo travel package, solo trip manali india",
  },
};

interface Props { params: { seo: string[] } }

export function generateStaticParams() {
  return Object.keys(SEO_ROUTES).map((slug) => ({ seo: [slug] }));
}

export async function generateMetadata({ params }: Props) {
  const slug = params.seo.join("/");
  const route = SEO_ROUTES[slug];
  if (!route) return {};
  return {
    title: route.title,
    description: route.description,
    keywords: route.keywords,
    alternates: { canonical: `https://trustandtrip.com/${slug}` },
    openGraph: { title: route.title, description: route.description },
  };
}

export default async function SeoPage({ params }: Props) {
  const slug = params.seo.join("/");
  const route = SEO_ROUTES[slug];
  if (!route) return notFound();

  const [allPackages, destinations] = await Promise.all([getPackages(), getDestinations()]);

  let packages = allPackages;
  if (route.destination) packages = packages.filter((p) => p.destinationSlug === route.destination);
  if (route.travelType) packages = packages.filter((p) => p.travelType === route.travelType);
  if (route.maxPrice) packages = packages.filter((p) => p.price <= route.maxPrice!);

  const dest = destinations.find((d) => d.slug === route.destination);

  return (
    <>
      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-12 bg-cream border-b border-ink/5">
        <div className="container-custom max-w-4xl">
          <div className="flex items-center gap-2 text-xs text-ink/50 mb-4">
            <Link href="/" className="hover:text-gold">Home</Link>
            <span>/</span>
            <Link href="/packages" className="hover:text-gold">Packages</Link>
            <span>/</span>
            <span className="text-ink/70">{route.h1}</span>
          </div>
          <span className="eyebrow">{route.travelType ?? "Best Deals"}</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-3xl text-balance">
            {route.h1}
            <span className="italic text-gold font-light"> from India.</span>
          </h1>
          <p className="mt-5 text-ink/60 max-w-xl leading-relaxed">{route.description}</p>

          {dest && (
            <div className="flex flex-wrap gap-3 mt-6 text-sm text-ink/60">
              <span>📍 {dest.country}</span>
              <span>·</span>
              <span>⏱️ {dest.idealDuration}</span>
              <span>·</span>
              <span>📅 Best time: {dest.bestTimeToVisit}</span>
              <span>·</span>
              <span>💰 From ₹{dest.priceFrom.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>
      </section>

      {/* Packages */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-ink/60">
              <span className="font-semibold text-ink">{packages.length}</span> packages available
            </p>
            <Link href="/packages" className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-gold transition-colors">
              Browse all packages <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-16 bg-cream rounded-3xl border border-ink/5">
              <p className="font-display text-2xl mb-3">Building this collection</p>
              <p className="text-ink/60 mb-6">Our planners are curating the best options — check back soon or talk to us directly.</p>
              <Link href="/customize-trip" className="btn-primary inline-flex">Customize a trip</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {packages.map((p, i) => (
                <PackageCard
                  key={p.slug} title={p.title} slug={p.slug} image={p.image}
                  duration={p.duration} price={p.price} rating={p.rating}
                  reviews={p.reviews} destinationName={p.destinationName}
                  travelType={p.travelType} trending={p.trending}
                  limitedSlots={p.limitedSlots} highlights={p.highlights}
                  inclusions={p.inclusions} index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection
        title={`Can't find the perfect ${route.h1.toLowerCase()}?`}
        subtitle="Tell us your dates, budget and style — we'll build a custom itinerary just for you."
        primaryLabel="Plan a custom trip"
      />
    </>
  );
}
