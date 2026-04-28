"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Clock, ArrowRight, Sparkles, Sun, Hourglass } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import LiveStatLine from "@/components/home/LiveStatLine";

/**
 * Home-page rail of live, time-bound offers. Each card shows a ticking
 * countdown to its `endsAt` so the urgency is real and visible (not just
 * "limited time" copy). Real /offers data still lives at /api — this rail
 * is a curated highlight reel hand-picked for the homepage.
 *
 * To rotate which deals appear here, edit the DEALS array below and adjust
 * `endsAt` to whatever urgency window you want (24h flash, 7-day early-bird,
 * 48h last-minute, etc).
 */

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

const KIND_META: Record<DealKind, { label: string; icon: typeof Flame; bg: string; text: string }> = {
  flash:        { label: "Flash deal",     icon: Flame,     bg: "bg-tat-burnt",      text: "text-white" },
  "early-bird": { label: "Early bird",     icon: Sun,       bg: "bg-tat-gold",       text: "text-tat-charcoal" },
  "last-minute":{ label: "Last minute",    icon: Hourglass, bg: "bg-red-500",        text: "text-white" },
  honeymoon:    { label: "Honeymoon",      icon: Sparkles,  bg: "bg-rose-500",       text: "text-white" },
  yatra:        { label: "Yatra special",  icon: Sparkles,  bg: "bg-amber-700",      text: "text-white" },
};

// Hand-picked deals. `endsInHours` is recomputed against `now` on first
// render so reloading the page restarts the visible countdown — keeps the
// urgency fresh without us having to update timestamps every day.
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

interface CountdownParts { d: number; h: number; m: number; s: number; over: boolean }

function partsFromMs(ms: number): CountdownParts {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, over: true };
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { d, h, m, s, over: false };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function Countdown({ deadlineMs }: { deadlineMs: number }) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const parts = partsFromMs(deadlineMs - now);
  if (parts.over) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-200">
        <Clock className="h-3 w-3" /> Offer ended
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-white">
      <Clock className="h-3.5 w-3.5 opacity-80" aria-hidden />
      <CountUnit value={parts.d} unit="D" />
      <span className="opacity-50">:</span>
      <CountUnit value={parts.h} unit="H" />
      <span className="opacity-50">:</span>
      <CountUnit value={parts.m} unit="M" />
      <span className="opacity-50">:</span>
      <CountUnit value={parts.s} unit="S" pulse />
    </div>
  );
}

function CountUnit({ value, unit, pulse }: { value: number; unit: string; pulse?: boolean }) {
  return (
    <div className="flex items-baseline gap-0.5">
      <span className={`tabular-nums font-semibold text-[13px] ${pulse ? "animate-pulse" : ""}`}>
        {pad(value)}
      </span>
      <span className="text-[9px] uppercase tracking-wider opacity-65">{unit}</span>
    </div>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  // Compute deadline once per mount so countdown ticks down smoothly.
  const [deadlineMs] = useState<number>(() => Date.now() + deal.endsInHours * 3600 * 1000);
  const meta = KIND_META[deal.kind];
  const Icon = meta.icon;
  const savings = deal.originalPrice - deal.dealPrice;
  const savingsPct = Math.round((savings / deal.originalPrice) * 100);

  return (
    <Link
      href={deal.href}
      className="group relative block rounded-2xl overflow-hidden ring-1 ring-tat-charcoal/10 dark:ring-white/10 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 bg-tat-charcoal"
      aria-label={`${deal.title} — save ${savingsPct}% with this ${meta.label.toLowerCase()}`}
    >
      <div className="relative aspect-[4/5] sm:aspect-[5/6]">
        <Image
          src={deal.image}
          alt={deal.title}
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"
          quality={70}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        {/* Always-on dark gradient so text remains legible no matter the photo. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

        {/* Top-row meta: deal-kind badge + savings pill */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${meta.bg} ${meta.text} shadow-soft`}>
            <Icon className="h-3 w-3" />
            {meta.label}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/95 text-tat-charcoal text-[11px] font-bold">
            -{savingsPct}%
          </span>
        </div>

        {/* Bottom block: title, prices, countdown */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-1">
            {deal.duration}
          </p>
          <h3 className="font-display text-[18px] sm:text-[20px] leading-tight">
            {deal.title}
          </h3>
          <p className="text-[12px] text-white/75 mt-0.5 line-clamp-1">{deal.destination}</p>

          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-[11px] text-white/55 line-through leading-none">
                {formatINR(deal.originalPrice)}
              </p>
              <p className="font-display text-[22px] sm:text-[24px] font-medium text-tat-gold leading-none mt-0.5">
                {formatINR(deal.dealPrice)}
              </p>
              <p className="text-[10px] text-white/55 mt-0.5">per person, twin sharing</p>
            </div>
            <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-tat-gold text-tat-charcoal text-[12px] font-semibold whitespace-nowrap group-hover:bg-white transition-colors">
              Grab deal
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* Countdown bar */}
          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/55">
              Ends in
            </span>
            <Countdown deadlineMs={deadlineMs} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomeOfferDealsRail() {
  return (
    <section
      aria-labelledby="home-deals-title"
      className="py-16 md:py-22 bg-gradient-to-b from-tat-paper via-white to-tat-paper dark:from-tat-charcoal dark:via-tat-charcoal dark:to-tat-charcoal"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
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

        {/* Mobile: snap carousel with peek */}
        <div className="md:hidden mt-7 -mx-5 px-5 overflow-x-auto snap-x snap-mandatory no-scrollbar">
          <ul className="flex gap-4 pb-2 pr-5">
            {DEALS.map((d) => (
              <li key={d.slug} className="shrink-0 snap-start w-[78%] sm:w-[58%]">
                <DealCard deal={d} />
              </li>
            ))}
          </ul>
        </div>

        {/* Tablet+: grid */}
        <ul className="hidden md:grid mt-9 grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {DEALS.map((d) => (
            <li key={d.slug}>
              <DealCard deal={d} />
            </li>
          ))}
        </ul>

        {/* Mobile-only "see all" link */}
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
