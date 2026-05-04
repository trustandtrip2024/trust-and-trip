"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search, X, MapPin, Package, BookOpen, ArrowRight, Loader2, Clock,
} from "lucide-react";

const RECENT_KEY = "tt_recent_searches";
const RECENT_CAP = 5;

type Result = {
  type: "package" | "destination" | "post";
  title: string;
  slug: string;
  sub: string;
  image?: string | null;
  href: string;
};

const TYPE_META = {
  package:     { label: "Package",     icon: Package,  color: "text-tat-gold bg-tat-gold/10" },
  destination: { label: "Destination", icon: MapPin,    color: "text-tat-info-fg bg-tat-info-bg" },
  post:        { label: "Article",     icon: BookOpen,  color: "text-purple-600 bg-purple-50" },
};

const POPULAR: { label: string; href: string }[] = [
  { label: "Bali",      href: "/destinations/bali" },
  { label: "Kerala",    href: "/destinations/kerala" },
  { label: "Maldives",  href: "/destinations/maldives" },
  { label: "Rajasthan", href: "/destinations/rajasthan" },
  { label: "Ladakh",    href: "/destinations/ladakh" },
  { label: "Thailand",  href: "/destinations/thailand" },
];

function loadRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, RECENT_CAP) : [];
  } catch { return []; }
}

function pushRecent(q: string) {
  if (typeof window === "undefined" || !q.trim()) return;
  try {
    const cur = loadRecents().filter((x) => x.toLowerCase() !== q.toLowerCase());
    const next = [q, ...cur].slice(0, RECENT_CAP);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

export default function HeroSanitySearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => { setRecents(loadRecents()); }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setActiveIdx(-1);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 250);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  const submitFull = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    pushRecent(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }, [query, navigate]);

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) {
        pushRecent(query);
        navigate(results[activeIdx].href);
      } else if (query.trim().length >= 2) {
        submitFull();
      }
    }
  }

  function clearRecents() {
    try { window.localStorage.removeItem(RECENT_KEY); } catch {}
    setRecents([]);
  }

  const showDropdown =
    open && (query.length >= 2 || recents.length > 0 || POPULAR.length > 0);

  return (
    <div ref={wrapRef} className="relative w-full max-w-2xl">
      {/* Input pill */}
      <div className="flex items-center gap-3 h-12 md:h-14 px-4 md:px-5 rounded-pill bg-white/95 backdrop-blur-md border border-white/30 shadow-[0_18px_40px_-15px_rgba(0,0,0,0.55)] focus-within:border-tat-gold focus-within:ring-2 focus-within:ring-tat-gold/30 transition">
        {loading ? (
          <Loader2 className="h-4 w-4 md:h-5 md:w-5 text-tat-charcoal/40 shrink-0 animate-spin" />
        ) : (
          <Search className="h-4 w-4 md:h-5 md:w-5 text-tat-charcoal/45 shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search destinations, packages, articles…"
          className="flex-1 text-[15px] md:text-[16px] text-tat-charcoal placeholder:text-tat-charcoal/45 outline-none bg-transparent"
          aria-label="Search destinations and packages"
          aria-expanded={showDropdown}
          aria-controls="hero-search-results"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="text-tat-charcoal/35 hover:text-tat-charcoal"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={submitFull}
          disabled={!query.trim()}
          className="hidden sm:inline-flex items-center gap-1 h-9 md:h-10 px-4 md:px-5 rounded-pill bg-gradient-to-r from-tat-teal via-tat-teal to-tat-teal-deep text-white text-[12px] md:text-[13px] font-semibold disabled:opacity-40 hover:opacity-95"
        >
          Search
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Dropdown panel */}
      {showDropdown && (
        <div
          id="hero-search-results"
          role="listbox"
          className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl ring-1 ring-tat-charcoal/10 overflow-hidden z-30 max-h-[60vh] overflow-y-auto"
        >
          {/* Empty / pre-query state */}
          {query.length < 2 && (
            <div className="p-4">
              {recents.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] uppercase tracking-wider text-tat-charcoal/55 font-semibold inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Recent
                    </p>
                    <button
                      type="button"
                      onClick={clearRecents}
                      className="text-[11px] text-tat-charcoal/40 hover:text-tat-charcoal underline-offset-2 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recents.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setQuery(r)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-tat-cream-warm/50 border border-tat-charcoal/10 text-[13px] text-tat-charcoal/75 hover:border-tat-gold hover:bg-tat-gold/5"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] uppercase tracking-wider text-tat-charcoal/55 font-semibold mb-2">
                Popular
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR.map(({ label, href }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(href)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white border border-tat-charcoal/15 text-[13px] text-tat-charcoal hover:border-tat-gold hover:bg-tat-gold/5 transition"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="py-10 text-center text-tat-charcoal/55">
              <Search className="h-7 w-7 mx-auto mb-2 opacity-30" />
              <p className="text-[13px]">No results for &ldquo;{query}&rdquo;</p>
              <button
                onClick={submitFull}
                className="mt-3 inline-flex items-center gap-1 h-9 px-4 rounded-full bg-tat-charcoal text-white text-[12px] font-semibold"
              >
                Search the full site
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Results list */}
          {results.length > 0 && (
            <div className="py-1">
              {results.map((r, i) => {
                const meta = TYPE_META[r.type];
                const Icon = meta.icon;
                return (
                  <button
                    key={`${r.type}-${r.slug}`}
                    onClick={() => { pushRecent(query); navigate(r.href); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      activeIdx === i ? "bg-tat-gold/8" : "hover:bg-tat-charcoal/4"
                    }`}
                  >
                    <div className="relative h-10 w-14 rounded-lg overflow-hidden shrink-0 bg-tat-cream">
                      {r.image ? (
                        <Image src={r.image} alt={r.title} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="h-4 w-4 text-tat-charcoal/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-tat-charcoal truncate">{r.title}</p>
                      <p className="text-[11px] text-tat-charcoal/45 mt-0.5 truncate">{r.sub}</p>
                    </div>
                    <span className={`shrink-0 hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                      <Icon className="h-3 w-3" />{meta.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-tat-charcoal/20 shrink-0" />
                  </button>
                );
              })}
              <button
                onClick={submitFull}
                className="w-full flex items-center justify-between px-4 py-2.5 mt-1 border-t border-tat-charcoal/6 text-tat-gold hover:bg-tat-gold/5 transition-colors"
              >
                <span className="text-[13px] font-semibold">
                  View all results for &ldquo;{query}&rdquo;
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="px-4 py-2 border-t border-tat-charcoal/6 text-[10px] text-tat-charcoal/35 text-right">
            Powered by Sanity
          </div>
        </div>
      )}
    </div>
  );
}
