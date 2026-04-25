"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Users, Star, ArrowRight } from "lucide-react";

// TODO: confirm /video/hero.mp4 + /video/hero.webm exist in public/.
// Until then, the poster fallback covers; the <video> degrades gracefully on error.
const VIDEO_MP4   = "/video/hero.mp4";
const VIDEO_WEBM  = "/video/hero.webm";
const VIDEO_POSTER = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=75&auto=format&fit=crop";

export default function HeroVideoSearch() {
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
      className="relative w-full min-h-[70vh] md:min-h-[88vh] flex items-center overflow-hidden bg-stone-900"
    >
      {/* Background — video with reduced-motion fallback to poster */}
      <video
        className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden"
        autoPlay
        loop
        muted
        playsInline
        poster={VIDEO_POSTER}
        aria-hidden="true"
      >
        <source src={VIDEO_WEBM} type="video/webm" />
        <source src={VIDEO_MP4}  type="video/mp4" />
      </video>
      {/* Reduced-motion: still poster */}
      <picture className="hidden motion-reduce:block absolute inset-0">
        <img src={VIDEO_POSTER} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
      </picture>

      {/* Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.15) 100%)" }}
      />

      {/* Content */}
      <div className="relative w-full mx-auto max-w-3xl px-5 md:px-8 lg:px-12 py-22 text-center text-white">
        <p className="text-eyebrow uppercase font-medium text-amber-300/90">
          Trust and Trip · Crafting Reliable Travel
        </p>
        <h1 className="mt-3 font-serif text-display md:text-display text-white text-balance">
          Trips that feel <em className="not-italic font-serif italic text-amber-300">made just for you.</em>
        </h1>
        <p className="mt-4 text-lead text-white/85 max-w-2xl mx-auto text-balance">
          Tell us where your heart wants to go and a real planner will build an itinerary worth remembering — usually within 24 hours, always free until you&apos;re sure.
        </p>

        {/* Search */}
        <form
          onSubmit={onSubmit}
          aria-label="Search destinations"
          className="mt-8 mx-auto bg-white rounded-card md:rounded-pill shadow-rail flex flex-col md:flex-row md:items-stretch p-2 md:p-1.5 gap-2 md:gap-0 md:divide-x md:divide-stone-200"
        >
          <div className="relative flex-1 flex items-center">
            <label htmlFor="hs-dest" className="sr-only">Destination</label>
            <Search className="absolute left-4 h-4 w-4 text-stone-500" aria-hidden />
            <input
              id="hs-dest"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder='Where to? Try "Bali", "Char Dham", or "Switzerland"'
              className="w-full h-12 pl-11 pr-4 bg-transparent text-stone-900 placeholder:text-stone-500 outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 rounded-pill"
            />
          </div>
          <div className="relative md:w-40 flex items-center">
            <label htmlFor="hs-days" className="sr-only">How many days</label>
            <Calendar className="absolute left-4 h-4 w-4 text-stone-500" aria-hidden />
            <input
              id="hs-days"
              type="text"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="How many days?"
              className="w-full h-12 pl-11 pr-4 bg-transparent text-stone-900 placeholder:text-stone-500 outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 rounded-pill"
            />
          </div>
          <div className="relative md:w-44 flex items-center">
            <label htmlFor="hs-trav" className="sr-only">Who is coming</label>
            <Users className="absolute left-4 h-4 w-4 text-stone-500" aria-hidden />
            <input
              id="hs-trav"
              type="text"
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              placeholder="Who's coming?"
              className="w-full h-12 pl-11 pr-4 bg-transparent text-stone-900 placeholder:text-stone-500 outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 rounded-pill"
            />
          </div>
          <button
            type="submit"
            className="tt-cta md:!w-auto md:!min-w-[200px] md:!h-12"
          >
            Plan my trip — free
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Trust strip */}
        <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-meta text-white/85">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
            4.9 on Google
          </span>
          <span aria-hidden className="text-white/30">·</span>
          <span>8,000+ travelers since 2019</span>
          <span aria-hidden className="text-white/30">·</span>
          <span>WhatsApp planning, free</span>
        </p>
      </div>
    </section>
  );
}
