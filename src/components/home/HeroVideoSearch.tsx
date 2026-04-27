"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Calendar, Users, Star, ArrowRight } from "lucide-react";

// TODO: confirm /video/hero.mp4 + /video/hero.webm exist in public/.
// Until then, the poster fallback covers; the <video> degrades gracefully on error.
const VIDEO_MP4   = "/video/hero.mp4";
const VIDEO_WEBM  = "/video/hero.webm";
// Plain Unsplash URL — Next image loader handles per-device sizing via the
// configured deviceSizes (360 / 640 / 828 / 1200 / 1920) so mobile gets a
// 360–828w image instead of the 1600w we used to send.
const VIDEO_POSTER = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop";

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  searchPlaceholder?: string;
  ctaLabel?: string;
  trustStrip?: string;
}

export default function HeroVideoSearch({
  eyebrow = "Trust and Trip · Crafting Reliable Travel",
  titleStart = "Trips that feel",
  titleItalic = "made just for you.",
  lede = "Tell us where your heart wants to go and a real planner will build an itinerary worth remembering — usually within 24 hours, always free until you're sure.",
  searchPlaceholder = 'Where to? Try "Bali", "Char Dham", or "Switzerland"',
  ctaLabel = "Plan my trip — free",
  trustStrip = "4.9 on Google · 8,000+ travelers since 2019 · WhatsApp planning, free",
}: Props) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [travelers, setTravelers] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("destination", destination.trim());
    if (days.trim())        params.set("days", days.trim());
    if (travelers.trim())   params.set("travelers", travelers.trim());
    router.push(`/plan?${params.toString()}`);
  };

  return (
    <section
      aria-label="Plan your trip"
      className="relative w-full min-h-[70vh] md:min-h-[88vh] flex items-center overflow-hidden bg-tat-charcoal"
    >
      {/* Background — Next-optimised poster image is the LCP element so it
          gets `priority`. Video plays on top once it loads (motion-reduce
          hides it). When video fails or no source, poster stays. */}
      <Image
        src={VIDEO_POSTER}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        quality={70}
        className="object-cover"
      />
      <video
        className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      >
        <source src={VIDEO_WEBM} type="video/webm" />
        <source src={VIDEO_MP4}  type="video/mp4" />
      </video>

      {/* Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.15) 100%)" }}
      />

      {/* Content */}
      <div className="relative w-full mx-auto max-w-3xl px-5 md:px-8 lg:px-12 py-22 text-center text-white">
        <p className="text-eyebrow uppercase font-medium text-tat-orange-soft/90">{eyebrow}</p>
        <h1 className="mt-3 font-display font-normal text-display md:text-display text-white text-balance">
          {titleStart} <em className="not-italic font-display italic text-tat-burnt">{titleItalic}</em>
        </h1>
        <p className="mt-4 text-lead text-white/85 max-w-2xl mx-auto text-balance">{lede}</p>

        {/* Search */}
        <form
          onSubmit={onSubmit}
          aria-label="Search destinations"
          className="mt-8 mx-auto bg-white rounded-card md:rounded-pill shadow-rail flex flex-col md:flex-row md:items-stretch p-2 md:p-1.5 gap-2 md:gap-0 md:divide-x md:divide-tat-charcoal/15"
        >
          <div className="relative flex-1 flex items-center">
            <label htmlFor="hs-dest" className="sr-only">Destination</label>
            <Search className="absolute left-4 h-4 w-4 text-tat-slate/80" aria-hidden />
            <input
              id="hs-dest"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-12 pl-11 pr-4 bg-transparent text-tat-charcoal placeholder:text-tat-slate/80 outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-pill"
            />
          </div>
          <div className="relative md:w-40 flex items-center">
            <label htmlFor="hs-days" className="sr-only">How many days</label>
            <Calendar className="absolute left-4 h-4 w-4 text-tat-slate/80" aria-hidden />
            <input
              id="hs-days"
              type="text"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="How many days?"
              className="w-full h-12 pl-11 pr-4 bg-transparent text-tat-charcoal placeholder:text-tat-slate/80 outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-pill"
            />
          </div>
          <div className="relative md:w-44 flex items-center">
            <label htmlFor="hs-trav" className="sr-only">Who is coming</label>
            <Users className="absolute left-4 h-4 w-4 text-tat-slate/80" aria-hidden />
            <input
              id="hs-trav"
              type="text"
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              placeholder="Who's coming?"
              className="w-full h-12 pl-11 pr-4 bg-transparent text-tat-charcoal placeholder:text-tat-slate/80 outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-pill"
            />
          </div>
          <button
            type="submit"
            className="tt-cta md:!w-auto md:!min-w-[200px] md:!h-12"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Trust strip — split on ' · ' so the icon prefixes the first item */}
        <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-meta text-white/85">
          <Star className="h-3.5 w-3.5 fill-tat-orange-soft text-tat-orange-soft" aria-hidden />
          {trustStrip.split(" · ").map((part, i, arr) => (
            <span key={i} className="inline-flex items-center gap-3">
              <span>{part}</span>
              {i < arr.length - 1 && <span aria-hidden className="text-white/30">·</span>}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
