"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, MessageCircle, Star,
  ShieldCheck, Clock, Sparkles, Pause, Play,
} from "lucide-react";
import HeroSanitySearch from "./HeroSanitySearch";

const HERO_BG_FALLBACK =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=70";
const WHATSAPP_HREF =
  "https://wa.me/918115999588?text=" +
  encodeURIComponent("Hi Trust and Trip — I'd like help planning my trip.");

interface Props {
  trustStrip?: string;
  /** Sanity-resolved background image URL. Falls back to Unsplash. */
  heroImage?: string;
  /** Direct .mp4/.webm URL. When set, renders an autoplay-loop-muted video
   *  layer over the still image. Image still LCPs first paint. */
  videoMp4Url?: string;
  /** Optional poster shown before video first frame. Defaults to heroImage. */
  videoPosterUrl?: string;
}

export default function Hero({
  trustStrip = "4.9★ on Google · 8,000+ travelers · 60+ destinations · Crafted since 2019",
  heroImage,
  videoMp4Url,
  videoPosterUrl,
}: Props = {}) {
  const bgImage = heroImage || HERO_BG_FALLBACK;
  const videoPoster = videoPosterUrl || bgImage;

  // Video accessibility: auto-pause when prefers-reduced-motion is on,
  // and surface a visible play/pause toggle so vestibular-sensitive
  // users (or anyone who finds the loop distracting) can stop it.
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoPaused, setVideoPaused] = useState(false);

  useEffect(() => {
    if (!videoMp4Url) return;
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const v = videoRef.current;
      if (!v) return;
      if (mq.matches) {
        v.pause();
        setVideoPaused(true);
      }
    };
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, [videoMp4Url]);

  const toggleVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setVideoPaused(false);
    } else {
      v.pause();
      setVideoPaused(true);
    }
  };

  return (
    <section
      aria-labelledby="hero-h1"
      className="relative isolate overflow-hidden bg-tat-charcoal min-h-[125vw] sm:min-h-0 flex flex-col justify-end sm:block"
    >
      {/* Background image — always rendered so LCP stays fast even when
          video is also configured. */}
      <Image
        src={bgImage}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        quality={70}
        className="object-cover -z-10"
      />
      {/* Background video — overlays the still image when configured. The
          image stays the LCP element; video fades in once it can play. */}
      {videoMp4Url && (
        <video
          ref={videoRef}
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={videoPoster}
          className="absolute inset-0 h-full w-full object-cover -z-10"
        >
          <source src={videoMp4Url} />
        </video>
      )}
      {videoMp4Url && (
        <button
          type="button"
          onClick={toggleVideo}
          aria-label={videoPaused ? "Play hero background video" : "Pause hero background video"}
          aria-pressed={!videoPaused}
          className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-10 inline-flex items-center justify-center h-9 w-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm text-white/95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
        >
          {videoPaused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
        </button>
      )}
      {/* Bottom-weighted gradient — keeps form legible */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,12,30,0.55) 0%, rgba(20,12,30,0.40) 35%, rgba(20,12,30,0.85) 100%)",
        }}
      />

      {/* Decorative gold orb — soft glow in upper-right of the hero on
          desktop. Pure ambient depth, sits behind everything. */}
      <div
        aria-hidden
        className="hidden sm:block absolute top-[-15%] right-[-8%] h-[520px] w-[520px] rounded-full bg-tat-gold/15 blur-3xl pointer-events-none -z-[5]"
      />
      <div
        aria-hidden
        className="hidden sm:block absolute bottom-[-20%] left-[-10%] h-[420px] w-[420px] rounded-full bg-tat-orange/12 blur-3xl pointer-events-none -z-[5]"
      />

      <div className="container-custom pt-8 pb-7 md:pt-20 md:pb-16">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-white/10 backdrop-blur-sm text-tat-orange-soft text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.18em] border border-white/15">
            <Star className="h-3 w-3 fill-tat-orange-soft text-tat-orange-soft" />
            Trust and Trip · Crafted travel since 2019
          </p>
          {/* H1 stays in DOM for SEO + screen readers, but visually
              hidden on mobile per request — the mobile hero leans on
              the badge + bottom trust strip alone. */}
          <h1
            id="hero-h1"
            className="sr-only sm:not-sr-only sm:mt-4 sm:font-display sm:font-normal sm:text-[40px] md:text-[56px] lg:text-[68px] sm:leading-[1.04] sm:text-white sm:text-balance sm:[text-shadow:0_2px_24px_rgba(0,0,0,0.35)]"
          >
            Trips planned by a real human{" "}
            <em className="not-italic font-display italic relative inline-block bg-gradient-to-r from-tat-gold via-[#E8B547] to-tat-gold bg-clip-text text-transparent">
              in 24 hours.
              <span
                aria-hidden
                className="absolute left-0 right-0 -bottom-2 h-[3px] rounded-full bg-gradient-to-r from-transparent via-tat-gold/80 to-transparent"
              />
            </em>
          </h1>
          <p className="mt-3 md:mt-6 text-[14px] md:text-lead text-white/85 max-w-2xl hidden sm:block">
            Tell us your dates and what you love. A real travel planner drafts
            your itinerary — free until you&apos;re sure. No card, no commitment.
          </p>

          {/* Mobile-only Sanity search — primary above-the-fold action */}
          <div className="md:hidden mt-5">
            <HeroSanitySearch />
            <p className="mt-2 text-[11px] text-white/75 text-center">
              Search destinations, packages, articles · Powered by Sanity
            </p>
          </div>

          {/* Risk-killers — three pills that close the "what does this
              cost me to try?" loop before the user reaches the form.
              Desktop only; mobile has its own trust strip in the footer. */}
          <ul className="hidden sm:flex flex-wrap items-center gap-2 mt-5 md:mt-7">
            {[
              { Icon: Clock,       label: "Itinerary in 24h"  },
              { Icon: ShieldCheck, label: "₹0 to start"        },
              { Icon: Sparkles,    label: "48h free changes"   },
            ].map(({ Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-[12px] font-medium border border-white/15"
              >
                <Icon className="h-3.5 w-3.5 text-tat-gold" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop Sanity-powered search bar — typeahead pulls
            destinations / packages / articles from Sanity in real time. */}
        <div className="hidden md:block mt-8">
          <HeroSanitySearch />
        </div>

        {/* Below-form trust line + live-planner WhatsApp escape.
            Green pulse dot on the WhatsApp link sells "real human
            online right now" without making a fake claim. */}
        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3 text-white/85">
          <p className="inline-flex flex-wrap items-center gap-x-2 text-meta">
            <Star className="h-3.5 w-3.5 fill-tat-gold text-tat-gold" aria-hidden />
            <span className="font-semibold text-white">{trustStrip}</span>
          </p>
          <Link
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-meta font-semibold text-white/90 hover:text-tat-orange-soft underline-offset-4 hover:underline transition group/wa"
          >
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
              <span className="absolute inset-0 rounded-full bg-whatsapp/70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-whatsapp" />
            </span>
            <MessageCircle className="h-4 w-4 text-whatsapp" />
            Planners online — chat on WhatsApp
            <ArrowRight className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-hover/wa:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

