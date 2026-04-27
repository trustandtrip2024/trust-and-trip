"use client";

import { useState, useEffect } from "react";
import { MessageCircle, ChevronUp, Sliders } from "lucide-react";
import Link from "next/link";
import { captureIntent } from "@/lib/capture-intent";
import Price from "./Price";

interface Props {
  price: number;
  title: string;
  slug: string;
  duration: string;
}

const WA = "918115999588";

export default function PackageStickyBar({ price, title, slug, duration }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide the floating WhatsApp + Aria chat bubbles while this bar is visible
  // — they overlap on mobile and dilute the primary CTA.
  useEffect(() => {
    document.documentElement.classList.toggle("pkg-sticky-active", visible);
    return () => document.documentElement.classList.remove("pkg-sticky-active");
  }, [visible]);

  const waUrl = `https://wa.me/${WA}?text=${encodeURIComponent(
    `Hi Trust and Trip! 🙏\n\nI'd like to enquire about the *${title}* package (₹${price.toLocaleString("en-IN")}/person · ${duration}).\n\nPlease help me plan this trip.`
  )}`;

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-tat-paper border-t border-tat-charcoal/10 shadow-[0_-8px_24px_rgba(45,30,15,0.10)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch gap-2 px-3 py-2.5">
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-[9px] text-tat-slate uppercase tracking-wider">Starting from · {duration}</p>
          <p className="font-serif text-[18px] font-semibold text-tat-charcoal leading-none">
            <Price inr={price} />
            <span className="text-[11px] font-sans font-normal text-tat-slate ml-1">/ person</span>
          </p>
        </div>

        <Link
          href={`/customize-trip?package=${slug}`}
          onClick={() => captureIntent("customize_click", { package_slug: slug, package_title: title, note: "sticky bar" })}
          aria-label="Customise trip"
          className="h-11 w-11 rounded-pill border border-tat-charcoal/15 grid place-items-center text-tat-charcoal/70 hover:text-tat-charcoal hover:border-tat-charcoal shrink-0 transition-colors"
        >
          <Sliders className="h-4 w-4" />
        </Link>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            captureIntent("book_now_click", {
              package_title: title,
              package_slug: slug,
              note: `Sticky bar · ₹${price.toLocaleString("en-IN")} · ${duration}`,
            })
          }
          className="flex-1 inline-flex items-center justify-center gap-2 bg-tat-teal hover:bg-tat-teal-deep text-tat-paper font-semibold px-4 rounded-pill text-sm shrink-0 active:scale-[0.98] transition"
        >
          <MessageCircle className="h-4 w-4" />
          Book on WhatsApp
        </a>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="h-11 w-11 rounded-pill border border-tat-charcoal/15 grid place-items-center text-tat-charcoal/70 hover:text-tat-charcoal shrink-0 transition-colors"
          aria-label="Back to top"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
