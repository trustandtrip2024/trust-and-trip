"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag, Clock, Users, Star, MapPin, MessageCircle,
  ShieldCheck, Eye, ChevronRight, Phone, Sliders,
} from "lucide-react";
import { captureIntent } from "@/lib/capture-intent";
import BookingDeposit from "./BookingDeposit";

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

function useCountdown(target?: string) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [target]);
  if (!target) return null;
  const ms = new Date(target).getTime() - now;
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d)}d : ${pad(h)}h : ${pad(m)}m`;
}

export default function BookingAside({
  title, slug, price, originalPrice, duration, travelType, rating, reviews,
  destinationName, departsFrom = "Dehradun", viewedCount, enquiredCount,
  waNumber, saleEndsAt,
}: Props) {
  const savings = originalPrice - price;
  const countdown = useCountdown(saleEndsAt);

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
              SAVE ₹{savings.toLocaleString("en-IN")}
            </span>
          ) : <span />}
          {countdown && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-tat-slate">
              <Clock className="w-3 h-3" /> Ends {countdown}
            </span>
          )}
        </div>
      )}

      {/* Price */}
      <div>
        {savings > 0 && (
          <p className="text-[12px] text-tat-slate/80 line-through">
            ₹{originalPrice.toLocaleString("en-IN")}
          </p>
        )}
        <p className="font-serif text-[32px] leading-none text-tat-charcoal">
          ₹{price.toLocaleString("en-IN")}
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

      {/* Trust strip — single tight row */}
      <ul className="mt-5 pt-4 border-t border-tat-charcoal/8 space-y-2">
        <li className="flex items-center gap-2.5 text-[12px] text-tat-charcoal/85">
          <ShieldCheck className="h-4 w-4 text-tat-teal shrink-0" />
          100% refundable up to 30 days prior
        </li>
        <li className="flex items-center gap-2.5 text-[12px] text-tat-charcoal/85">
          <Tag className="h-4 w-4 text-tat-teal shrink-0" />
          No booking fee — pay only on confirmation
        </li>
        <li className="flex items-center gap-2.5 text-[12px] text-tat-charcoal/85">
          <ChevronRight className="h-4 w-4 text-tat-teal shrink-0" />
          Best price guarantee
        </li>
      </ul>

      {/* Social proof */}
      <p className="mt-4 text-[11px] text-tat-slate flex items-center gap-2 flex-wrap">
        <Eye className="w-3.5 h-3.5 text-tat-orange" />
        <span><span className="font-semibold text-tat-charcoal">{viewedCount}</span> viewed</span>
        <span className="text-tat-charcoal/30" aria-hidden>·</span>
        <span><span className="font-semibold text-tat-charcoal">{enquiredCount}</span> enquired</span>
        <span className="text-tat-charcoal/30" aria-hidden>this week</span>
      </p>
    </aside>
  );
}
