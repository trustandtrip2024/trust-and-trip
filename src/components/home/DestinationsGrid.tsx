import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import DestinationCardUI from "@/components/ui/DestinationCard";

const u = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=75&auto=format&fit=crop`;

const DESTINATIONS = [
  { name: "Uttarakhand",   country: "India",       region: "Himalayas",        whisper: "Mountains that hold their silence well.", image: u("photo-1561361058-c24cecae35ca"),  href: "/destinations/uttarakhand",      packageCount: 24, priceFrom: 22000 },
  { name: "Kerala",        country: "India",       region: "South India",      whisper: "Slow water, slower mornings.",            image: u("photo-1602216056096-3b40cc0c9944"), href: "/destinations/kerala",            packageCount: 28, priceFrom: 28000 },
  { name: "Ladakh",        country: "India",       region: "Himalayas",        whisper: "Where the road is half the holiday.",     image: u("photo-1622308644420-b20142b1e4fc"), href: "/destinations/ladakh",            packageCount: 16, priceFrom: 30000 },
  { name: "Spiti Valley",  country: "India",       region: "Himachal",         whisper: "Cold deserts and warm tea.",              image: u("photo-1626621341517-bbf3d9990a23"), href: "/destinations/himachal-pradesh",  packageCount: 12, priceFrom: 60000 },
  { name: "Bali",          country: "Indonesia",   region: "Southeast Asia",   whisper: "Green, gentle, and full of surprises.",   image: u("photo-1537996194471-e657df975ab4"), href: "/destinations/bali",              packageCount: 32, priceFrom: 45000 },
  { name: "Maldives",      country: "Maldives",    region: "Indian Ocean",     whisper: "Where the floor is the ocean.",           image: u("photo-1514282401047-d79a71a590e8"), href: "/destinations/maldives",          packageCount: 18, priceFrom: 85000 },
  { name: "Switzerland",   country: "Switzerland", region: "Central Europe",   whisper: "The Alps, on your terms.",                image: u("photo-1527668752968-14dc70a27c95"), href: "/destinations/switzerland",       packageCount: 22, priceFrom: 125000 },
  { name: "Japan",         country: "Japan",       region: "East Asia",        whisper: "Old country, careful detail.",            image: u("photo-1540959733332-eab4deabeeaf"), href: "/destinations/japan",             packageCount: 16, priceFrom: 90000 },
];

export default function DestinationsGrid() {
  return (
    <section aria-labelledby="dest-title" className="py-18 md:py-22">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader
          eyebrow="Destinations"
          title="Worth crossing oceans,"
          italicTail="and state lines."
          lede="Sixty places we know well enough to recommend. Eight of our most-loved are below — the rest are a click away."
        />

        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DESTINATIONS.map((d) => (
            <li key={d.name}>
              <DestinationCardUI {...d} />
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-stone-900 hover:text-amber-700 transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 rounded-sm"
          >
            View all 60+ destinations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
