"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, X } from "lucide-react";
import type { Destination } from "@/lib/data";

const ITEMS = [
  { id: "destinations", label: "Destinations" },
  { id: "packages",     label: "Packages" },
  { id: "browse",       label: "Browse" },
  { id: "deals",        label: "Deals" },
  { id: "pilgrim",      label: "Pilgrim" },
  { id: "reviews",      label: "Reviews" },
  { id: "faq",          label: "FAQ" },
];

interface Props {
  destinations?: Destination[];
}

export default function StickySubnav({ destinations = [] }: Props) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string>(ITEMS[0].id);
  const trackRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Destination[];
    return destinations
      .filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [destinations, query]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top.target.id) setActiveId(top.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    ITEMS.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const chip = track.querySelector<HTMLAnchorElement>(`a[data-id="${activeId}"]`);
    if (!chip) return;
    const tr = track.getBoundingClientRect();
    const cr = chip.getBoundingClientRect();
    if (cr.left < tr.left || cr.right > tr.right) {
      chip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeId]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (
        popRef.current &&
        !popRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function go(d: Destination) {
    setOpen(false);
    setQuery("");
    router.push(`/destinations/${d.slug}`);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(h + 1, Math.max(matches.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[highlighted]) go(matches[highlighted]);
      else if (query.trim()) {
        setOpen(false);
        router.push(`/packages?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <nav
      aria-label="Homepage navigation"
      className="sticky top-16 lg:top-20 z-30 bg-tat-paper/95 dark:bg-tat-charcoal/95 backdrop-blur-md border-b border-tat-charcoal/10 dark:border-white/10"
    >
      <div className="container-custom">
        <div className="flex items-center gap-2 md:gap-3 py-2">
          {/* Search */}
          <div className="relative flex-1 min-w-0 md:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tat-charcoal/45 dark:text-tat-paper/45 pointer-events-none" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHighlighted(0); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKey}
                placeholder="Search Bali, Char Dham, Switzerland…"
                aria-label="Search destinations"
                aria-expanded={open}
                aria-controls="subnav-search-results"
                aria-autocomplete="list"
                className="w-full h-9 pl-9 pr-9 rounded-full bg-tat-charcoal/5 dark:bg-white/10 text-[13px] text-tat-charcoal dark:text-tat-paper placeholder:text-tat-charcoal/45 dark:placeholder:text-tat-paper/45 focus:outline-none focus:bg-white dark:focus:bg-white/15 focus:ring-2 focus:ring-tat-gold/30"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded-full text-tat-charcoal/55 dark:text-tat-paper/55 hover:bg-tat-charcoal/10 dark:hover:bg-white/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {open && query && (
              <div
                ref={popRef}
                id="subnav-search-results"
                role="listbox"
                className="absolute left-0 right-0 mt-1.5 max-h-[60vh] overflow-y-auto rounded-xl bg-white dark:bg-tat-charcoal ring-1 ring-tat-charcoal/10 dark:ring-white/10 shadow-soft-lg p-1.5 z-10"
              >
                {matches.length === 0 ? (
                  <p className="px-3 py-3 text-[13px] text-tat-charcoal/60 dark:text-tat-paper/60">
                    No destinations match &ldquo;{query}&rdquo;.{" "}
                    <Link
                      href={`/packages?q=${encodeURIComponent(query)}`}
                      onClick={() => setOpen(false)}
                      className="text-tat-gold font-semibold hover:underline underline-offset-4"
                    >
                      Search packages instead
                    </Link>
                  </p>
                ) : (
                  matches.map((d, i) => (
                    <button
                      key={d.slug}
                      type="button"
                      role="option"
                      aria-selected={i === highlighted}
                      onMouseEnter={() => setHighlighted(i)}
                      onClick={() => go(d)}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left ${
                        i === highlighted
                          ? "bg-tat-gold/15"
                          : "hover:bg-tat-charcoal/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tat-gold/15 text-tat-gold">
                        <MapPin className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display font-medium text-[14px] text-tat-charcoal dark:text-tat-paper truncate">
                          {d.name}
                        </span>
                        <span className="block text-[11px] text-tat-charcoal/55 dark:text-tat-paper/55 truncate">
                          {d.country} · {d.region}
                        </span>
                      </span>
                      <span className="text-[11px] uppercase tracking-wider text-tat-charcoal/45 dark:text-tat-paper/45">
                        from ₹{d.priceFrom.toLocaleString("en-IN")}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Anchor chips */}
          <div
            ref={trackRef}
            className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth flex-1 min-w-0"
          >
            {ITEMS.map((it) => {
              const active = activeId === it.id;
              return (
                <a
                  key={it.id}
                  data-id={it.id}
                  href={`#${it.id}`}
                  className={[
                    "shrink-0 inline-flex items-center h-8 px-3 rounded-pill text-[12px] md:text-[13px] font-medium transition duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2",
                    active
                      ? "bg-tat-charcoal text-white dark:bg-white dark:text-tat-charcoal shadow-card"
                      : "text-tat-charcoal/75 dark:text-tat-paper/75 hover:bg-tat-charcoal/5 dark:hover:bg-white/10",
                  ].join(" ")}
                >
                  {it.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
