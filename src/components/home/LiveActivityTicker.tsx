"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";

type Activity = { name: string; city: string; action: string; mins: number };

const ACTIVITIES: Activity[] = [
  { name: "Aarav",          city: "Mumbai",     action: "booked the Bali Honeymoon escape",    mins: 12 },
  { name: "Riya & Karan",   city: "Pune",       action: "got their Maldives itinerary",        mins: 18 },
  { name: "The Mehta family", city: "Delhi",    action: "booked Kerala backwaters",            mins: 27 },
  { name: "Ishita",         city: "Bengaluru",  action: "started planning Ladakh solo",        mins: 33 },
  { name: "Rohan",          city: "Hyderabad",  action: "booked Kedarnath helicopter yatra",   mins: 41 },
  { name: "Anika",          city: "Chennai",    action: "got a Switzerland quote",             mins: 53 },
  { name: "Vivaan",         city: "Kolkata",    action: "booked Spiti road trip",              mins: 64 },
  { name: "Saanvi",         city: "Jaipur",     action: "started a Thailand family trip",      mins: 78 },
  { name: "Kabir",          city: "Ahmedabad",  action: "booked Andaman scuba retreat",        mins: 92 },
  { name: "Diya & Arjun",   city: "Lucknow",    action: "got Rajasthan honeymoon plan",        mins: 110 },
];

const HIDDEN_ON = ["/lp/", "/invoice/", "/cart/resume", "/login", "/register"];

export default function LiveActivityTicker() {
  const pathname = usePathname();
  const onHidden = !!pathname && HIDDEN_ON.some((p) => pathname.startsWith(p));
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible || dismissed) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % ACTIVITIES.length);
    }, 5500);
    return () => clearInterval(t);
  }, [visible, dismissed]);

  if (onHidden || !visible || dismissed) return null;

  const a = ACTIVITIES[idx];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-3 bottom-20 md:left-5 md:bottom-6 z-40 max-w-[260px] md:max-w-[320px] pointer-events-auto"
    >
      <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-tat-charcoal/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] rounded-2xl pl-3 pr-2 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <span className="shrink-0 h-8 w-8 rounded-full bg-tat-gold/15 text-tat-gold flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] md:text-[12px] text-tat-charcoal leading-tight">
            <span className="font-semibold">{a.name}</span>
            <span className="text-tat-charcoal/55"> from {a.city}</span>
          </p>
          <p className="text-[10px] md:text-[11px] text-tat-charcoal/65 leading-tight truncate">
            {a.action} · {a.mins}m ago
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 h-6 w-6 rounded-full text-tat-charcoal/40 hover:text-tat-charcoal hover:bg-tat-charcoal/5 flex items-center justify-center"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
