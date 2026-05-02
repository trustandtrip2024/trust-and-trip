import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plane, Hotel, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PilgrimRoute {
  slug: string;
  href: string;
  title: string;
  region: string;
  duration: string;
  image: string;
  priceFrom: number;
  highlights: { icon: LucideIcon; text: string }[];
}

// Each href points to an actual package detail page (slugs confirmed
// against Sanity production on 2026-05-01). Card duration + priceFrom
// mirror the live package so visitors don't see a price jump after
// clicking through.
//
// Why Varanasi (and not Vaishno Devi) sits in the third slot: Sanity
// has zero Vaishno Devi packages yet. A "Plan this yatra" CTA pointing
// to a non-existent detail page would 404. A seed script —
// scripts/seed-vaishno-devi.mjs — is queued and ready; once a teammate
// runs it, swap the slot back to Vaishno Devi and update slug/href to
// /packages/vaishno-devi-3n4d-darshan.
const ROUTES: PilgrimRoute[] = [
  {
    slug: "char-dham",
    href: "/packages/uttarakhand-chardham-road-11n12d",
    title: "Char Dham Yatra",
    region: "Yamunotri · Gangotri · Kedarnath · Badrinath",
    duration: "11N · 12D",
    image: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1100&q=75",
    priceFrom: 48000,
    highlights: [
      { icon: Plane,        text: "Helicopter to Kedarnath included" },
      { icon: Hotel,        text: "Hotels under 5 min from temples" },
      { icon: ShieldCheck,  text: "Doctor on call · oxygen kit" },
    ],
  },
  {
    slug: "varanasi",
    href: "/packages/varanasi-family",
    title: "Varanasi & Kashi",
    region: "Kashi Vishwanath · Ganga Aarti · Sarnath",
    duration: "5N · 6D",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1100&q=75",
    priceFrom: 20000,
    highlights: [
      { icon: Sparkles,     text: "Front-row Ganga Aarti at Dashashwamedh" },
      { icon: Hotel,        text: "Heritage stay walking distance to ghats" },
      { icon: ShieldCheck,  text: "Family-friendly pace · senior-suited" },
    ],
  },
  {
    slug: "tirupati",
    href: "/packages/tirupati-family",
    title: "Tirupati Balaji",
    region: "Tirumala · Tirupati · Padmavathi temple",
    duration: "5N · 6D",
    image: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=1100&q=75",
    priceFrom: 15500,
    highlights: [
      { icon: Sparkles,     text: "Special-entry darshan ticket" },
      { icon: Hotel,        text: "Stay near Alipiri footpath" },
      { icon: ShieldCheck,  text: "Senior-friendly transport" },
    ],
  },
  {
    slug: "panchkedar",
    href: "/packages/panchkedar-itinerary-53",
    title: "Panchkedar Yatra",
    region: "Kedarnath · Madhyamaheshwar · Tungnath · Rudranath · Kalpeshwar",
    duration: "14N · 15D",
    image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=1100&q=75",
    priceFrom: 29870,
    highlights: [
      { icon: Plane,        text: "Helicopter to higher Kedars where possible" },
      { icon: Hotel,        text: "Acclimatisation halts on every leg" },
      { icon: ShieldCheck,  text: "Doctor on call · oxygen kit · pony assist" },
    ],
  },
  {
    slug: "ayodhya-prayagraj-chitrakoot",
    href: "/packages/ayodhya-prayagraj-chitrakoot-varanasi-66",
    title: "Ayodhya · Prayagraj · Chitrakoot · Varanasi",
    region: "Ram Mandir · Triveni Sangam · Kashi Vishwanath",
    duration: "5N · 6D",
    image: "https://images.unsplash.com/photo-1707748812537-d7b6796f5715?auto=format&fit=crop&w=1100&q=75",
    priceFrom: 6650,
    highlights: [
      { icon: Sparkles,     text: "Ram Mandir darshan window booked" },
      { icon: Hotel,        text: "Walking-distance hotels at every stop" },
      { icon: ShieldCheck,  text: "VIP queue assistance · senior pace" },
    ],
  },
  {
    slug: "do-dham-lucknow",
    href: "/packages/do-dham-yatra-ex-lucknow-3",
    title: "Do Dham Ex Lucknow",
    region: "Kedarnath · Badrinath · Lucknow pickup",
    duration: "6N · 7D",
    image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1100&q=75",
    priceFrom: 15400,
    highlights: [
      { icon: Plane,        text: "Lucknow pickup · 12-seat traveller" },
      { icon: Hotel,        text: "Hotels at every halt, MAPAI meals" },
      { icon: ShieldCheck,  text: "Doctor on call · helicopter to Kedar" },
    ],
  },
];

function inr(n: number) { return `₹${n.toLocaleString("en-IN")}`; }

export default function PilgrimSpotlight() {
  return (
    <section
      id="pilgrim"
      aria-labelledby="pilgrim-spotlight-title"
      className="py-14 md:py-20 bg-gradient-to-b from-tat-cream-warm/40 to-tat-paper dark:from-tat-charcoal dark:to-tat-charcoal/95 scroll-mt-28 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Pilgrim journeys
            </p>
            <h2
              id="pilgrim-spotlight-title"
              className="mt-2 font-display font-normal text-[26px] md:text-[36px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Char Dham. Varanasi. Tirupati. Panchkedar.{" "}
              <em className="not-italic font-display italic text-tat-gold">Elders looked after.</em>
            </h2>
            <p className="mt-3 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70 max-w-2xl">
              VIP darshan tickets, helicopter transfers, hotels close to the temple gate. Doctor-on-call on every Yatra.
            </p>
          </div>
          <Link
            href="/pilgrim"
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            Pilgrim concierge & all yatras
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {ROUTES.map((r) => (
            <PilgrimCard key={r.slug} route={r} />
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/pilgrim"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            Pilgrim concierge & all yatras
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PilgrimCard({ route }: { route: PilgrimRoute }) {
  return (
    <Link
      href={route.href}
      prefetch={false}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-tat-charcoal ring-1 ring-tat-charcoal/10 dark:ring-white/10 shadow-soft hover:shadow-soft-lg transition-shadow duration-300"
      aria-label={`${route.title} — from ${inr(route.priceFrom)} per person`}
    >
      <div className="relative aspect-[16/10]">
        <Image
          src={route.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          quality={60}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/80 via-tat-charcoal/30 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-[11px] uppercase tracking-wider text-white/75">{route.duration}</p>
          <h3 className="mt-1 font-display font-medium text-[22px] md:text-[24px] leading-tight">
            {route.title}
          </h3>
          <p className="mt-0.5 text-[12px] text-white/80 line-clamp-1">{route.region}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <ul className="flex flex-col gap-2">
          {route.highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <li key={i} className="flex items-start gap-2 text-[13px] text-tat-charcoal/80 dark:text-tat-paper/80">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tat-gold/15 text-tat-gold">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="leading-snug">{h.text}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-1 flex items-center justify-between gap-3 pt-2 border-t border-tat-charcoal/10 dark:border-white/10">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-tat-charcoal/45 dark:text-tat-paper/45">
              Starting from
            </p>
            <p className="font-display text-[20px] font-semibold text-tat-charcoal dark:text-tat-paper leading-tight">
              {inr(route.priceFrom)}
              <span className="ml-1 text-[11px] font-normal text-tat-charcoal/50 dark:text-tat-paper/50">/person</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1 h-9 px-4 rounded-full bg-tat-teal text-white text-[12px] font-semibold whitespace-nowrap group-hover:bg-tat-teal-deep transition-colors">
            Plan this yatra
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
