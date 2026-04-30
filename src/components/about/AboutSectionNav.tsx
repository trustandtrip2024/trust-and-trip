"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "story",     label: "Story" },
  { id: "stats",     label: "Stats" },
  { id: "timeline",  label: "Milestones" },
  { id: "services",  label: "What we offer" },
  { id: "values",    label: "Values" },
  { id: "contact",   label: "Reach us" },
];

export default function AboutSectionNav() {
  const [active, setActive] = useState<string>("story");

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
      aria-label="About sections"
      className="sticky top-16 lg:top-20 z-30 bg-tat-paper/95 backdrop-blur-md border-b border-tat-charcoal/10"
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
                    : "text-tat-charcoal/70 hover:bg-tat-charcoal/8",
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
