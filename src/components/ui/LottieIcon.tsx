"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Code-split lottie-react so the ~80 kB runtime ships only when a Lottie
// is actually rendered. ssr: false keeps the SVG out of SSR HTML and
// avoids hydration mismatch on framerate-driven attributes.
const LottiePlayer = dynamic(() => import("lottie-react"), { ssr: false });

interface Props {
  /** Path under /public, e.g. "/lottie/sparkle.json" */
  src: string;
  size?: number;
  loop?: boolean;
  className?: string;
  /** When true, only animates once the element scrolls into view. */
  lazy?: boolean;
  /** Aria-hidden by default — Lottie icons are decorative. */
  ariaLabel?: string;
}

export default function LottieIcon({
  src,
  size = 32,
  loop = true,
  className = "",
  lazy = true,
  ariaLabel,
}: Props) {
  const [data, setData] = useState<unknown>(null);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(!lazy);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (!lazy || visible) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, visible]);

  useEffect(() => {
    if (!visible || data) return;
    let cancelled = false;
    fetch(src)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => { if (!cancelled) setData(json); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [visible, src, data]);

  return (
    <span
      ref={ref}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      style={{ width: size, height: size, display: "inline-block" }}
      className={className}
    >
      {data && !reduced ? (
        <LottiePlayer
          animationData={data}
          loop={loop}
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </span>
  );
}
