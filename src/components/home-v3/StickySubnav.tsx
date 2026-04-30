"use client";

import { useEffect, useRef, useState } from "react";

const ITEMS = [
  { id: "destinations", label: "Destinations" },
  { id: "packages",     label: "Packages" },
  { id: "browse",       label: "Browse" },
  { id: "deals",        label: "Deals" },
  { id: "reviews",      label: "Reviews" },
  { id: "faq",          label: "FAQ" },
];

export default function StickySubnav() {
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

  return (
    <nav
      aria-label="Homepage sections"
      className="sticky top-[120px] lg:top-20 z-30 bg-tat-paper/95 dark:bg-tat-charcoal/95 backdrop-blur-md border-b border-tat-charcoal/10 dark:border-white/10"
    >
      <div className="container-custom">
        <div
          ref={trackRef}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-2 px-2 py-2 scroll-smooth"
        >
          {ITEMS.map((it) => {
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
