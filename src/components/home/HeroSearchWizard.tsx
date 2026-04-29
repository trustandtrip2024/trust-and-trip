"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import GoogleReviewsPill from "@/components/GoogleReviewsPill";
import LivePlannerStatus from "@/components/home/LivePlannerStatus";
import {
  Heart, Star, ArrowRight, Sparkles, Crown, Users, User, Briefcase, Play,
  MessageCircle, Zap,
} from "lucide-react";

// Fallback hero photo when no Sanity image / video is configured.
// Width capped at 1920 (covers most desktops; Next/Image picks a smaller
// srcset entry for tablets/phones), q=70 trims ~25-30% off the LCP byte
// budget vs q=80 with no perceptible difference under the dark overlay.
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=1920&q=70";

// Persona pills — quick browse-by-traveller-type entries that route to the
// /packages list pre-filtered by travelType. Used to be a full multi-step
// wizard; stripped down so the hero feels like a brand video, not a form.
const PERSONA_PILLS = [
  { id: "Couple",  label: "Couple",  icon: Heart,     param: "Couple" },
  { id: "Family",  label: "Family",  icon: Users,     param: "Family" },
  { id: "Solo",    label: "Solo",    icon: User,      param: "Solo"   },
  { id: "Friends", label: "Friends", icon: Users,     param: "Group"  },
  { id: "Senior",  label: "Senior",  icon: Crown,     param: "Family" },
  { id: "Work",    label: "Work",    icon: Briefcase, param: "Group"  },
];

// YouTube / Vimeo URL → embed URL. Returns null when the URL is not a
// recognised provider — caller falls back to the still hero image only.
// Kept for legacy `videoUrl` field; new content should use `videoMp4Url`.
function parseHeroVideoUrl(raw?: string): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    }
    if (host === "youtube-nocookie.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`;
    }
  } catch {
    return null;
  }
  return null;
}

interface HeroProps {
  eyebrow?: string;
  trustStrip?: string;
  /** Sanity-driven hero background image. Falls back to HERO_IMAGE_URL. */
  heroImage?: string;
  /** Sanity-driven direct .mp4 / .webm — plays as autoplay-loop-muted bg. */
  videoMp4Url?: string;
  /** Legacy YouTube / Vimeo URL — click-to-play overlay; ignored when
   *  videoMp4Url is set. */
  videoUrl?: string;
  /** Optional poster URL for the video pre-play state (defaults to heroImage). */
  videoPosterUrl?: string;
}

/**
 * Hero — brand video + a small set of zero-friction entries (quiz / chat /
 * persona pills). The legacy 5-step wizard and "Already know? Search
 * destination bar" were both removed — they competed with each other and
 * with /quiz, and read as form-density rather than brand. Title + lede
 * also dropped per brand brief; an sr-only h1 stays for SEO.
 */
