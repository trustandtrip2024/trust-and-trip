"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Calendar, Users, Wallet, ArrowRight, MessageCircle, Star,
  ShieldCheck, Clock, Sparkles, Pause, Play,
} from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

const HERO_BG_FALLBACK =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=70";
const WHATSAPP_HREF =
  "https://wa.me/918115999588?text=" +
  encodeURIComponent("Hi Trust and Trip — I'd like help planning my trip.");

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
];
const PAX_OPTIONS = ["1", "2", "3", "4", "5+"];
const BUDGET_OPTIONS = [
  { id: "<50k",   label: "Under ₹50k" },
  { id: "50-1L",  label: "₹50k – ₹1L" },
  { id: "1-2L",   label: "₹1L – ₹2L" },
  { id: "2-5L",   label: "₹2L – ₹5L" },
  { id: "5L+",    label: "₹5L +" },
];

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
  const { open: openPlanner } = useTripPlanner();
  const [destination, setDestination] = useState("");
  const [month, setMonth] = useState("");
  const [pax, setPax] = useState("");
  const [budget, setBudget] = useState("");

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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    openPlanner({
      destinationName: destination,
      month,
      duration: pax,
      budget,
    });
  }

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

          {/* ─── Mobile-only CTA ───────────────────────────────────
              Desktop hero has the full search form (line 170+). On
              mobile that form is hidden, so without this CTA there is
              no primary conversion action above the fold. */}
          <div className="md:hidden mt-5 flex flex-col gap-3 max-w-md">
            <button
              type="button"
              onClick={() => openPlanner({})}
              className="relative overflow-hidden inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-tat-teal via-tat-teal to-tat-teal-deep text-white font-semibold text-[15px] shadow-[0_14px_30px_-10px_rgba(14,124,123,0.85)] active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-tt-shimmer" />
              <Sparkles className="relative h-4 w-4" aria-hidden />
              <span className="relative">Plan my trip — free</span>
              <ArrowRight className="relative h-4 w-4" aria-hidden />
            </button>
            <p className="text-[11px] text-white/75 text-center">
              2 mins · No card · Real planner replies in 24h
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

        {/* ─── Desktop: full search form ───────────────────────────
            Gold gradient hairline at top + glow ring on hover sells
            the form as a premium primary action, not a flat web
            widget. Submit button gets gold→orange gradient + shimmer. */}
        <form
          onSubmit={submit}
          className="group/heroform relative hidden md:block mt-8 bg-white/95 dark:bg-tat-charcoal/95 backdrop-blur-md rounded-2xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/15 hover:ring-tat-gold/45 transition-shadow duration-300"
        >
          <span
            aria-hidden
            className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-tat-gold/70 to-transparent"
          />
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_0.8fr_1fr_auto] divide-y md:divide-y-0 md:divide-x divide-tat-charcoal/10 dark:divide-white/10">
            <Field label="Destination" icon={Search}>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Bali, Maldives, Char Dham…"
                className="w-full bg-transparent text-[15px] text-tat-charcoal dark:text-tat-paper placeholder:text-tat-charcoal/40 dark:placeholder:text-tat-paper/40 focus:outline-none"
                aria-label="Destination"
              />
            </Field>
            <Field label="When" icon={Calendar}>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-transparent text-[15px] text-tat-charcoal dark:text-tat-paper focus:outline-none cursor-pointer"
                aria-label="Travel month"
              >
                <option value="">Pick month</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Travelers" icon={Users}>
              <select
                value={pax}
                onChange={(e) => setPax(e.target.value)}
                className="w-full bg-transparent text-[15px] text-tat-charcoal dark:text-tat-paper focus:outline-none cursor-pointer"
                aria-label="Number of travelers"
              >
                <option value="">2 adults</option>
                {PAX_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Budget / person" icon={Wallet}>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-transparent text-[15px] text-tat-charcoal dark:text-tat-paper focus:outline-none cursor-pointer"
                aria-label="Budget per person"
              >
                <option value="">Any budget</option>
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </Field>
            <div className="p-2 md:p-2.5 flex">
              <button
                type="submit"
                className="relative overflow-hidden w-full md:w-auto inline-flex flex-col items-center justify-center gap-0 h-12 md:h-14 px-6 md:px-8 rounded-xl bg-gradient-to-r from-tat-teal via-tat-teal to-tat-teal-deep text-white font-semibold text-[15px] shadow-[0_14px_30px_-10px_rgba(14,124,123,0.85)] active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2 group/cta"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-tt-shimmer"
                />
                <span className="relative inline-flex items-center gap-1.5 leading-none">
                  Plan my trip
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                </span>
                <span className="relative text-[10px] font-medium opacity-80 mt-1 tracking-wide leading-none">
                  Free · 2 mins · No card
                </span>
              </button>
            </div>
          </div>
        </form>

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

function Field({
  label, icon: Icon, children,
}: {
  label: string; icon: typeof Search; children: React.ReactNode;
}) {
  return (
    <label className="block px-4 py-3 md:py-4 cursor-text">
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-tat-charcoal/55 dark:text-tat-paper/55">
        <Icon className="h-3 w-3 text-tat-gold" aria-hidden />
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
