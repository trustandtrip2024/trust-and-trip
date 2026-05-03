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
  pitch: string;
  icon: LucideIcon;
  fallbackImage: string;
  sampleDestinations: string[];
  // Single-word badge — replaces generic counts and gives each style its
  // own personality at a glance ("Romance", "Multi-gen", "Self-paced"...).
  vibe: string;
}

const STYLES: StyleMeta[] = [
  { id: "Honeymoon", label: "Honeymoon", tagline: "Quiet rooms. Late checkouts. Private moments.",                  pitch: "Couple-only stays, slow itineraries, the kind of pacing where breakfast at 11 is fine.",            icon: Heart,    fallbackImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=75", sampleDestinations: ["Bali", "Maldives", "Santorini"], vibe: "Romance" },
  { id: "Family",    label: "Family",    tagline: "Kid-aware schedules. Connecting rooms. No rushed mornings.",     pitch: "Strollers welcome, milk-friendly stops, and rooms big enough that everyone gets a bed.",            icon: Users,    fallbackImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1400&q=75", sampleDestinations: ["Kerala", "Switzerland", "Singapore"], vibe: "Multi-gen" },
  { id: "Solo",      label: "Solo",      tagline: "One traveler, every detail handled. Safe stays.",                pitch: "Verified stays, female-friendly hosts, transfer that knows your flight number.",                  icon: User,     fallbackImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=75", sampleDestinations: ["Spiti", "Vietnam", "Japan"], vibe: "Self-paced" },
  { id: "Group",     label: "Group",     tagline: "8+ travelers, shared rooms or own. Planner along.",              pitch: "Your friends, your offsite, your reunion — one bus, one bill, one planner who answers calls.",     icon: Globe2,   fallbackImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=75", sampleDestinations: ["Thailand", "Andaman", "Goa"], vibe: "Together" },
  { id: "Adventure", label: "Adventure", tagline: "Treks, dives, drives. Real outfits, real guides.",               pitch: "Permits handled, gear listed, contingency days built in for weather that doesn't read brochures.", icon: Mountain, fallbackImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=75", sampleDestinations: ["Ladakh", "Spiti", "Nepal"], vibe: "High-octane" },
  { id: "Wellness",  label: "Wellness",  tagline: "Slow mornings. Real food. Yoga that doesn't feel performed.",    pitch: "Ayurveda doctors on staff, organic kitchens, programs that let you actually rest.",                icon: Sunset,   fallbackImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=75", sampleDestinations: ["Rishikesh", "Kerala", "Bali"], vibe: "Reset" },
  { id: "Pilgrim",   label: "Pilgrim",   tagline: "Helicopter darshans. Hotels close to temples.",                  pitch: "Doctor on call, oxygen for high-altitude shrines, VIP darshan and palki when needed.",            icon: Church,   fallbackImage: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=1400&q=75", sampleDestinations: ["Char Dham", "Vaishno Devi", "Tirupati"], vibe: "Sacred" },
  { id: "Luxury",    label: "Luxury",    tagline: "5-star with character. Aman, Six Senses, Soneva when they fit.", pitch: "Branded suites only when they earn the badge. Private guides, private transfers, private pace.",   icon: Crown,    fallbackImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=75", sampleDestinations: ["Switzerland", "Maldives", "Japan"], vibe: "Bespoke" },
];

interface Props {
  packagesByStyle?: Partial<Record<StyleId, PackageCardProps[]>>;
}

// Re-shaped from the old 4-col uniform grid into a magazine layout: a
// large feature card spans the first two columns + two rows on desktop,
// and the remaining six styles drop into a tight 4-col secondary grid.
// On tablets the feature compresses to full width; on phones every tile
// stacks. Reads less like a catalogue, more like a "ways we plan trips"
// editorial.
export default function BrowseByStyle({ packagesByStyle = {} }: Props) {
  // Rotate the feature slot weekly so visitors don't always see the same
  // hero. Deterministic by ISO week so the SSR markup matches the client
  // and we don't lose ISR caching.
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const featureIdx = week % STYLES.length;
  const feature = STYLES[featureIdx];
  const rest = STYLES.filter((_, i) => i !== featureIdx);

  const heroImageFor = (meta: StyleMeta) =>
    (packagesByStyle[meta.id] ?? [])[0]?.image || meta.fallbackImage;
  const countFor = (meta: StyleMeta) => (packagesByStyle[meta.id] ?? []).length;

  return (
    <section
      id="browse"
      aria-labelledby="browse-style-title"
      className="py-12 md:py-16 bg-tat-paper dark:bg-tat-charcoal scroll-mt-28 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Travel your way
            </p>
            <h2
              id="browse-style-title"
              className="mt-2 font-display font-normal text-[24px] md:text-[30px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Eight ways to travel.{" "}
              <em className="not-italic font-display italic text-tat-gold">One that&apos;s yours.</em>
            </h2>
            <p className="mt-3 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70 max-w-2xl">
              Each style is a distinct planning playbook — different hotels, different pacing, different concierge depth. Tell us the vibe and the rest is ours.
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

        <div className="mt-7 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 lg:gap-5 md:auto-rows-[1fr]">
          <FeatureTile
            meta={feature}
            count={countFor(feature)}
            heroImage={heroImageFor(feature)}
          />
          {rest.map((meta) => (
            <CompactTile
              key={meta.id}
              meta={meta}
              count={countFor(meta)}
              heroImage={heroImageFor(meta)}
            />
          ))}
        </div>

        {/* Mobile-only "see all styles" link — desktop has the header CTA */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            Browse all journeys
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Large editorial card — feature slot. Spans 2x2 on desktop. Image takes
// most of the canvas; text sits on a dark plate at the bottom with the
// pitch line + sample destinations rendered as soft chips.
function FeatureTile({
  meta, count, heroImage,
}: {
  meta: StyleMeta; count: number; heroImage: string;
}) {
  const Icon = meta.icon;
  return (
    <Link
      href={`/packages?style=${encodeURIComponent(meta.id)}`}
      prefetch={false}
      aria-label={`Browse ${meta.label} trips — featured`}
      className="group relative md:col-span-2 md:row-span-2 flex flex-col overflow-hidden rounded-3xl bg-tat-charcoal ring-1 ring-tat-charcoal/10 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] md:aspect-auto md:h-full md:min-h-[420px]">
        <Image
          src={heroImage}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={70}
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal via-tat-charcoal/55 to-tat-charcoal/0" />

        {/* Top row: vibe badge + count */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tat-gold text-tat-charcoal text-[10px] font-bold uppercase tracking-wider">
            <Icon className="h-3 w-3" />
            Featured · {meta.vibe}
          </span>
          {count > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-semibold ring-1 ring-white/20">
              {count} trips
            </span>
          )}
        </div>

        {/* Bottom plate: editorial copy */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 text-white">
          <h3 className="font-display font-medium text-[24px] md:text-[34px] leading-tight">
            {meta.label}
          </h3>
          <p className="mt-2 text-[14px] md:text-[15px] text-white/85 leading-snug max-w-md">
            {meta.pitch}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {meta.sampleDestinations.slice(0, 4).map((d) => (
              <span
                key={d}
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[11px] font-medium ring-1 ring-white/15"
              >
                {d}
              </span>
            ))}
            <span className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold text-tat-gold group-hover:gap-2 transition-all">
              Explore
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Compact secondary tile — lives in the 4-col secondary grid. Same data
// shape as the feature, less editorial copy. Pitch line truncates at
// two lines so each card stays even.
function CompactTile({
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
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white dark:bg-white/[0.03] ring-1 ring-tat-charcoal/8 dark:ring-white/10 hover:ring-tat-gold/40 hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10]">
        <Image
          src={heroImage}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 23vw"
          quality={60}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/45 via-transparent to-transparent" />
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 text-tat-charcoal text-[9px] font-bold uppercase tracking-wider">
          <Icon className="h-2.5 w-2.5" />
          {meta.vibe}
        </span>
        {count > 0 && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center px-1.5 py-0.5 rounded-full bg-tat-charcoal/70 backdrop-blur-sm text-white text-[10px] font-bold">
            {count}
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-1.5 p-3 md:p-4">
        <h3 className="font-display font-medium text-[15px] md:text-[17px] leading-tight text-tat-charcoal dark:text-tat-paper group-hover:text-tat-gold transition-colors">
          {meta.label}
        </h3>
        <p className="text-[11px] md:text-[12px] text-tat-charcoal/65 dark:text-tat-paper/65 leading-snug line-clamp-2">
          {meta.tagline}
        </p>
        <p className="mt-auto pt-2 text-[10px] uppercase tracking-wider text-tat-charcoal/45 dark:text-tat-paper/45 truncate">
          {meta.sampleDestinations.slice(0, 3).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
