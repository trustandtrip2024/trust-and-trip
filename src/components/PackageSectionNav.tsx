"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  { id: "overview",   label: "Overview" },
  { id: "itinerary",  label: "Itinerary" },
  { id: "inclusions", label: "Inclusions" },
  { id: "hotel",      label: "Hotel" },
  { id: "reviews",    label: "Reviews" },
  { id: "faqs",       label: "FAQs" },
];

interface Props {
  /** Package title shown in the takeover bar (small, secondary). */
  packageTitle?: string;
}

/**
 * Sticky in-page section nav for the package detail page.
 *
 * Default state: sits below the global header as a normal sticky nav.
 *
 * Once the user scrolls past the hero / CTA block, the bar promotes itself
 * to a full header takeover (`position: fixed; top: 0`) and the global site
 * header is hidden via the `pkg-detail-nav-active` class on `<html>`. The
 * effect: scrolling the trip detail page eventually replaces the brand
 * header with the trip-specific menu (Itinerary / Inclusions / Hotel etc).
 */
export default function PackageSectionNav({ packageTitle }: Props = {}) {
  const [active, setActive] = useState("overview");
  // Becomes true once the section nav has scrolled past its initial sticky
  // anchor — used to swap the bar into header-replacement mode.
  const [takeover, setTakeover] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Track which section is currently in view, to underline the matching tab.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // A 1-px sentinel sits where the nav originally lives. As soon as the
  // sentinel scrolls above the viewport, we know the user has gone past the
  // initial nav position and we promote the bar to header-replacement mode.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => setTakeover(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  // Toggle the global hide-header class so the brand header collapses out
  // of the way while the trip detail menu owns the top of the screen.
  useEffect(() => {
    if (takeover) document.documentElement.classList.add("pkg-detail-nav-active");
    else document.documentElement.classList.remove("pkg-detail-nav-active");
    return () => document.documentElement.classList.remove("pkg-detail-nav-active");
  }, [takeover]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Slightly larger offset when the bar is in fixed/takeover mode so the
    // section heading isn't clipped by the bar height.
    const offset = takeover ? 84 : 120;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      {/* Sentinel — its scroll position is the trigger for takeover mode. */}
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      <div
        className={
          "z-50 bg-white dark:bg-tat-charcoal border-b border-tat-charcoal/8 dark:border-white/10 shadow-sm transition-shadow " +
          (takeover
            ? "fixed inset-x-0 top-0 shadow-[0_8px_32px_-12px_rgba(45,26,55,0.18)]"
            : "sticky top-[64px]")
        }
      >
        <div className="container-custom">
          {/* Takeover-only top row: back arrow + package title */}
          {takeover && (
            <div className="flex items-center gap-3 pt-2 pb-1">
              <Link
                href="/packages"
                aria-label="Back to packages"
                className="p-1.5 rounded-full hover:bg-tat-charcoal/5 dark:hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-tat-charcoal dark:text-tat-paper" />
              </Link>
              <p className="font-display text-[14px] md:text-[15px] font-medium text-tat-charcoal dark:text-tat-paper truncate">
                {packageTitle ?? "Trip detail"}
              </p>
            </div>
          )}

          <div className="flex gap-0 overflow-x-auto no-scrollbar">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 shrink-0 ${
                  active === id
                    ? "border-tat-gold text-tat-charcoal dark:text-tat-paper"
                    : "border-transparent text-tat-charcoal/50 dark:text-tat-paper/55 hover:text-tat-charcoal dark:hover:text-tat-paper"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spacer keeps content from jumping when the bar goes fixed. */}
      {takeover && <div aria-hidden className="h-[88px] md:h-[92px]" />}
    </>
  );
}
