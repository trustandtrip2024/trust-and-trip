"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag, Clock, Users, Star, MapPin, MessageCircle,
  Phone, Sliders, Zap,
} from "lucide-react";
import { captureIntent } from "@/lib/capture-intent";
import BookingDeposit from "./BookingDeposit";
import LiveViewerCount from "./LiveViewerCount";
import PackageTrustStrip from "./package-detail/PackageTrustStrip";
import Price from "./Price";

interface Props {
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  duration: string;
  travelType: string;
  rating: number;
  reviews: number;
  destinationName: string;
  departsFrom?: string;
  viewedCount: number;
  enquiredCount: number;
  waNumber: string;
  saleEndsAt?: string;
}

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

// Deterministic rolling 24-h sale window per package. Each calendar day a
// fresh window starts at midnight + slug-hash offset, so refreshes don't
// reset the timer mid-session yet every package has a different ending hour.
function packageDeadline(slug: string): number {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const offsetHours = hashSlug(slug) % 24;
  return dayStart.getTime() + (24 + offsetHours) * 3_600_000;
}

function useCountdown(target?: string, slug?: string) {
  const fallback = slug ? packageDeadline(slug) : 0;
  const deadline = target ? new Date(target).getTime() : fallback;
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!deadline) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline]);
  if (!deadline) return null;
  const ms = deadline - now;
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { hms: `${pad(h)}:${pad(m)}:${pad(s)}`, urgent: h < 6 };
}

export default function BookingAside({
  title, slug, price, originalPrice, duration, travelType, rating, reviews,
  destinationName, departsFrom = "Dehradun", viewedCount, enquiredCount,
  waNumber, saleEndsAt,
}: Props) {
  const savings = originalPrice - price;
  const countdown = useCountdown(saleEndsAt, slug);

  const waMessage = encodeURIComponent(
    `Hi! I'm interested in "${title}" (₹${price.toLocaleString("en-IN")}). Could you share more details?`
  );

  const meta = [
    { icon: Clock, label: "Duration", value: duration },
    { icon: Users, label: "Type",     value: travelType },
    { icon: Star,  label: "Rating",   value: `${rating} (${reviews})` },
    { icon: MapPin, label: "Departs", value: departsFrom },
  ];

  return (
    <aside className="tt-card tt-card-p sticky top-24 self-start w-full max-w-[380px] shadow-rail !p-5">
      {/* Save pill + countdown */}
      {(savings > 0 || countdown) && (
        <div className="flex items-center justify-between gap-2 mb-4">
          {savings > 0 ? (
            <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-pill bg-tat-orange/15 text-tat-orange text-[12px] font-semibold">
              <Tag className="w-3.5 h-3.5" />
              SAVE <Price inr={savings} />
            </span>
          ) : <span />}
        </div>
      )}

      {/* Price-lock countdown */}
      {countdown && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5 border ${
            countdown.urgent
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-tat-orange/8 border-tat-orange/25 text-tat-charcoal"
          }`}
        >
          <Zap
            className={`h-4 w-4 shrink-0 ${countdown.urgent ? "text-red-500" : "text-tat-orange"}`}
            aria-hidden
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wide font-semibold leading-tight">
              {countdown.urgent ? "Price ends soon" : "Lock today's price"}
            </p>
            <p
              className="font-mono text-[15px] font-semibold leading-tight tabular-nums"
              aria-live="polite"
            >
              {countdown.hms}
            </p>
          </div>
        </div>
      )}

      {/* Price */}
      <div>
        {savings > 0 && (
          <Price
            inr={originalPrice}
            className="text-[12px] text-tat-slate/80 line-through block"
          />
        )}
        <p className="font-serif text-[32px] leading-none text-tat-charcoal">
          <Price inr={price} />
          <span className="text-[13px] font-sans text-tat-slate font-normal"> / person</span>
        </p>
        <p className="mt-1.5 text-[11px] text-tat-slate">
          Excl. flights · Taxes included
        </p>
      </div>

      {/* 2x2 meta — tighter, single-row icons */}
      <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3">
        {meta.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2.5 min-w-0">
            <span className="h-8 w-8 rounded-md bg-tat-cream-warm/40 grid place-items-center shrink-0 text-tat-gold">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-[10px] uppercase tracking-wide font-semibold text-tat-slate">{label}</dt>
              <dd className="text-[13px] font-medium text-tat-charcoal truncate">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {/* CTAs */}
      <div className="mt-5 space-y-2">
        <a
          href={`https://wa.me/${waNumber}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => captureIntent("whatsapp_click", {
            package_slug: slug, package_title: title, destination: destinationName, travel_type: travelType,
          })}
          className="inline-flex items-center justify-center gap-2 h-12 w-full rounded-pill font-semibold text-tat-paper bg-tat-teal hover:bg-tat-teal-deep transition duration-120 text-sm"
        >
          <MessageCircle className="w-4 h-4" /> Book on WhatsApp
        </a>

        <BookingDeposit packageSlug={slug} packageTitle={title} packagePrice={price} />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/customize-trip?package=${slug}`}
            onClick={() => captureIntent("customize_click", {
              package_slug: slug, package_title: title, destination: destinationName,
            })}
            className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-pill border border-tat-charcoal/15 text-tat-charcoal hover:border-tat-charcoal text-[13px] font-medium transition duration-120"
          >
            <Sliders className="h-3.5 w-3.5" /> Customise
          </Link>
          <a
            href={`tel:+${waNumber}`}
            onClick={() => captureIntent("call_click", {
              package_slug: slug, package_title: title, note: "BookingAside call link",
            })}
            className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-pill border border-tat-charcoal/15 text-tat-charcoal hover:border-tat-charcoal text-[13px] font-medium transition duration-120"
          >
            <Phone className="h-3.5 w-3.5" /> Call planner
          </a>
        </div>
      </div>

      {/* Trust strip — 4-cell grid via shared PackageTrustStrip */}
      <div className="mt-5 pt-4 border-t border-tat-charcoal/8">
        <PackageTrustStrip />
      </div>

      {/* Live social proof */}
      <LiveViewerCount slug={slug} fallbackWeek={viewedCount} />
      <p className="mt-1 text-[11px] text-tat-slate ml-5">
        <span className="font-semibold text-tat-charcoal">{enquiredCount}</span> enquired this week
      </p>
    </aside>
  );
}
