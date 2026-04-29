"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Clock, ArrowRight, Sparkles, Sun, Hourglass } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import LiveStatLine from "@/components/home/LiveStatLine";

type DealKind = "flash" | "early-bird" | "last-minute" | "honeymoon" | "yatra";

interface Deal {
  slug: string;
  href: string;
  title: string;
  destination: string;
  duration: string;
  image: string;
  originalPrice: number;
  dealPrice: number;
  endsInHours: number;
  kind: DealKind;
}

const KIND_META: Record<DealKind, { label: string; icon: typeof Flame; tone: string }> = {
  flash:        { label: "Flash deal",    icon: Flame,     tone: "bg-tat-orange text-white" },
  "early-bird": { label: "Early bird",    icon: Sun,       tone: "bg-tat-gold text-tat-charcoal" },
  "last-minute":{ label: "Last minute",   icon: Hourglass, tone: "bg-tat-orange text-white" },
  honeymoon:    { label: "Honeymoon",     icon: Sparkles,  tone: "bg-tat-orange text-white" },
  yatra:        { label: "Yatra special", icon: Sparkles,  tone: "bg-tat-warning-fg text-white" },
};

const DEALS: Deal[] = [
  {
    slug: "bali-honeymoon-7n",
    href: "/packages?destination=bali",
    title: "Bali Honeymoon Escape",
    destination: "Bali · Ubud + Seminyak",
    duration: "7N · 8D",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=75",
    originalPrice: 124000,
    dealPrice: 89000,
    endsInHours: 36,
    kind: "flash",
  },
  {
    slug: "maldives-overwater-5n",
    href: "/packages?destination=maldives",
    title: "Maldives Overwater Villa",
    destination: "Maldives · South Atoll",
    duration: "5N · 6D",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=75",
    originalPrice: 215000,
    dealPrice: 169000,
    endsInHours: 168,
    kind: "early-bird",
  },
  {
    slug: "kerala-backwaters-6n",
    href: "/packages?destination=kerala",
    title: "Kerala Houseboat & Hills",
    destination: "Munnar · Alleppey · Kochi",
    duration: "6N · 7D",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=75",
    originalPrice: 58000,
    dealPrice: 41500,
    endsInHours: 12,
    kind: "last-minute",
  },
  {
    slug: "switzerland-classic-8n",
    href: "/packages?destination=switzerland",
    title: "Switzerland Classic",
    destination: "Zurich · Lucerne · Interlaken",
    duration: "8N · 9D",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=900&q=75",
    originalPrice: 285000,
    dealPrice: 229000,
    endsInHours: 96,
    kind: "early-bird",
  },
  {
    slug: "rajasthan-royal-7n",
    href: "/packages?destination=rajasthan",
    title: "Royal Rajasthan",
    destination: "Jaipur · Jodhpur · Udaipur",
    duration: "7N · 8D",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=75",
    originalPrice: 72000,
    dealPrice: 54500,
    endsInHours: 48,
    kind: "flash",
  },
  {
    slug: "char-dham-yatra-12n",
    href: "/packages?theme=yatra",
    title: "Char Dham Yatra",
    destination: "Yamunotri · Gangotri · Kedarnath · Badrinath",
    duration: "11N · 12D",
    image: "https://images.unsplash.com/photo-1608021273898-3e44a9b3a8a3?auto=format&fit=crop&w=900&q=75",
    originalPrice: 68000,
    dealPrice: 49500,
    endsInHours: 240,
    kind: "yatra",
  },
];

