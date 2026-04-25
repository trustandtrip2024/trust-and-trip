"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, MapPin, Package, BookOpen, ArrowRight, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  destination: { label: "Destination", icon: MapPin,    color: "text-blue-600 bg-blue-50" },
  post:        { label: "Article",     icon: BookOpen,  color: "text-purple-600 bg-purple-50" },
};

const POPULAR = [
  { label: "Bali Honeymoon",    href: "/packages?destination=bali" },
  { label: "Kerala Backwaters", href: "/packages?destination=kerala" },
  { label: "Maldives Escape",   href: "/packages?destination=maldives" },
  { label: "Family Packages",   href: "/packages?type=Family" },
  { label: "Under ₹35K",        href: "/packages?budget=budget" },
  { label: "Adventure Trips",   href: "/packages?type=Group" },
];

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
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

  // Keyboard navigation
  useEffect(() => {
    const allItems = results.length > 0 ? results : [];
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, allItems.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); }
      if (e.key === "Enter" && activeIdx >= 0 && allItems[activeIdx]) navigate(allItems[activeIdx].href);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [results, activeIdx, navigate, onClose]);

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
          {/* Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-tat-charcoal/8">
            {loading ? (
              <Loader2 className="h-5 w-5 text-tat-charcoal/40 shrink-0 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-tat-charcoal/40 shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search packages, destinations, articles…"
              className="flex-1 text-base text-tat-charcoal placeholder:text-tat-charcoal/35 outline-none bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-tat-charcoal/30 hover:text-tat-charcoal transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:block text-[10px] text-tat-charcoal/30 border border-tat-charcoal/15 rounded px-1.5 py-0.5">Esc</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {!query && (
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-tat-charcoal/40 font-medium mb-3">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map(({ label, href }) => (
                    <button key={label} onClick={() => navigate(href)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tat-charcoal/5 hover:bg-tat-gold/10 hover:text-tat-charcoal text-sm text-tat-charcoal/70 transition-all border border-tat-charcoal/8 hover:border-tat-gold/30">
                      <Clock className="h-3 w-3 text-tat-charcoal/30" />
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
                <button onClick={() => navigate(`/packages`)} className="mt-3 text-xs text-tat-gold hover:underline">
                  Browse all packages →
                </button>
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                {results.map((r, i) => {
                  const meta = TYPE_META[r.type];
                  const Icon = meta.icon;
                  return (
                    <button key={`${r.type}-${r.slug}`} onClick={() => navigate(r.href)}
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
