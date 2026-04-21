"use client";

import { useEffect, useState } from "react";
import { Award, Shield, Globe2, ThumbsUp, Instagram } from "lucide-react";
import type { InstagramPost } from "@/app/api/instagram/route";

const STATS = [
  { value: "4.9★", label: "Google Rating", sub: "500+ verified reviews" },
  { value: "5,000+", label: "Happy Travellers", sub: "Every year" },
  { value: "23+", label: "Destinations", sub: "Domestic & international" },
  { value: "98%", label: "Satisfaction Rate", sub: "Based on post-trip surveys" },
];

const BADGES = [
  { icon: Award, label: "Featured on Condé Nast Traveller" },
  { icon: Shield, label: "IATA Accredited Travel Agency" },
  { icon: Globe2, label: "Ministry of Tourism Recognised" },
  { icon: ThumbsUp, label: "Recommended by 98% of Travellers" },
];

const FALLBACK = [
  { img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80&auto=format&fit=crop", dest: "Bali" },
  { img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80&auto=format&fit=crop", dest: "Maldives" },
  { img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80&auto=format&fit=crop", dest: "Kerala" },
  { img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80&auto=format&fit=crop", dest: "Dubai" },
  { img: "https://images.unsplash.com/photo-1590082773386-d19499f8c28e?w=400&q=80&auto=format&fit=crop", dest: "Rajasthan" },
  { img: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=400&q=80&auto=format&fit=crop", dest: "Switzerland" },
  { img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80&auto=format&fit=crop", dest: "Thailand" },
  { img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80&auto=format&fit=crop", dest: "Japan" },
];

function getCaption(caption?: string): string {
  if (!caption) return "";
  // Return first line only, max 40 chars
  const first = caption.split("\n")[0].replace(/#\S+/g, "").trim();
  return first.length > 40 ? first.slice(0, 37) + "…" : first;
}

export default function SocialProofWall() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/instagram")
      .then((r) => r.json())
      .then((d) => {
        if (d.posts?.length) setPosts(d.posts.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const isReal = posts.length > 0;

  return (
    <section className="py-14 md:py-20 bg-cream overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow">Trusted by travellers</span>
            <h2 className="heading-section mt-2 text-balance">
              Real trips,
              <span className="italic text-gold font-light"> real memories.</span>
            </h2>
          </div>
          <a
            href="https://instagram.com/trust_and_trip"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink transition-colors shrink-0"
          >
            <Instagram className="h-4 w-4" />
            @trust_and_trip →
          </a>
        </div>

        {/* Instagram grid */}
        <div className="grid grid-cols-4 gap-1.5 md:gap-2 rounded-2xl overflow-hidden mb-12">
          {isReal
            ? posts.map((post) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden bg-sand"
                >
                  <img
                    src={post.media_url}
                    alt={getCaption(post.caption) || "Trust and Trip"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/55 transition-all duration-300 flex items-end p-2">
                    <p className="opacity-0 group-hover:opacity-100 transition-opacity text-cream text-[10px] font-medium leading-tight line-clamp-2">
                      {getCaption(post.caption)}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Instagram className="h-3.5 w-3.5 text-cream drop-shadow" />
                  </div>
                </a>
              ))
            : FALLBACK.map((post, i) => (
                <a
                  key={i}
                  href="https://instagram.com/trust_and_trip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden"
                >
                  <img
                    src={post.img}
                    alt={post.dest}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/50 transition-all duration-300 flex items-center justify-center">
                    <p className="opacity-0 group-hover:opacity-100 transition-opacity text-cream text-xs font-semibold">
                      {post.dest}
                    </p>
                  </div>
                </a>
              ))}
        </div>

        {/* Trust stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {STATS.map(({ value, label, sub }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-ink/5 text-center">
              <p className="font-display text-3xl md:text-4xl font-medium text-ink">{value}</p>
              <p className="text-sm font-medium text-ink mt-1">{label}</p>
              <p className="text-[11px] text-ink/40 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-8 border-t border-ink/8">
          {BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-ink/60">
              <Icon className="h-4 w-4 text-gold shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
