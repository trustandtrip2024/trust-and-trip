"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  name: string;
  country: string;
  tagline: string;
  image: string;
  slug: string;
  priceFrom: number;
  badge?: string;
}

export default function Destination3DCard({
  name, country, tagline, image, slug, priceFrom, badge,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [gloss, setGloss] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const dx = (e.clientX - left - width / 2) / (width / 2);
    const dy = (e.clientY - top - height / 2) / (height / 2);
    setTilt({ x: -dy * 9, y: dx * 9 });
    setGloss({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientY - top) / height) * 100,
    });
  };

  const onLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGloss({ x: 50, y: 50 });
    setActive(false);
  };

  const shadow = active
    ? `${-tilt.y * 1.2}px ${tilt.x * 1.2}px 40px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)`
    : "0 8px 32px rgba(0,0,0,0.15)";

  return (
    <div style={{ perspective: "1100px" }} className="w-full">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={onLeave}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${active ? 1.025 : 1})`,
          transition: active
            ? "transform 0.08s ease-out, box-shadow 0.08s ease-out"
            : "transform 0.55s cubic-bezier(.16,1,.3,1), box-shadow 0.55s cubic-bezier(.16,1,.3,1)",
          boxShadow: shadow,
          willChange: "transform",
        }}
        className="relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[3/4] bg-ink"
      >
        <Link href={`/destinations/${slug}`} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-2xl md:rounded-3xl">
          {/* Photo */}
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 85vw, 33vw"
            className="object-cover"
            priority
          />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-transparent" />

          {/* Moving gloss highlight */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: active ? 1 : 0,
              background: `radial-gradient(circle at ${gloss.x}% ${gloss.y}%, rgba(255,255,255,0.13) 0%, transparent 55%)`,
            }}
          />

          {/* Top badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-cream/90 font-medium bg-ink/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-cream/10">
              {country}
            </span>
            {badge && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-ink font-semibold bg-gold px-2.5 py-1.5 rounded-full">
                {badge}
              </span>
            )}
          </div>

          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
            <h3 className="font-display text-2xl md:text-3xl font-medium text-cream leading-tight">
              {name}
            </h3>
            <p className="text-xs text-cream/55 mt-1.5 mb-4 leading-relaxed">{tagline}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-cream/40 uppercase tracking-wider">Starting from</p>
                <p className="text-sm font-semibold text-cream mt-0.5">
                  ₹{priceFrom.toLocaleString("en-IN")}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gold bg-gold/15 border border-gold/25 px-3 py-2 rounded-xl group-hover:bg-gold group-hover:text-ink transition-all">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
