"use client";

import { useState, useEffect } from "react";
import { MessageCircle, ChevronUp } from "lucide-react";

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

  const waUrl = `https://wa.me/${WA}?text=${encodeURIComponent(
    `Hi Trust and Trip! 🙏\n\nI'd like to enquire about the *${title}* package (₹${price.toLocaleString("en-IN")}/person · ${duration}).\n\nPlease help me plan this trip.`
  )}`;

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-ink/10 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] safe-area-pb">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-ink/40 uppercase tracking-wider">Starting from</p>
          <p className="font-display text-xl font-semibold text-ink leading-tight">
            ₹{price.toLocaleString("en-IN")}
            <span className="text-xs font-normal text-ink/40 ml-1">/ person</span>
          </p>
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gold text-ink font-semibold px-5 py-3 rounded-xl text-sm shrink-0 active:scale-95 transition-transform"
        >
          <MessageCircle className="h-4 w-4" />
          Book Now
        </a>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="h-11 w-11 rounded-xl border border-ink/10 flex items-center justify-center text-ink/50 hover:text-ink transition-colors shrink-0"
          aria-label="Back to top"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
