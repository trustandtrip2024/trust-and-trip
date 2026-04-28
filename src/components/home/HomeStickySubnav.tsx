"use client";

import { useEffect, useRef, useState } from "react";

interface Item { id: string; label: string }

const DEFAULT_ITEMS: Item[] = [
  { id: "destinations",  label: "Destinations" },
  { id: "deals",         label: "Deals" },
  { id: "by-style",      label: "Travel style" },
  { id: "by-duration",   label: "Duration" },
  { id: "pilgrim",       label: "Pilgrim" },
  { id: "reviews",       label: "Reviews" },
  { id: "press",         label: "Press" },
  { id: "guides",        label: "Travel guides" },
  { id: "faq",           label: "FAQ" },
];

interface Props { items?: Item[] }

export default function HomeStickySubnav({ items = DEFAULT_ITEMS }: Props = {}) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        // pick the first one that's intersecting (top-most)
        const sorted = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = sorted[0].target.id;
        if (id) setActiveId(id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  // Keep active chip visible inside the scrollable track on small screens.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const chip = track.querySelector<HTMLAnchorElement>(`a[data-id="${activeId}"]`);
    if (!chip) return;
    const trackRect = track.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    if (chipRect.left < trackRect.left || chipRect.right > trackRect.right) {
      chip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeId]);

  return (
    <nav
      aria-label="Homepage sections"
      className="sticky top-16 md:top-20 z-30 bg-tat-paper/92 dark:bg-tat-charcoal/92 backdrop-blur-sm border-b border-tat-charcoal/8 dark:border-white/10"
    >
      <div className="container-custom">
        <div
          ref={trackRef}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-2 px-2 py-2 scroll-smooth"
        >
          {items.map((it) => {
            const active = activeId === it.id;
            return (
              <a
                key={it.id}
                data-id={it.id}
                href={`#${it.id}`}
                className={[
                  "shrink-0 inline-flex items-center h-8 px-3 rounded-pill text-[13px] font-medium transition duration-150",
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
    </nav>
  );
}
