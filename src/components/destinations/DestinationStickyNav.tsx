"use client";

import { useEffect, useState } from "react";

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: "overview",    label: "Overview" },
  { id: "best-time",   label: "Best time" },
  { id: "experiences", label: "Experiences" },
  { id: "trips",       label: "Trip styles" },
  { id: "packages",    label: "Packages" },
  { id: "faq",         label: "FAQ" },
];

export default function DestinationStickyNav() {
  const [active, setActive] = useState<string>("overview");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(s.id);
        },
        { rootMargin: "-30% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav
      aria-label="Destination sections"
      className="sticky top-16 lg:top-20 z-30 bg-tat-paper/95 dark:bg-tat-charcoal/95 backdrop-blur-md border-b border-tat-charcoal/10 dark:border-white/10"
    >
      <div className="container-custom">
        <ul className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-5 px-5 py-2.5">
          {SECTIONS.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? "true" : undefined}
                className={[
                  "inline-flex items-center h-8 px-3 rounded-full text-[12px] font-semibold transition-colors whitespace-nowrap",
                  active === s.id
                    ? "bg-tat-charcoal text-white"
                    : "text-tat-charcoal/70 dark:text-tat-paper/70 hover:bg-tat-charcoal/8 dark:hover:bg-white/10",
                ].join(" ")}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
