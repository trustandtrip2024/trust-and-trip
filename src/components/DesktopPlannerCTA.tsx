"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

// Pinned bottom-right "Talk to a planner" pill on lg+ that materialises after
// the user has scrolled past the hero. Mobile already has MobileBottomNav, so
// this renders only on lg+. Hidden on conversion-critical surfaces (LPs,
// invoices, login) to avoid CTA stacking.
const HIDDEN_ON = ["/lp/", "/invoice/", "/cart/resume", "/login", "/register", "/admin"];

export default function DesktopPlannerCTA() {
  const pathname = usePathname();
  const { open: openPlanner } = useTripPlanner();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setVisible(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed) return null;
  if (pathname && HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <div
      aria-hidden={!visible}
      className={[
        "hidden lg:flex fixed bottom-6 right-6 z-40 items-center gap-1",
        "transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-2",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => openPlanner()}
        className="inline-flex items-center gap-2 h-12 pl-4 pr-5 rounded-full bg-tat-charcoal text-tat-paper text-[14px] font-semibold shadow-[0_18px_36px_-12px_rgba(0,0,0,0.5)] hover:bg-tat-teal-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
      >
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-tat-gold/20 text-tat-gold">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        Talk to a planner
      </button>
      <button
        type="button"
        aria-label="Dismiss planner shortcut"
        onClick={() => setDismissed(true)}
        className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-tat-charcoal/85 text-tat-paper/70 hover:text-tat-paper transition-colors -ml-2 ring-2 ring-tat-paper/15"
      >
        <span aria-hidden className="text-[14px] leading-none">×</span>
      </button>
    </div>
  );
}
