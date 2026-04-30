export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Heart, Users, User, Globe2, Mountain, Sunset, Church, Crown,
  Wallet, Clock, MapPin, Plane,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getPackages, getDestinations } from "@/lib/sanity-queries";
import type { Package } from "@/lib/data";
import JsonLd from "@/components/JsonLd";

const SITE = "https://trustandtrip.com";

export const metadata = {
  title: "Browse holidays — by region, style, duration, budget · Trust and Trip",
  description: "Pick the angle that fits — region, travel style, duration, or budget. Then jump straight into matching trips with a real planner ready to customise.",
  alternates: { canonical: `${SITE}/browse` },
  openGraph: {
    title: "Browse holidays your way · Trust and Trip",
    description: "Region, style, duration, budget — four ways to narrow down 130+ packages.",
  },
};

interface RegionMeta { id: string; label: string; image: string; }
interface StyleMeta { id: string; label: string; query: string; icon: LucideIcon; image: string; tagline: string; }
interface DurationMeta { id: string; label: string; range: [number, number]; image: string; tagline: string; }
interface BudgetMeta { id: string; label: string; range: [number, number]; image: string; tagline: string; }

const REGIONS: RegionMeta[] = [
  { id: "Asia",        label: "Asia",         image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=60" },
  { id: "Europe",      label: "Europe",       image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=900&q=60" },
  { id: "Middle East", label: "Middle East",  image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=60" },
  { id: "Africa",      label: "Africa",       image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=900&q=60" },
  { id: "Americas",    label: "Americas",     image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=900&q=60" },
  { id: "Oceania",     label: "Oceania",      image: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=900&q=60" },
];

const STYLES: StyleMeta[] = [
  { id: "Honeymoon", label: "Honeymoon", query: "?style=Honeymoon", icon: Heart,    tagline: "Quiet rooms. Late checkouts.",                  image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=55" },
  { id: "Family",    label: "Family",    query: "?style=Family",    icon: Users,    tagline: "Connecting rooms. No rushed mornings.",         image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=55" },
  { id: "Solo",      label: "Solo",      query: "?style=Solo",      icon: User,     tagline: "One traveler, every detail handled.",            image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=55" },
  { id: "Group",     label: "Group",     query: "?style=Group",     icon: Globe2,   tagline: "8+ travelers, planner along.",                   image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=55" },
  { id: "Adventure", label: "Adventure", query: "?style=Adventure", icon: Mountain, tagline: "Treks, dives, real outfits.",                    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=55" },
  { id: "Wellness",  label: "Wellness",  query: "?style=Wellness",  icon: Sunset,   tagline: "Slow mornings, real food.",                      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=55" },
  { id: "Pilgrim",   label: "Pilgrim",   query: "?theme=yatra",     icon: Church,   tagline: "VIP darshan, hotels by the temple.",             image: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=55" },
  { id: "Luxury",    label: "Luxury",    query: "?style=Luxury",    icon: Crown,    tagline: "Aman, Six Senses, Soneva when they fit.",        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=55" },
];

const DURATIONS: DurationMeta[] = [
  { id: "1-3",  label: "1 – 3 nights",  range: [1, 3],   tagline: "Long weekend, quick reset.",       image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=55" },
  { id: "4-6",  label: "4 – 6 nights",  range: [4, 6],   tagline: "Classic short break.",             image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=55" },
  { id: "7-9",  label: "7 – 9 nights",  range: [7, 9],   tagline: "Most-asked length, full immersion.", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=55" },
  { id: "10+",  label: "10+ nights",    range: [10, 99], tagline: "Big trips, multiple stops.",       image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=55" },
];

const BUDGETS: BudgetMeta[] = [
  { id: "under-50k", label: "Under ₹50,000",   range: [0, 50000],            tagline: "Real trips that fit a tight budget.",        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=55" },
  { id: "50k-1L",    label: "₹50,000 – ₹1L",    range: [50000, 100000],       tagline: "Solid mid-range, comfortable hotels.",       image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=55" },
  { id: "1L-2L",     label: "₹1L – ₹2L",        range: [100000, 200000],      tagline: "Premium hotels, business-class flights.",    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=55" },
  { id: "2L+",       label: "₹2L +",            range: [200000, Infinity],    tagline: "Aman, Soneva, Six Senses — when they fit.",   image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=55" },
];

function inDuration(p: Package, [min, max]: [number, number]) {
  return p.nights >= min && p.nights <= max;
}
function inBudget(p: Package, [min, max]: [number, number]) {
  return p.price >= min && p.price < max;
}

export default async function BrowsePage() {
  const [packages, destinations] = await Promise.all([getPackages(), getDestinations()]);

  const regionCounts = Object.fromEntries(
    REGIONS.map((r) => [r.id, destinations.filter((d) => d.region === r.id).length])
  );
  const styleCounts = Object.fromEntries(
    STYLES.map((s) => {
      if (s.id === "Pilgrim")
        return [s.id, packages.filter((p) => /pilgrim|yatra|dham|tirupati|vaishno/i.test(p.title + p.destinationName)).length];
      if (s.id === "Adventure" || s.id === "Wellness" || s.id === "Luxury")
        return [s.id, packages.filter((p) => p.title.toLowerCase().includes(s.id.toLowerCase())).length];
      return [s.id, packages.filter((p) => p.travelType === (s.id === "Honeymoon" ? "Couple" : s.id)).length];
    })
  );
  const durationCounts = Object.fromEntries(
    DURATIONS.map((d) => [d.id, packages.filter((p) => inDuration(p, d.range)).length])
  );
  const budgetCounts = Object.fromEntries(
    BUDGETS.map((b) => [b.id, packages.filter((p) => inBudget(p, b.range)).length])
  );

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Browse", item: `${SITE}/browse` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbs} />

      <section className="pt-28 md:pt-36 pb-12 md:pb-16 bg-tat-paper border-b border-tat-charcoal/5">
        <div className="container-custom">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
            Browse holidays
          </p>
          <h1 className="mt-3 font-display font-normal text-[32px] md:text-[48px] lg:text-[58px] leading-[1.05] max-w-3xl text-balance">
            Pick the angle that fits.{" "}
            <em className="not-italic font-display italic text-tat-gold">We&apos;ll handle the rest.</em>
          </h1>
          <p className="mt-5 text-body-sm text-tat-charcoal/70 max-w-2xl">
            Region, style, duration, or budget — four ways to narrow {packages.length}+ packages
            across {destinations.length}+ destinations. Or skip ahead and{" "}
            <Link href="/packages" className="text-tat-gold font-semibold hover:underline underline-offset-4">
              browse the full catalog →
            </Link>
          </p>
        </div>
      </section>

      {/* Region */}
      <FacetSection
        eyebrow="By region"
        title="Where in the world?"
        italicTail="6 regions."
        lede="From Asia&rsquo;s temples to Europe&rsquo;s alps — pick a continent and we&rsquo;ll show you the trips."
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {REGIONS.map((r) => (
            <FacetTile
              key={r.id}
              href={`/packages?region=${encodeURIComponent(r.id)}`}
              label={r.label}
              image={r.image}
              count={regionCounts[r.id]}
              countLabel="destinations"
              sublabel={null}
              icon={MapPin}
            />
          ))}
        </div>
      </FacetSection>

      {/* Style */}
      <FacetSection
        eyebrow="By travel style"
        title="How do you like to"
        italicTail="travel?"
        lede="Eight ways to travel — pick the one that fits, we&rsquo;ll tune the rest."
        bg="cream"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {STYLES.map((s) => (
            <FacetTile
              key={s.id}
              href={`/packages${s.query}`}
              label={s.label}
              image={s.image}
              count={styleCounts[s.id]}
              countLabel="trips"
              sublabel={s.tagline}
              icon={s.icon}
            />
          ))}
        </div>
      </FacetSection>

      {/* Duration */}
      <FacetSection
        eyebrow="By duration"
        title="How long can you"
        italicTail="get away?"
        lede="A weekend, a week, or longer. Match the trip to the leave you have."
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {DURATIONS.map((d) => (
            <FacetTile
              key={d.id}
              href={`/packages?duration=${encodeURIComponent(d.id)}`}
              label={d.label}
              image={d.image}
              count={durationCounts[d.id]}
              countLabel="trips"
              sublabel={d.tagline}
              icon={Clock}
            />
          ))}
        </div>
      </FacetSection>

      {/* Budget */}
      <FacetSection
        eyebrow="By budget"
        title="What&rsquo;s the"
        italicTail="brief?"
        lede="Honest line-item pricing on every trip — no inflated MRPs, no hidden markups."
        bg="cream"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {BUDGETS.map((b) => (
            <FacetTile
              key={b.id}
              href={`/packages?budget=${b.id}`}
              label={b.label}
              image={b.image}
              count={budgetCounts[b.id]}
              countLabel="trips"
              sublabel={b.tagline}
              icon={Wallet}
            />
          ))}
        </div>
      </FacetSection>

      {/* Final nudge */}
      <section className="py-14 md:py-20 bg-tat-charcoal text-tat-paper text-center">
        <div className="container-custom">
          <h2 className="font-display font-normal text-[26px] md:text-[36px] leading-tight">
            Still narrowing it down?{" "}
            <em className="not-italic font-display italic text-tat-gold">Just tell us what you love.</em>
          </h2>
          <p className="mt-3 text-body-sm text-tat-paper/70 max-w-2xl mx-auto">
            A real planner reads your brief and sends a full itinerary in 24 hours. Free until you book.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/customize-trip"
              className="inline-flex items-center gap-1.5 h-12 px-6 rounded-full bg-tat-orange text-white font-semibold text-[14px] shadow-sm hover:bg-tat-orange/90"
            >
              <Plane className="h-4 w-4" />
              Plan my trip
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/packages"
              prefetch={false}
              className="inline-flex items-center gap-1.5 h-12 px-6 rounded-full bg-white/10 text-tat-paper font-semibold text-[14px] ring-1 ring-white/20 hover:bg-white/15"
            >
              All packages
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FacetSection({
  eyebrow, title, italicTail, lede, bg = "paper", children,
}: {
  eyebrow: string; title: string; italicTail: string; lede: string;
  bg?: "paper" | "cream"; children: React.ReactNode;
}) {
  return (
    <section className={`py-12 md:py-16 ${bg === "cream" ? "bg-tat-cream-warm/40" : "bg-tat-paper"}`}>
      <div className="container-custom">
        <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">{eyebrow}</p>
        <h2 className="mt-2 font-display font-normal text-[24px] md:text-[32px] leading-tight text-tat-charcoal text-balance">
          {title}{" "}
          <em className="not-italic font-display italic text-tat-gold">{italicTail}</em>
        </h2>
        <p className="mt-3 text-body-sm text-tat-charcoal/70 max-w-2xl" dangerouslySetInnerHTML={{ __html: lede }} />
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

function FacetTile({
  href, label, image, count, countLabel, sublabel, icon: Icon,
}: {
  href: string; label: string; image: string;
  count: number; countLabel: string;
  sublabel: string | null;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-tat-charcoal ring-1 ring-tat-charcoal/10 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/5]">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
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
              {count} {countLabel}
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
          <h3 className="font-display font-medium text-[16px] md:text-[18px] leading-tight">
            {label}
          </h3>
          {sublabel && (
            <p className="mt-1 text-[11px] md:text-[12px] text-white/75 leading-snug line-clamp-2">
              {sublabel}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
