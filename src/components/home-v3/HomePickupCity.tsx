"use client";

import { useEffect, useRef, useState } from "react";
import { Plane, Check, ChevronDown } from "lucide-react";

const STORAGE_KEY = "tt_pickup_city";
const DEFAULT_CITY = "New Delhi";

const CITIES = [
  "New Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
] as const;

/**
 * Pickup-city chip + popover. Persists the visitor's preferred starting
 * city to localStorage so downstream components (package lists, hero
 * search, callback prefills) can read it without prop-drilling.
 *
 * First-time visitors see "New Delhi" as the default but the value is
 * NOT persisted until they actively pick — so we don't lock anyone in
 * silently and the chip can keep prompting until acknowledged.
 *
 * Emits a window event "tat:pickup-changed" with `{ city }` on update so
 * other parts of the page can react without a global state library.
 */
export default function HomePickupCity() {
  const [city, setCity] = useState<string>(DEFAULT_CITY);
  const [acknowledged, setAcknowledged] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && CITIES.includes(saved as (typeof CITIES)[number])) {
        setCity(saved);
        setAcknowledged(true);
      }
    } catch {}
  }, []);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (next: string) => {
    setCity(next);
    setAcknowledged(true);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new CustomEvent("tat:pickup-changed", { detail: { city: next } }));
  };

  return (
    <div
      ref={wrapRef}
      className="bg-white border-b border-tat-charcoal/8"
    >
      <div className="container-custom py-2.5 flex items-center gap-2.5 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-charcoal/55">
          <Plane className="h-3 w-3 text-tat-gold" aria-hidden />
          Pickup
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={`Pickup city — currently ${city}. Change?`}
            className="inline-flex items-center gap-1.5 rounded-full border border-tat-charcoal/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-tat-charcoal hover:border-tat-gold hover:bg-tat-gold/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
          >
            {city}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
          </button>
          {open && (
            <ul
              role="listbox"
              aria-label="Choose pickup city"
              className="absolute left-0 top-full mt-2 z-30 min-w-[200px] rounded-xl border border-tat-charcoal/12 bg-white shadow-soft p-1.5 grid grid-cols-1"
            >
              {CITIES.map((c) => {
                const selected = c === city && acknowledged;
                return (
                  <li key={c}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => pick(c)}
                      className={`w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors text-left ${
                        selected
                          ? "bg-tat-gold/10 text-tat-charcoal font-semibold"
                          : "text-tat-charcoal/85 hover:bg-tat-cream"
                      }`}
                    >
                      {c}
                      {selected && <Check className="h-3.5 w-3.5 text-tat-gold" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <span className="text-[11px] text-tat-charcoal/55">
          We tailor flight options + ex-city pricing to your start point.
        </span>
        {!acknowledged && (
          <span className="ml-auto text-[10px] uppercase tracking-[0.16em] font-semibold text-tat-orange">
            Pick one
          </span>
        )}
      </div>
    </div>
  );
}
