"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

const PLACEHOLDERS = [
  "Bali honeymoon...", "Kerala backwaters...", "Maldives escape...",
  "Manali adventure...", "Dubai family trip...", "Rajasthan heritage...",
  "Thailand beaches...", "Switzerland snow...", "Goa getaway...",
];

const DOMESTIC = [
  { label: "Kerala", slug: "kerala" },
  { label: "Goa", slug: "goa" },
  { label: "Manali", slug: "manali" },
  { label: "Rajasthan", slug: "rajasthan" },
  { label: "Ladakh", slug: "ladakh" },
  { label: "Andaman", slug: "andaman" },
  { label: "Shimla", slug: "shimla" },
  { label: "Coorg", slug: "coorg" },
  { label: "Varanasi", slug: "varanasi" },
  { label: "Agra", slug: "agra" },
];

const INTERNATIONAL = [
  { label: "Bali", slug: "bali" },
  { label: "Maldives", slug: "maldives" },
  { label: "Dubai", slug: "dubai" },
  { label: "Thailand", slug: "thailand" },
  { label: "Switzerland", slug: "switzerland" },
  { label: "Paris", slug: "paris" },
  { label: "Japan", slug: "japan" },
  { label: "Singapore", slug: "singapore" },
  { label: "Nepal", slug: "nepal" },
  { label: "Turkey", slug: "turkey" },
];

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"domestic" | "international">("domestic");
  const [phIdx, setPhIdx] = useState(0);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Cycle placeholder text
  useEffect(() => {
    const t = setInterval(() => setPhIdx((i) => (i + 1) % PLACEHOLDERS.length), 2500);
    return () => clearInterval(t);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const destinations = tab === "domestic" ? DOMESTIC : INTERNATIONAL;

  const filtered = query.trim()
    ? [...DOMESTIC, ...INTERNATIONAL].filter((d) =>
        d.label.toLowerCase().includes(query.toLowerCase())
      )
    : destinations;

  const go = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/packages?destination=${slug}`);
  };

  const handleSearch = () => {
    if (query.trim()) {
      const match = [...DOMESTIC, ...INTERNATIONAL].find((d) =>
        d.label.toLowerCase().includes(query.toLowerCase())
      );
      if (match) go(match.slug);
      else router.push(`/packages`);
    } else {
      router.push("/packages");
    }
  };

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto">
      {/* Flat search bar */}
      <div className="flex items-center bg-cream/95 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-cream overflow-hidden">
        <MapPin className="h-4 w-4 text-gold shrink-0 ml-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={PLACEHOLDERS[phIdx]}
          className="flex-1 bg-transparent text-ink text-sm font-medium placeholder:text-ink/40 placeholder:font-normal outline-none px-3 py-4"
          aria-label="Search destinations"
          aria-expanded={open}
        />
        <button
          onClick={handleSearch}
          className="m-1.5 bg-ink hover:bg-gold text-cream hover:text-ink transition-all duration-200 rounded-xl px-5 py-3 flex items-center gap-2 text-sm font-medium shrink-0"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Dropdown — opens upward since bar sits at bottom of hero */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-soft-lg border border-ink/8 overflow-hidden z-50">
          {!query.trim() && (
            <div className="flex border-b border-ink/8">
              <button
                onClick={() => setTab("domestic")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === "domestic" ? "text-ink border-b-2 border-gold -mb-px" : "text-ink/50 hover:text-ink"
                }`}
              >
                Domestic
              </button>
              <button
                onClick={() => setTab("international")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === "international" ? "text-ink border-b-2 border-gold -mb-px" : "text-ink/50 hover:text-ink"
                }`}
              >
                International
              </button>
            </div>
          )}

          <div className="p-3 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-ink/40 px-2 py-1">No destinations found</p>
            ) : (
              filtered.map((d) => (
                <button
                  key={d.slug}
                  onClick={() => go(d.slug)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink/5 hover:bg-gold hover:text-ink text-sm text-ink/70 transition-all duration-150 font-medium"
                >
                  <MapPin className="h-3 w-3 text-gold" />
                  {d.label}
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-ink/5 bg-ink/2">
            <button
              onClick={() => { setOpen(false); router.push("/packages"); }}
              className="text-xs text-ink/50 hover:text-gold transition-colors"
            >
              Browse all packages →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
