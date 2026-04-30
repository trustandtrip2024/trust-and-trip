"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, MapPin, Package, BookOpen, ArrowRight, Loader2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RECENT_KEY = "tt_recent_searches";
const RECENT_CAP = 5;

function loadRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, RECENT_CAP) : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  if (typeof window === "undefined" || !q.trim()) return;
  try {
    const cur = loadRecents().filter((x) => x.toLowerCase() !== q.toLowerCase());
    const next = [q, ...cur].slice(0, RECENT_CAP);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

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

const POPULAR_DESTINATIONS: { emoji: string; label: string; href: string }[] = [
  { emoji: "🌺", label: "Bali",        href: "/destinations/bali" },
  { emoji: "🌴", label: "Kerala",      href: "/destinations/kerala" },
  { emoji: "🏜️", label: "Rajasthan",   href: "/destinations/rajasthan" },
  { emoji: "🏝️", label: "Maldives",    href: "/destinations/maldives" },
  { emoji: "🛕", label: "Uttarakhand", href: "/destinations/uttarakhand" },
  { emoji: "🏔️", label: "Switzerland", href: "/destinations/switzerland" },
  { emoji: "🐘", label: "Thailand",    href: "/destinations/thailand" },
  { emoji: "⛰️", label: "Ladakh",      href: "/destinations/ladakh" },
];

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recents, setRecents] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on open + load recent searches
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
    setRecents(loadRecents());
  }, []);

  // Debounced search
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
    }, 280);
  }, [query]);

  const navigate = useCallback((href: string) => {
    onClose();
    router.push(href);
  }, [onClose, router]);

  const submitFullSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    pushRecent(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }, [query, navigate]);

  function clearRecents() {
    try { window.localStorage.removeItem(RECENT_KEY); } catch {}
    setRecents([]);
  }

  // Keyboard navigation
  useEffect(() => {
    const allItems = results.length > 0 ? results : [];
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, allItems.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); }
      if (e.key === "Enter") {
        if (activeIdx >= 0 && allItems[activeIdx]) {
          pushRecent(query);
          navigate(allItems[activeIdx].href);
        } else if (query.trim().length >= 2) {
          // No row selected — submit a full /search query so the user gets
          // every result instead of bouncing off an empty modal state.
          submitFullSearch();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [results, activeIdx, navigate, onClose, query, submitFullSearch]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-tat-charcoal/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header — step indicator (visual cue, matches wizard) */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-tat-slate">
              <span className="font-semibold text-tat-gold">Where to</span>
              <span aria-hidden className="text-tat-charcoal/30">·</span>
              <span>Search</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close search"
              className="h-8 w-8 rounded-full grid place-items-center text-tat-charcoal/50 hover:bg-tat-charcoal/5 hover:text-tat-charcoal transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Input — cream pill, matches wizard */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-3 h-12 px-4 rounded-pill bg-tat-cream-warm/40 border border-tat-charcoal/10 focus-within:border-tat-gold focus-within:bg-white transition">
              {loading ? (
                <Loader2 className="h-4 w-4 text-tat-charcoal/40 shrink-0 animate-spin" />
              ) : (
                <Search className="h-4 w-4 text-tat-charcoal/45 shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a country, region or city"
                className="flex-1 text-[15px] text-tat-charcoal placeholder:text-tat-charcoal/45 outline-none bg-transparent"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-tat-charcoal/35 hover:text-tat-charcoal transition-colors" aria-label="Clear">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results / Popular */}
          <div className="max-h-[60vh] overflow-y-auto">
            {!query && (
              <div className="px-5 pb-5">
                {recents.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[12px] uppercase tracking-wider text-tat-charcoal/55 font-semibold inline-flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Recent searches
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
                <p className="text-[13px] text-tat-charcoal/65 mb-3">Or pick a popular one:</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_DESTINATIONS.map(({ emoji, label, href }) => (
                    <button
                      key={label}
                      onClick={() => navigate(href)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white border border-tat-charcoal/15 text-tat-charcoal text-[14px] font-medium hover:border-tat-gold hover:bg-tat-gold/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
                    >
                      <span aria-hidden className="text-base leading-none">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.length >= 2 && !loading && results.length === 0 && (
              <div className="py-12 text-center text-tat-charcoal/50">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
                <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={submitFullSearch}
                    className="inline-flex items-center gap-1 h-9 px-4 rounded-full bg-tat-charcoal text-white text-[12px] font-semibold"
                  >
                    Search the full site
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => navigate(`/packages`)}
                    className="text-xs text-tat-gold hover:underline"
                  >
                    Browse all packages →
                  </button>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                {results.map((r, i) => {
                  const meta = TYPE_META[r.type];
                  const Icon = meta.icon;
                  return (
                    <button key={`${r.type}-${r.slug}`} onClick={() => { pushRecent(query); navigate(r.href); }}
                      className={`w-full flex items-center gap-4 px-5 py-3 hover:bg-tat-charcoal/4 transition-colors text-left ${
                        activeIdx === i ? "bg-tat-gold/8" : ""
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative h-12 w-16 rounded-xl overflow-hidden shrink-0 bg-tat-cream">
                        {r.image ? (
                          <Image src={r.image} alt={r.title} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon className="h-5 w-5 text-tat-charcoal/20" />
                          </div>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-tat-charcoal truncate">{r.title}</p>
                        <p className="text-xs text-tat-charcoal/45 mt-0.5 truncate">{r.sub}</p>
                      </div>

                      {/* Type badge */}
                      <span className={`shrink-0 hidden sm:flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${meta.color}`}>
                        <Icon className="h-3 w-3" />{meta.label}
                      </span>

                      <ArrowRight className="h-4 w-4 text-tat-charcoal/20 shrink-0" />
                    </button>
                  );
                })}
                {/* Overflow CTA — top-result list is capped at 12 in the
                    modal; full results live on /search for filtering by
                    type and seeing every match. */}
                {query.length >= 2 && (
                  <button
                    onClick={submitFullSearch}
                    className="w-full flex items-center justify-between px-5 py-3 mt-1 border-t border-tat-charcoal/6 text-tat-gold hover:bg-tat-gold/5 transition-colors"
                  >
                    <span className="text-[13px] font-semibold">
                      View all results for &ldquo;{query}&rdquo;
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-tat-charcoal/6 flex items-center justify-between text-[11px] text-tat-charcoal/35">
            <span className="flex items-center gap-3">
              <span><kbd className="border border-tat-charcoal/15 rounded px-1 py-0.5">↑↓</kbd> navigate</span>
              <span><kbd className="border border-tat-charcoal/15 rounded px-1 py-0.5">↵</kbd> open</span>
            </span>
            <span>Powered by Sanity</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