function formatINR(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

interface CompactCountdown { primary: string; secondary: string; over: boolean; urgent: boolean }

function compactParts(ms: number): CompactCountdown {
  if (ms <= 0) return { primary: "", secondary: "", over: true, urgent: false };
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  // Under 1h: show MM:SS — real urgency. Under 24h: HH:MM. Else Dd Hh.
  if (d === 0 && h === 0) return { primary: `${pad(m)}:${pad(s)}`, secondary: "left", over: false, urgent: true };
  if (d === 0) return { primary: `${h}h ${pad(m)}m`, secondary: "left", over: false, urgent: h < 6 };
  return { primary: `${d}d ${h}h`, secondary: "left", over: false, urgent: false };
}

function CountdownPill({ deadlineMs }: { deadlineMs: number }) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const parts = compactParts(deadlineMs - now);
  if (parts.over) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-tat-charcoal/80 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-white/80">
        <Clock className="h-3 w-3" /> Ended
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-sm text-[11px] font-semibold tabular-nums shadow-sm ${
        parts.urgent ? "bg-tat-orange text-white" : "bg-white/95 text-tat-charcoal"
      }`}
    >
      <Clock className="h-3 w-3" />
      {parts.primary}
    </span>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const [deadlineMs] = useState<number>(() => Date.now() + deal.endsInHours * 3600 * 1000);
  const meta = KIND_META[deal.kind];
  const Icon = meta.icon;
  const savings = deal.originalPrice - deal.dealPrice;
  const savingsPct = Math.round((savings / deal.originalPrice) * 100);

  return (
    <Link
      href={deal.href}
      className="group relative flex h-full flex-col rounded-2xl overflow-hidden ring-1 ring-tat-charcoal/10 dark:ring-white/10 bg-white dark:bg-tat-charcoal shadow-soft hover:shadow-soft-lg transition-shadow duration-300"
      aria-label={`${deal.title} — save ${savingsPct}% with this ${meta.label.toLowerCase()}`}
    >
      <div className="relative aspect-[4/5]">
        <Image
          src={deal.image}
          alt=""
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"
          quality={70}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        {/* Lighter gradient — photo breathes; only enough fade for top-corner pills. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />

        {/* Top row: deal-kind icon (no text) + countdown pill */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center justify-center h-7 w-7 rounded-full shadow-sm ${meta.tone}`}
            title={meta.label}
            aria-label={meta.label}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <CountdownPill deadlineMs={deadlineMs} />
        </div>

        {/* Savings as hero focal — bottom-left of photo */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-md bg-tat-gold text-tat-charcoal font-display font-semibold text-[15px] shadow-sm">
            Save {savingsPct}%
          </span>
        </div>
      </div>

      {/* Lower content block — light surface, prices clear, single CTA */}
      <div className="flex flex-col gap-2 p-4 sm:p-5">
        <div>
          <h3 className="font-display font-medium text-h3 text-tat-charcoal dark:text-tat-paper leading-tight line-clamp-2">
            {deal.title}
          </h3>
          <p className="mt-0.5 text-body-sm text-tat-slate dark:text-tat-paper/70 line-clamp-1">
            {deal.destination} · {deal.duration}
          </p>
        </div>

        <div className="mt-1 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-tat-charcoal/45 dark:text-tat-paper/45 line-through leading-none">
              {formatINR(deal.originalPrice)}
            </p>
            <p className="font-display text-[24px] sm:text-[26px] font-semibold text-tat-charcoal dark:text-tat-paper leading-none mt-1">
              {formatINR(deal.dealPrice)}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-tat-charcoal/45 dark:text-tat-paper/45 mt-1">
              per person
            </p>
          </div>
          <span className="inline-flex items-center gap-1 h-9 px-4 rounded-full bg-tat-charcoal text-white text-[12px] font-semibold whitespace-nowrap group-hover:bg-tat-orange transition-colors">
            Grab deal
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomeOfferDealsRail() {
  return (
    <section
      aria-labelledby="home-deals-title"
      className="py-16 md:py-24 bg-tat-paper dark:bg-tat-charcoal"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-[1480px]">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <SectionHeader
              eyebrow="Live deals"
              title="Hand-picked offers,"
              italicTail="ticking down."
            />
            <LiveStatLine />
          </div>
          <Link
            href="/offers"
            className="hidden md:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-charcoal dark:text-tat-paper hover:text-tat-gold transition-colors"
          >
            All offers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Rail rhythm 78/48/32/24 to match every other home rail. */}
        <div className="mt-7 md:mt-9 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">
          <ul className="flex w-max gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0 items-stretch">
            {DEALS.map((d) => (
              <li
                key={d.slug}
                className="shrink-0 snap-start flex w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[30%]"
              >
                <DealCard deal={d} />
              </li>
            ))}
          </ul>
        </div>

        <div className="md:hidden mt-6">
          <Link
            href="/offers"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-charcoal dark:text-tat-paper hover:text-tat-gold transition-colors"
          >
            See all live offers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
