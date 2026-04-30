import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Heart, Users, User, Globe2, Mountain, Sunset, Church, Crown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PackageCardProps } from "@/components/ui/PackageCard";

export type StyleId =
  | "Honeymoon" | "Family" | "Solo" | "Group"
  | "Adventure" | "Wellness" | "Pilgrim" | "Luxury";

interface StyleMeta {
  id: StyleId;
  label: string;
  tagline: string;
  icon: LucideIcon;
  fallbackImage: string;
  sampleDestinations: string[];
}

const STYLES: StyleMeta[] = [
  { id: "Honeymoon", label: "Honeymoon", tagline: "Quiet rooms. Late checkouts. Private moments.",                  icon: Heart,    fallbackImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Bali", "Maldives", "Santorini"] },
  { id: "Family",    label: "Family",    tagline: "Kid-aware schedules. Connecting rooms. No rushed mornings.",     icon: Users,    fallbackImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Kerala", "Switzerland", "Singapore"] },
  { id: "Solo",      label: "Solo",      tagline: "One traveler, every detail handled. Safe stays.",                icon: User,     fallbackImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Spiti", "Vietnam", "Japan"] },
  { id: "Group",     label: "Group",     tagline: "8+ travelers, shared rooms or own. Planner along.",              icon: Globe2,   fallbackImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Thailand", "Andaman", "Goa"] },
  { id: "Adventure", label: "Adventure", tagline: "Treks, dives, drives. Real outfits, real guides.",               icon: Mountain, fallbackImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Ladakh", "Spiti", "Nepal"] },
  { id: "Wellness",  label: "Wellness",  tagline: "Slow mornings. Real food. Yoga that doesn't feel performed.",    icon: Sunset,   fallbackImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Rishikesh", "Kerala", "Bali"] },
  { id: "Pilgrim",   label: "Pilgrim",   tagline: "Helicopter darshans. Hotels close to temples.",                  icon: Church,   fallbackImage: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Char Dham", "Vaishno Devi", "Tirupati"] },
  { id: "Luxury",    label: "Luxury",    tagline: "5-star with character. Aman, Six Senses, Soneva when they fit.", icon: Crown,    fallbackImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=75", sampleDestinations: ["Switzerland", "Maldives", "Japan"] },
];

interface Props {
  packagesByStyle?: Partial<Record<StyleId, PackageCardProps[]>>;
}

export default function BrowseByStyle({ packagesByStyle = {} }: Props) {
  return (
    <section
      id="browse"
      aria-labelledby="browse-style-title"
      className="py-14 md:py-20 bg-tat-paper dark:bg-tat-charcoal scroll-mt-44 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Travel your way
            </p>
            <h2
              id="browse-style-title"
              className="mt-2 font-display font-normal text-[26px] md:text-[36px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Browse by{" "}
              <em className="not-italic font-display italic text-tat-gold">how you like to travel.</em>
            </h2>
            <p className="mt-3 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70 max-w-2xl">
              Eight ways to travel — pick the one that fits, we&apos;ll plan the rest.
            </p>
          </div>
          <Link
            href="/packages"
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            Browse all journeys
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
          {STYLES.map((meta) => {
            const trips = packagesByStyle[meta.id] ?? [];
            const heroImage = trips[0]?.image || meta.fallbackImage;
            return <StyleTile key={meta.id} meta={meta} count={trips.length} heroImage={heroImage} />;
          })}
        </div>
      </div>
    </section>
  );
}

function StyleTile({
  meta, count, heroImage,
}: {
  meta: StyleMeta; count: number; heroImage: string;
}) {
  const Icon = meta.icon;
  return (
    <Link
      href={`/packages?style=${encodeURIComponent(meta.id)}`}
      prefetch={false}
      aria-label={`Browse ${meta.label} trips`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-tat-charcoal ring-1 ring-tat-charcoal/10 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/5]">
        <Image
          src={heroImage}
          alt=""
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 23vw"
          quality={55}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal via-tat-charcoal/55 to-tat-charcoal/15" />
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/15 backdrop-blur-sm text-white ring-1 ring-white/20">
            <Icon className="h-3.5 w-3.5" />
          </span>
          {count > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tat-gold text-tat-charcoal text-[10px] font-bold">
              {count}
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
          <h3 className="font-display font-medium text-[16px] md:text-[18px] leading-tight">
            {meta.label}
          </h3>
          <p className="mt-1 text-[11px] md:text-[12px] text-white/75 leading-snug line-clamp-2">
            {meta.tagline}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-wider text-white/55 truncate">
            {meta.sampleDestinations.slice(0, 3).join(" · ")}
          </p>
        </div>
      </div>
    </Link>
  );
}
