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
  "spiti-valley-tour-packages": {
    title: "Spiti Valley Tour Packages 2026 — Trust and Trip",
    h1: "Spiti Valley Tour Packages",
    description: "Complete Spiti Valley packages: Shimla–Kaza circuit, solo motorbike expeditions, family-friendly itineraries, and winter snow escapes. Starting from ₹18,000/person.",
    destination: "spiti-valley",
    keywords: "spiti valley tour package, spiti valley trip from delhi, spiti valley package 2026, spiti valley tour",
  },
  "spiti-valley-bike-trip": {
    title: "Spiti Valley Bike Trip Packages — Royal Enfield Expedition | Trust and Trip",
    h1: "Spiti Valley Bike Trip",
    description: "Royal Enfield Spiti Valley motorbike expedition — Manali–Kaza–Shimla circuit. Bike included, support vehicle, fuel, and stays. Starting from ₹28,000/person.",
    destination: "spiti-valley",
    travelType: "Solo",
    keywords: "spiti valley bike trip, spiti valley motorbike tour, royal enfield spiti, spiti bike package",
  },
  "zanskar-valley-tour-packages": {
    title: "Zanskar Valley Tour Packages 2026 — Trust and Trip",
    h1: "Zanskar Valley Tour Packages",
    description: "Summer monastery tours, Chadar frozen river trek, and multi-day Zanskar River rafting. The most remote valley in India, fully arranged. Starting from ₹28,000/person.",
    destination: "zanskar-valley",
    keywords: "zanskar valley tour package, zanskar valley trip, zanskar tour 2026, ladakh zanskar package",
  },
  "chadar-trek-package": {
    title: "Chadar Trek Package 2026 — Walk the Frozen Zanskar River | Trust and Trip",
    h1: "Chadar Trek — Frozen Zanskar River",
    description: "8N/9D Chadar Trek package: walk the frozen Zanskar River in January–February. Cold-weather gear, Zanskari guides, cave camping included. Starting from ₹35,000/person.",
    destination: "zanskar-valley",
    keywords: "chadar trek package, chadar trek cost, frozen river trek ladakh, zanskar river trek package",
  },
  "vietnam-tour-packages-from-india": {
    title: "Vietnam Tour Packages from India 2026 — Trust and Trip",
    h1: "Vietnam Tour Packages from India",
    description: "Visa-free Vietnam packages for Indians: Hanoi, Ha Long Bay, Da Nang, Hoi An, Ho Chi Minh City. 5–8 nights from ₹38,000/person including flights.",
    destination: "vietnam",
    keywords: "vietnam tour package india, vietnam trip from india, vietnam package 2026, vietnam holiday india",
  },
  "ha-long-bay-tour-package": {
    title: "Ha Long Bay Tour Package from India — Trust and Trip",
    h1: "Ha Long Bay Tour Package",
    description: "Overnight Ha Long Bay cruise packages from India — kayaking, floating village, seafood dinner. Combined with Hanoi. From ₹55,000/person.",
    destination: "vietnam",
    travelType: "Couple",
    keywords: "ha long bay package india, ha long bay cruise india, vietnam ha long bay tour package",
  },
  "kedarnath-yatra-package": {
    title: "Kedarnath Yatra Package 2026 — Trek & Helicopter | Trust and Trip",
    h1: "Kedarnath Yatra Package",
    description: "Complete Kedarnath Yatra packages from Haridwar: 16km trek route or helicopter from Phata. Registration, stays, meals and transfers arranged. From ₹18,000/person.",
    destination: "uttarakhand",
    keywords: "kedarnath yatra package, kedarnath tour package, kedarnath dham package 2026, kedarnath trip",
  },
  "char-dham-yatra-package": {
    title: "Char Dham Yatra Package 2026 — By Road & Helicopter | Trust and Trip",
    h1: "Char Dham Yatra Package",
    description: "Complete Char Dham Yatra packages: Yamunotri, Gangotri, Kedarnath, Badrinath. By road from Delhi/Haridwar or by helicopter from Dehradun. From ₹48,000/person.",
    destination: "uttarakhand",
    keywords: "char dham yatra package, char dham tour package 2026, chardham yatra package from delhi, char dham by road",
  },
  "kedarnath-helicopter-package": {
    title: "Kedarnath Helicopter Package 2026 — Trust and Trip",
    h1: "Kedarnath Helicopter Package",
    description: "Kedarnath by helicopter from Phata helipad — 15-minute scenic flight, VIP darshan assistance. 2N/3D package from ₹55,000/person.",
    destination: "uttarakhand",
    keywords: "kedarnath helicopter package, kedarnath helicopter booking, phata to kedarnath helicopter",
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
      <section className="pt-28 md:pt-36 pb-12 bg-tat-paper border-b border-tat-charcoal/5">
        <div className="container-custom max-w-4xl">
          <div className="flex items-center gap-2 text-xs text-tat-charcoal/50 mb-4">
            <Link href="/" className="hover:text-tat-gold">Home</Link>
            <span>/</span>
            <Link href="/packages" className="hover:text-tat-gold">Packages</Link>
            <span>/</span>
            <span className="text-tat-charcoal/70">{route.h1}</span>
          </div>
          <span className="eyebrow">{route.travelType ?? "Best Deals"}</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-3xl text-balance">
            {route.h1}
            <span className="italic text-tat-gold font-light"> from India.</span>
          </h1>
          <p className="mt-5 text-tat-charcoal/60 max-w-xl leading-relaxed">{route.description}</p>

          {dest && (
            <div className="flex flex-wrap gap-3 mt-6 text-sm text-tat-charcoal/60">
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
            <p className="text-sm text-tat-charcoal/60">
              <span className="font-semibold text-tat-charcoal">{packages.length}</span> packages available
            </p>
            <Link href="/packages" className="inline-flex items-center gap-1.5 text-sm text-tat-charcoal/60 hover:text-tat-gold transition-colors">
              Browse all packages <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-16 bg-tat-paper rounded-3xl border border-tat-charcoal/5">
              <p className="font-display text-2xl mb-3">Building this collection</p>
              <p className="text-tat-charcoal/60 mb-6">Our planners are curating the best options — check back soon or talk to us directly.</p>
              <Link href="/customize-trip" className="btn-primary inline-flex">Customize a trip</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
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
