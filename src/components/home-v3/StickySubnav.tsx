"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
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
  // Kept for backwards-compat with caller; no longer used because the
  // search trigger now opens the Sanity-backed SearchModal instead of
  // filtering a static prop.
  destinations?: Destination[];
}

export default function StickySubnav(_props: Props = {}) {
  const [activeId, setActiveId] = useState<string>(ITEMS[0].id);
  const trackRef = useRef<HTMLDivElement>(null);

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

  function openSearch() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tt:search-open"));
    }
  }

  return (
    <nav
      aria-label="Homepage navigation"
      className="sticky top-16 lg:top-20 z-30 bg-tat-paper/95 dark:bg-tat-charcoal/95 backdrop-blur-md border-b border-tat-charcoal/10 dark:border-white/10"
    >
      <div className="container-custom">
        <div className="flex items-center gap-2 md:gap-3 py-2">
          {/* Search trigger — opens the Sanity-backed SearchModal so this
              bar searches packages, destinations, and articles in one place
              instead of filtering a static destination prop. */}
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search packages, destinations and articles"
            className="group flex items-center gap-2 flex-1 min-w-0 md:max-w-md h-9 pl-3 pr-3 rounded-full bg-tat-charcoal/5 dark:bg-white/10 text-[13px] text-tat-charcoal/55 dark:text-tat-paper/55 hover:bg-tat-charcoal/8 dark:hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-tat-gold/30"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate text-left">Search Bali, Char Dham, Switzerland…</span>
            <kbd className="hidden md:inline-flex items-center ml-auto px-1.5 py-0.5 rounded border border-tat-charcoal/15 dark:border-white/15 text-[10px] font-medium tracking-wide text-tat-charcoal/55 dark:text-tat-paper/55">
              ⌘K
            </kbd>
          </button>

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
