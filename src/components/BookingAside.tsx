"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag, Clock, Users, Star, MapPin, MessageCircle,
  ShieldCheck, Award, Eye, MessageSquare,
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
  saleEndsAt?: string; // ISO date string (optional)
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
  const depositAmount = Math.max(5000, Math.round((price * 0.3) / 1000) * 1000);

  const waMessage = encodeURIComponent(
    `Hi! I'm interested in "${title}" (₹${price.toLocaleString("en-IN")}). Could you share more details?`
  );

  const quickQuestions = [
    { label: "What's included?", q: `What's included in "${title}"?` },
    { label: "Can I customise?", q: `Can I customise "${title}"?` },
    { label: "Check availability", q: `Is "${title}" available for my dates?` },
    { label: "Best price?", q: `Can you offer your best price on "${title}"?` },
  ];

  return (
    <aside className="tt-card sticky top-24 self-start w-full max-w-[380px] shadow-rail">
      {/* Save pill + countdown */}
      <div className="flex items-center justify-between">
        {savings > 0 && (
          <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-pill bg-amber-100 text-amber-800 text-[12px] font-semibold">
            <Tag className="w-3.5 h-3.5" /> SAVE ₹{savings.toLocaleString("en-IN")}
          </span>
        )}
        {countdown && (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-stone-500">
            <Clock className="w-3.5 h-3.5" /> Sale ends {countdown}
          </span>
        )}
      </div>

      {/* Price block */}
      <div className="mt-4">
        {savings > 0 && (
          <p className="text-[13px] text-stone-400 line-through">
            ₹{originalPrice.toLocaleString("en-IN")}
          </p>
        )}
        <p className="font-serif text-[34px] leading-none text-stone-900">
          ₹{price.toLocaleString("en-IN")}
          <span className="text-[14px] font-sans text-stone-500"> / person</span>
        </p>
        <p className="mt-1 text-[12px] text-stone-500">
          Excluding flights · Taxes included
        </p>
      </div>

      {/* 2x2 meta grid */}
      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="tt-meta">
          <span className="tt-meta-ico"><Clock /></span>
          <div>
            <dt className="tt-meta-lbl">Duration</dt>
            <dd className="tt-meta-val">{duration}</dd>
          </div>
        </div>
        <div className="tt-meta">
          <span className="tt-meta-ico"><Users /></span>
          <div>
            <dt className="tt-meta-lbl">Type</dt>
            <dd className="tt-meta-val">{travelType}</dd>
          </div>
        </div>
        <div className="tt-meta">
          <span className="tt-meta-ico"><Star /></span>
          <div>
            <dt className="tt-meta-lbl">Rating</dt>
            <dd className="tt-meta-val">{rating} ({reviews})</dd>
          </div>
        </div>
        <div className="tt-meta">
          <span className="tt-meta-ico"><MapPin /></span>
          <div>
            <dt className="tt-meta-lbl">Departs</dt>
            <dd className="tt-meta-val">{departsFrom}</dd>
          </div>
        </div>
      </dl>

      {/* CTAs */}
      <div className="mt-6 space-y-2.5">
        <a
          href={`https://wa.me/${waNumber}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => captureIntent("whatsapp_click", {
            package_slug: slug, package_title: title, destination: destinationName, travel_type: travelType,
          })}
          className="tt-cta"
        >
          <MessageCircle className="w-4 h-4" /> Book on WhatsApp
        </a>

        <BookingDeposit packageSlug={slug} packageTitle={title} packagePrice={price} />

        <div className="flex justify-center gap-4 pt-1 text-[13px] text-stone-600">
          <Link
            href={`/customize-trip?package=${slug}`}
            onClick={() => captureIntent("customize_click", {
              package_slug: slug, package_title: title, destination: destinationName,
            })}
            className="hover:text-stone-900 underline-offset-4 hover:underline"
          >
            Customise
          </Link>
          <span className="text-stone-300">·</span>
          <a
            href={`tel:+${waNumber}`}
            onClick={() => captureIntent("call_click", {
              package_slug: slug, package_title: title, note: "BookingAside call link",
            })}
            className="hover:text-stone-900 underline-offset-4 hover:underline"
          >
            Call a planner
          </a>
        </div>
      </div>

      {/* Trust strip */}
      <ul className="mt-6 pt-5 border-t border-stone-100 space-y-2.5">
        <li className="tt-meta">
          <span className="tt-meta-ico"><ShieldCheck /></span>
          <p className="tt-meta-val">100% refundable up to 30 days prior</p>
        </li>
        <li className="tt-meta">
          <span className="tt-meta-ico"><Tag /></span>
          <p className="tt-meta-val">No booking fee — pay on confirmation</p>
        </li>
        <li className="tt-meta">
          <span className="tt-meta-ico"><Award /></span>
          <p className="tt-meta-val">Best price guarantee</p>
        </li>
      </ul>

      {/* Social proof */}
      <p className="mt-5 text-[12px] text-stone-500 flex items-center gap-3">
        <span className="inline-flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> {viewedCount} viewed this week
        </span>
        <span className="text-stone-300">·</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" /> {enquiredCount} enquired recently
        </span>
      </p>

      {/* Quick questions */}
      <div className="mt-6 pt-5 border-t border-stone-100">
        <p className="tt-meta-lbl mb-3">Quick questions</p>
        <div className="grid grid-cols-2 gap-2">
          {quickQuestions.map((q) => (
            <a
              key={q.label}
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(q.q)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => captureIntent("whatsapp_click", {
                package_slug: slug, package_title: title, note: `Quick Q — ${q.label}`,
              })}
              className="tt-chip justify-center cursor-pointer hover:bg-amber-100 transition"
            >
              {q.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