export default function HeroSearchWizard({
  eyebrow = "Trust and Trip · Crafting Reliable Travel",
  trustStrip = "143+ trips planned this week · 4.9★ from 8,000+ travelers · 60+ destinations",
  heroImage,
  videoMp4Url,
  videoUrl,
  videoPosterUrl,
}: HeroProps) {
  const [playingVideo, setPlayingVideo] = useState(false);

  const finalHeroImage = heroImage || HERO_IMAGE_URL;
  const videoEmbed = parseHeroVideoUrl(videoUrl);
  const posterImage = videoPosterUrl || finalHeroImage;
  const useNativeVideo = !!videoMp4Url;

  return (
    <section
      id="hero-search"
      aria-label="Trust and Trip hero"
      className="relative w-full min-h-[78vh] md:min-h-[82vh] flex items-center overflow-hidden bg-tat-charcoal"
    >
      {/* SEO/a11y h1 — visually hidden because the brand identity reads
          through the video + eyebrow chip; the page still needs exactly
          one h1 for landmarks + Google. */}
      <h1 className="sr-only">Trust and Trip — Crafted travel for India and beyond</h1>

      {/* ── Hero media ───────────────────────────────────────────────────
          Order of preference: native mp4/webm (best brand feel, no chrome)
          → YouTube/Vimeo click-to-play (legacy) → still image. Poster always
          renders first behind the video so cold-load doesn't show black. */}
      {useNativeVideo ? (
        <>
          <Image
            src={posterImage}
            alt=""
            aria-hidden
            fill
            priority
            fetchPriority="high"
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
            poster={posterImage}
            preload="metadata"
            aria-hidden
          >
            <source src={videoMp4Url} />
          </video>
        </>
      ) : playingVideo && videoEmbed ? (
        <iframe
          src={videoEmbed}
          title="Trust and Trip — hero video"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <Image
          src={videoEmbed ? posterImage : finalHeroImage}
          alt="Trust and Trip — crafted travel hero"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={70}
          className="object-cover"
        />
      )}

      {videoEmbed && !useNativeVideo && !playingVideo && (
        <button
          type="button"
          onClick={() => setPlayingVideo(true)}
          aria-label="Play hero video"
          className="absolute inset-0 z-[5] grid place-items-center group focus-visible:outline-none"
        >
          <span className="grid place-items-center h-16 w-16 md:h-20 md:w-20 rounded-full bg-tat-paper/95 text-tat-charcoal shadow-[0_12px_36px_-8px_rgba(0,0,0,0.55)] ring-4 ring-tat-paper/15 group-hover:scale-105 group-focus-visible:ring-tat-orange/60 transition-transform">
            <Play className="h-6 w-6 md:h-7 md:w-7 fill-current translate-x-0.5" aria-hidden />
          </span>
        </button>
      )}

      {/* Bottom-weighted gradient — keeps the photo/video vibrant on top
          while ensuring trust strip + chips stay legible. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(20, 12, 30, 0.72) 0%, rgba(20, 12, 30, 0.28) 50%, rgba(255, 255, 255, 0.05) 100%)" }}
      />

      <div className="relative w-full mx-auto max-w-3xl px-5 md:px-8 lg:px-12 pt-24 pb-14 md:py-22 text-center text-white">
        <p className="text-[10px] md:text-eyebrow uppercase font-medium tracking-[0.22em] text-tat-orange-soft/90">{eyebrow}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-tat-orange/15 border border-tat-orange/40 backdrop-blur-sm text-tat-orange-soft text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1.5">
          <Zap className="h-3 w-3" aria-hidden />
          Free itinerary in 24 h · No card needed
        </span>

        {/* Persona pills — quick browse-by-traveller. Each pill routes to
            /packages?type=… so the click is one hop to results, no form. */}
        <div className="relative z-10 mt-7 flex flex-wrap items-center justify-center gap-2">
          {PERSONA_PILLS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.id}
                href={`/packages?type=${encodeURIComponent(p.param)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-white/10 hover:bg-white/20 border border-white/25 text-white text-[12px] md:text-sm font-medium backdrop-blur-sm transition-all"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {p.label}
              </Link>
            );
          })}
        </div>

        {/* Primary entry points — quiz for "not sure", WhatsApp for
            "talk to a human". Replaces the wizard/quick-search density. */}
        <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 min-w-[200px] rounded-pill bg-tat-teal hover:bg-tat-teal-deep text-white text-sm font-semibold transition shadow-[0_10px_28px_-10px_rgba(14,124,123,0.7)]"
          >
            <Sparkles className="h-4 w-4 text-tat-gold" aria-hidden />
            Take 60-sec quiz
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href="/api/wa/click?src=hero_chat&msg=Hi%20Trust%20and%20Trip%2C%20I%27d%20like%20to%20plan%20a%20trip."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 min-w-[200px] rounded-pill bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-semibold backdrop-blur-sm transition"
          >
            <MessageCircle className="h-4 w-4 text-tat-orange-soft" aria-hidden />
            Chat with a planner
          </a>
        </div>

        {/* Google review pill above the trust strip — third-party
            verification reads stronger than self-reported copy.
            LivePlannerStatus next to it covers the "humans are
            standing by" beat for indecisive visitors. */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <GoogleReviewsPill tone="light" />
          <LivePlannerStatus />
        </div>
        <p className="mt-3 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-meta text-white/85">
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
