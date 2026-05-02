"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Clock, ArrowRight, Sparkles, Sun, Hourglass, MessageCircle, CreditCard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ShelfRail from "@/components/ui/ShelfRail";

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

const KIND_META: Record<DealKind, { label: string; icon: LucideIcon; tone: string }> = {
  flash:        { label: "Flash deal",   icon: Flame,     tone: "bg-tat-orange text-white" },
  "early-bird": { label: "Early bird",   icon: Sun,       tone: "bg-tat-gold text-tat-charcoal" },
  "last-minute":{ label: "Last minute",  icon: Hourglass, tone: "bg-tat-orange text-white" },
  honeymoon:    { label: "Honeymoon",    icon: Sparkles,  tone: "bg-tat-orange text-white" },
  yatra:        { label: "Yatra",        icon: Sparkles,  tone: "bg-tat-warning-fg text-white" },
};

const DEALS: Deal[] = [
  { slug: "bali-honeymoon-7n",   href: "/packages?destination=bali",       title: "Bali Honeymoon Escape",     destination: "Bali · Ubud + Seminyak",                  duration: "7N · 8D",  image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=75", originalPrice: 124000, dealPrice:  89000, endsInHours:  36, kind: "flash" },
  { slug: "maldives-overwater",  href: "/packages?destination=maldives",   title: "Maldives Overwater Villa",  destination: "Maldives · South Atoll",                  duration: "5N · 6D",  image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=75", originalPrice: 215000, dealPrice: 169000, endsInHours: 168, kind: "early-bird" },
  { slug: "kerala-backwaters",   href: "/packages?destination=kerala",     title: "Kerala Houseboat & Hills",  destination: "Munnar · Alleppey · Kochi",               duration: "6N · 7D",  image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=75", originalPrice:  58000, dealPrice:  41500, endsInHours:  12, kind: "last-minute" },
  { slug: "switzerland-classic", href: "/packages?destination=switzerland", title: "Switzerland Classic",      destination: "Zurich · Lucerne · Interlaken",           duration: "8N · 9D",  image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=900&q=75", originalPrice: 285000, dealPrice: 229000, endsInHours:  96, kind: "early-bird" },
  { slug: "rajasthan-royal",     href: "/packages?destination=rajasthan",  title: "Royal Rajasthan",           destination: "Jaipur · Jodhpur · Udaipur",              duration: "7N · 8D",  image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=75", originalPrice:  72000, dealPrice:  54500, endsInHours:  48, kind: "flash" },
  { slug: "char-dham-yatra",     href: "/packages?theme=yatra",            title: "Char Dham Yatra",           destination: "Yamunotri · Gangotri · Kedarnath · Badrinath", duration: "11N · 12D", image: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=900&q=75", originalPrice:  68000, dealPrice:  49500, endsInHours: 240, kind: "yatra" },
];

function inr(n: number) { return `₹${n.toLocaleString("en-IN")}`; }

const WA_NUMBER = "918115999588";

function quickBookWhatsApp(deal: Deal): string {
  const text = `Hi Trust and Trip! 🙏\n\nI'd like to Quick Book the *${deal.title}* deal (${inr(deal.dealPrice)}/person · ${deal.duration}). Please confirm availability and next steps.`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

function askAriaAboutDeal(deal: Deal) {
  if (typeof window === "undefined") return;
  const preload = {
    slug: deal.slug,
    title: deal.title,
    destinationName: deal.destination,
    price: deal.dealPrice,
    duration: deal.duration,
    travelType: "",
  };
  try {
    window.sessionStorage.setItem("tt_aria_package_preload", JSON.stringify(preload));
    window.dispatchEvent(new CustomEvent("tt:aria-open"));
  } catch {
    window.location.href = deal.href;
  }
}
function pad(n: number) { return n.toString().padStart(2, "0"); }

function timeLeft(ms: number): { primary: string; urgent: boolean; over: boolean } {
  if (ms <= 0) return { primary: "", urgent: false, over: true };
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d === 0 && h === 0) return { primary: `${pad(m)}:${pad(s)}`, urgent: true,  over: false };
  if (d === 0)            return { primary: `${h}h ${pad(m)}m`,    urgent: h < 6, over: false };
  return { primary: `${d}d ${h}h`, urgent: false, over: false };
}

function CountdownPill({ deadlineMs }: { deadlineMs: number | null }) {
  // Render a neutral placeholder on SSR + first-paint to avoid hydration
  // mismatch. Date.now() in a useState initializer drifts between the SSR
  // build and the client mount, which throws "text content did not match"
  // warnings AND swaps the visible countdown number on every load. Once
  // we're on the client AND the parent has provided a deadline, kick off
  // the per-second tick.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null || deadlineMs === null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 text-tat-charcoal text-[10px] sm:text-[11px] font-semibold tabular-nums shadow-sm">
        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        <span className="opacity-50">—h —m</span>
      </span>
    );
  }
  const t = timeLeft(deadlineMs - now);
  if (t.over) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tat-charcoal/80 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-white/80">
        <Clock className="h-2.5 w-2.5" /> Ended
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-sm text-[10px] sm:text-[11px] font-semibold tabular-nums shadow-sm ${
        t.urgent ? "bg-tat-orange text-white" : "bg-white/95 text-tat-charcoal"
      }`}
    >
      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      {t.primary}
    </span>
  );
}

// Mobile horizontal-list row: image-left (38% width), content-right.
// Replaces the cramped 2-col grid — each deal gets full attention, the
// price + countdown read clearly, and the whole card is one big tap target.
function DealRowMobile({ deal }: { deal: Deal }) {
  // Deadline is computed on the client only — see CountdownPill comment.
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  useEffect(() => {
    setDeadlineMs(Date.now() + deal.endsInHours * 3600 * 1000);
  }, [deal.endsInHours]);
  const meta = KIND_META[deal.kind];
  const Icon = meta.icon;
  const savings = deal.originalPrice - deal.dealPrice;
  const savingsPct = Math.round((savings / deal.originalPrice) * 100);

  return (
    <article className="group relative flex w-full overflow-hidden rounded-2xl ring-1 ring-tat-charcoal/10 dark:ring-white/10 bg-white dark:bg-tat-charcoal shadow-soft hover:shadow-soft-lg transition-shadow">
      <Link
        href={deal.href}
        prefetch={false}
        aria-label={`${deal.title} — save ${savingsPct}% with this ${meta.label.toLowerCase()}`}
        className="relative shrink-0 w-[38%] aspect-[4/5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold"
      >
        <Image
          src={deal.image}
          alt=""
          fill
          sizes="40vw"
          quality={60}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
        {/* Top: deal-kind chip + savings %, both compact for the small image */}
        <span className={`absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm ${meta.tone}`}>
          <Icon className="h-2.5 w-2.5" />
        </span>
        <span className="absolute bottom-2 left-2 inline-flex items-baseline gap-0.5 px-1.5 py-0.5 rounded-md bg-tat-gold text-tat-charcoal font-display font-semibold text-[12px] shadow-sm">
          -{savingsPct}%
        </span>
      </Link>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={deal.href} prefetch={false} className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold rounded">
            <h3 className="font-display font-medium text-[15px] text-tat-charcoal dark:text-tat-paper leading-tight line-clamp-2 group-hover:text-tat-gold transition-colors">
              {deal.title}
            </h3>
          </Link>
          <CountdownPill deadlineMs={deadlineMs} />
        </div>
        <p className="text-[11px] text-tat-slate dark:text-tat-paper/70 line-clamp-1">
          {deal.destination.split("·")[0].trim()} · {deal.duration}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] text-tat-charcoal/45 dark:text-tat-paper/45 line-through leading-none">
              {inr(deal.originalPrice)}
            </p>
            <p className="font-display text-[18px] font-semibold text-tat-charcoal dark:text-tat-paper leading-none mt-0.5">
              {inr(deal.dealPrice)}
            </p>
          </div>
          <Link
            href={deal.href}
            prefetch={false}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-pill bg-tat-teal text-white text-[12px] font-semibold whitespace-nowrap hover:bg-tat-teal-deep transition-colors shadow-sm"
          >
            View deal
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
        {/* Secondary affordances — tiny text links, don't compete with the
            primary View deal CTA but still let high-intent users jump
            straight to WhatsApp or the Aria thread. */}
        <div className="flex items-center gap-3 pt-1 border-t border-tat-charcoal/8">
          <a
            href={quickBookWhatsApp(deal)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            <CreditCard className="h-3 w-3" />
            Quick Book
          </a>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); askAriaAboutDeal(deal); }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-tat-charcoal/70 hover:text-tat-charcoal"
          >
            <MessageCircle className="h-3 w-3" />
            Ask Aria
          </button>
        </div>
      </div>
    </article>
  );
}

// Compact image-led tile. Image dominates (4:3), price + meta sit on a thin
// strip below. Used at md+ in the horizontal rail.
function DealTile({ deal }: { deal: Deal }) {
  // Deadline is computed on the client only — see CountdownPill comment.
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  useEffect(() => {
    setDeadlineMs(Date.now() + deal.endsInHours * 3600 * 1000);
  }, [deal.endsInHours]);
  const meta = KIND_META[deal.kind];
  const Icon = meta.icon;
  const savings = deal.originalPrice - deal.dealPrice;
  const savingsPct = Math.round((savings / deal.originalPrice) * 100);

  return (
    <article
      className="group relative flex h-full flex-col rounded-2xl overflow-hidden ring-1 ring-tat-charcoal/10 dark:ring-white/10 bg-white dark:bg-tat-charcoal shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
    >
      <Link
        href={deal.href}
        prefetch={false}
        aria-label={`${deal.title} — save ${savingsPct}% with this ${meta.label.toLowerCase()}`}
        className="relative aspect-[4/3] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold"
      >
        <Image
          src={deal.image}
          alt=""
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 45vw, 30vw"
          quality={60}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${meta.tone}`}>
            <Icon className="h-3 w-3" />
            <span className="hidden sm:inline">{meta.label}</span>
          </span>
          <CountdownPill deadlineMs={deadlineMs} />
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <span className="inline-flex items-baseline gap-1 px-2 py-0.5 rounded-md bg-tat-gold text-tat-charcoal font-display font-semibold text-[13px] shadow-sm">
            Save {savingsPct}%
          </span>
        </div>
      </Link>

      <div className="flex flex-col gap-1.5 p-3 sm:p-4">
        <Link href={deal.href} prefetch={false} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold rounded">
          <h3 className="font-display font-medium text-[14px] sm:text-[16px] md:text-[18px] text-tat-charcoal dark:text-tat-paper leading-tight line-clamp-2 group-hover:text-tat-gold transition-colors">
            {deal.title}
          </h3>
        </Link>
        <p className="text-[11px] sm:text-meta text-tat-slate dark:text-tat-paper/70 line-clamp-1">
          {deal.destination.split("·")[0].trim()} · {deal.duration}
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="font-display text-[18px] sm:text-[20px] md:text-[22px] font-semibold text-tat-charcoal dark:text-tat-paper leading-none">
            {inr(deal.dealPrice)}
          </p>
          <p className="text-[10px] sm:text-[11px] text-tat-charcoal/45 dark:text-tat-paper/45 line-through leading-none">
            {inr(deal.originalPrice)}
          </p>
        </div>
        {/* Shared CTA pair: Quick Book opens WhatsApp with the deal context;
            Ask Aria preloads chat with the same deal so it answers in-context. */}
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <a
            href={quickBookWhatsApp(deal)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 h-9 px-2 rounded-pill border border-tat-gold/40 bg-tat-gold/10 text-[12px] font-semibold text-tat-charcoal hover:bg-tat-gold hover:border-tat-gold transition-colors"
          >
            <CreditCard className="h-3.5 w-3.5 text-tat-gold" />
            Quick Book
          </a>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); askAriaAboutDeal(deal); }}
            className="inline-flex items-center justify-center gap-1 h-9 px-2 rounded-pill border border-tat-charcoal/15 bg-white text-[12px] font-semibold text-tat-charcoal hover:bg-tat-charcoal hover:text-tat-paper hover:border-tat-charcoal transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Ask Aria
          </button>
        </div>
        <Link
          href={deal.href}
          prefetch={false}
          className="mt-1 inline-flex items-center justify-center gap-1 h-9 px-3 rounded-pill bg-tat-teal text-white text-[12px] font-semibold whitespace-nowrap hover:bg-tat-teal-deep transition-colors shadow-sm"
        >
          View deal
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

export default function LiveDeals() {
  return (
    <section
      id="deals"
      aria-labelledby="live-deals-title"
      className="py-14 md:py-20 bg-tat-paper dark:bg-tat-charcoal scroll-mt-28 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Live offers
            </p>
            <h2
              id="live-deals-title"
              className="mt-2 font-display font-normal text-[26px] md:text-[36px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Hand-picked deals,{" "}
              <em className="not-italic font-display italic text-tat-gold">ticking down.</em>
            </h2>
          </div>
          <Link
            href="/offers"
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            All offers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile: single-column stack of horizontal-list rows. Each deal
            gets full width so countdown + price read clearly. md+: rail. */}
        <ul className="mt-6 flex flex-col gap-3 md:hidden">
          {DEALS.map((d) => (
            <li key={d.slug} className="flex">
              <DealRowMobile deal={d} />
            </li>
          ))}
        </ul>

        <div className="hidden md:block mt-7 -mx-5 px-5 lg:mx-0 lg:px-0">
          <ShelfRail ariaLabel="Live deals">
            {DEALS.map((d) => (
              <li
                key={d.slug}
                className="shrink-0 snap-start flex w-[44%] lg:w-[31%] xl:w-[24%]"
              >
                <DealTile deal={d} />
              </li>
            ))}
          </ShelfRail>
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/offers"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            See all live offers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
