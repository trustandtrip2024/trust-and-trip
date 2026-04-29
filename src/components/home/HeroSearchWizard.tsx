"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleReviewsPill from "@/components/GoogleReviewsPill";
import LivePlannerStatus from "@/components/home/LivePlannerStatus";
import {
  Search, Calendar, Users, User, Heart, Star, ArrowRight, ChevronLeft,
  Mountain, Sparkles, Briefcase, Crown, Sunset, Church, MapPin, X, Zap, Play,
  MessageCircle,
} from "lucide-react";

// Hero photo. Light, vibrant — a family enjoying a beachside luxury moment.
// Swap this URL to update the hero. Width capped at 1920 (covers most
// desktops; Next/Image picks a smaller srcset entry for tablets/phones)
// and quality 70 trims ~25-30% off the LCP byte budget vs q=80 with
// no perceptible difference on a heavily overlaid hero.
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=1920&q=70";

// Optional looping background video — kept as enhancement only. If
// present the file is served from /public/video; otherwise the image
// stays as the hero. Disabled for now per the brand brief: the family
// photo is the hero, no motion required.
const ENABLE_HERO_VIDEO = false;
const VIDEO_MP4 = "/video/hero.mp4";
const VIDEO_WEBM = "/video/hero.webm";

// YouTube / Vimeo URL → embed URL. Returns null when the URL is not a
// recognised provider — caller falls back to the still hero image only.
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

type StepId = "destination" | "with" | "interest" | "duration" | "place";

interface WizardState {
  destination: string;
  destinationLabel: string;
  with: string;
  interest: string;
  duration: string;
  place: string;
}

const STEPS: { id: StepId; label: string }[] = [
  { id: "destination", label: "Where to" },
  { id: "with",        label: "Who"      },
  { id: "interest",    label: "Mood"     },
  { id: "duration",    label: "How long" },
  { id: "place",       label: "Refine"   },
];

const POPULAR_DESTS = [
  { slug: "bali",        label: "Bali",        flag: "🌺" },
  { slug: "kerala",      label: "Kerala",      flag: "🌴" },
  { slug: "rajasthan",   label: "Rajasthan",   flag: "🏜️" },
  { slug: "maldives",    label: "Maldives",    flag: "🏝️" },
  { slug: "uttarakhand", label: "Uttarakhand", flag: "🛕" },
  { slug: "switzerland", label: "Switzerland", flag: "🏔️" },
  { slug: "thailand",    label: "Thailand",    flag: "🐘" },
  { slug: "ladakh",      label: "Ladakh",      flag: "⛰️" },
];

const TRAVELING_WITH = [
  { id: "Couple",     label: "Couple",          icon: Heart,     mapTo: "Couple" },
  { id: "Family",     label: "Family",          icon: Users,     mapTo: "Family" },
  { id: "Solo",       label: "Solo",            icon: User,      mapTo: "Solo"   },
  { id: "Friends",    label: "Friends",         icon: Users,     mapTo: "Group"  },
  { id: "Colleagues", label: "Colleagues",      icon: Briefcase, mapTo: "Group"  },
  { id: "Senior",     label: "Senior citizens", icon: Crown,     mapTo: "Family" },
];

const INTERESTS = [
  { id: "leisure",   label: "Leisure",   icon: Sunset    },
  { id: "adventure", label: "Adventure", icon: Mountain  },
  { id: "culture",   label: "Culture",   icon: Sparkles  },
  { id: "wellness",  label: "Wellness",  icon: Heart     },
  { id: "pilgrim",   label: "Pilgrim",   icon: Church    },
  { id: "honeymoon", label: "Honeymoon", icon: Heart     },
  { id: "luxury",    label: "Luxury",    icon: Crown     },
];

const DURATIONS = [
  { id: "long-weekend", label: "Long weekend", hint: "1–3 days", param: "3–5days"  },
  { id: "3-5",          label: "Short trip",   hint: "3–5 days", param: "3–5days"  },
  { id: "6-9",          label: "Full week",    hint: "6–9 days", param: "5–7days"  },
  { id: "10+",          label: "Extended",     hint: "10+ days", param: "10+days"  },
];

const PLACES_BY_DEST: Record<string, string[]> = {
  bali:        ["Ubud", "Seminyak", "Canggu", "Nusa Penida"],
  kerala:      ["Munnar", "Alleppey", "Kochi", "Wayanad"],
  rajasthan:   ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer"],
  maldives:    ["Male Atoll", "Baa Atoll", "Ari Atoll"],
  uttarakhand: ["Rishikesh", "Mussoorie", "Nainital", "Auli"],
  switzerland: ["Zurich", "Interlaken", "Zermatt", "Lucerne"],
  thailand:    ["Bangkok", "Phuket", "Krabi", "Chiang Mai"],
  ladakh:      ["Leh", "Nubra Valley", "Pangong", "Kargil"],
};

function emptyState(): WizardState {
  return { destination: "", destinationLabel: "", with: "", interest: "", duration: "", place: "" };
}

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildUrl(state: WizardState) {
  const params = new URLSearchParams();
  if (state.destination) params.set("destination", state.destination);
  const w = TRAVELING_WITH.find((t) => t.id === state.with);
  if (w) params.set("type", w.mapTo);
  if (state.interest) params.set("interest", state.interest);
  const d = DURATIONS.find((x) => x.id === state.duration);
  if (d) params.set("duration", d.param);
  if (state.place) params.set("place", state.place);
  return `/packages?${params.toString()}`;
}

interface WizardProps {
  state: WizardState;
  setState: (s: WizardState) => void;
  step: number;
  setStep: (n: number) => void;
  onSubmit: () => void;
  variant?: "hero" | "modal";
}

function Wizard({ state, setState, step, setStep, onSubmit, variant = "hero" }: WizardProps) {
  const current = STEPS[step];
  const total = STEPS.length;
  const update = (patch: Partial<WizardState>) => setState({ ...state, ...patch });

  const canNext =
    current.id === "destination" ? !!state.destination :
    current.id === "with"        ? !!state.with        :
    current.id === "interest"    ? !!state.interest    :
    current.id === "duration"    ? !!state.duration    :
    true;

  const isLast = step === total - 1;
  const handleNext = () => {
    if (!canNext) return;
    if (isLast) onSubmit();
    else setStep(step + 1);
  };

  const places = state.destination ? (PLACES_BY_DEST[state.destination] ?? []) : [];

  return (
    <div
      className={
        variant === "hero"
          ? "relative z-20 mt-7 mx-auto max-w-2xl bg-white rounded-card shadow-rail p-5 md:p-6 text-tat-charcoal text-left"
          : "p-5 text-tat-charcoal"
      }
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-eyebrow uppercase text-tat-slate font-medium">
            Step {step + 1} of {total}
          </span>
          <span className="text-meta text-tat-slate/70">·</span>
          <span className="text-meta text-tat-charcoal font-medium">{current.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              aria-hidden
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-tat-orange"
                : i < step ? "w-3 bg-tat-orange/60"
                : "w-3 bg-tat-charcoal/15"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="min-h-[200px]">
        {current.id === "destination" && (
          <div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-tat-slate" aria-hidden />
              <input
                type="text"
                value={state.destinationLabel}
                onChange={(e) => {
                  const v = e.target.value;
                  update({ destinationLabel: v, destination: v ? slugify(v) : "", place: "" });
                }}
                placeholder="Type a country, region or city"
                className="w-full h-12 pl-11 pr-4 rounded-pill bg-tat-cream-warm/40 border border-tat-charcoal/10 placeholder:text-tat-slate outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
              />
            </div>
            <p className="mt-3 text-meta text-tat-slate">Or pick a popular one:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {POPULAR_DESTS.map((d) => {
                const active = state.destination === d.slug;
                return (
                  <button
                    key={d.slug}
                    type="button"
                    onClick={() => update({ destination: d.slug, destinationLabel: d.label, place: "" })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-body-sm transition-all border ${
                      active
                        ? "bg-tat-orange text-white border-tat-orange"
                        : "bg-white text-tat-charcoal border-tat-charcoal/15 hover:border-tat-orange/50"
                    }`}
                  >
                    <span aria-hidden>{d.flag}</span> {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {current.id === "with" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TRAVELING_WITH.map((t) => {
              const Icon = t.icon;
              const active = state.with === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ with: t.id })}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-card border transition-all ${
                    active
                      ? "bg-tat-orange/10 border-tat-orange"
                      : "bg-white border-tat-charcoal/15 hover:border-tat-orange/40"
                  }`}
                >
                  <Icon className="h-5 w-5 text-tat-gold" aria-hidden />
                  <span className="text-body-sm font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {current.id === "interest" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INTERESTS.map((t) => {
              const Icon = t.icon;
              const active = state.interest === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ interest: t.id })}
                  className={`flex items-center gap-2 px-3 py-3 rounded-card border transition-all text-left ${
                    active
                      ? "bg-tat-orange/10 border-tat-orange"
                      : "bg-white border-tat-charcoal/15 hover:border-tat-orange/40"
                  }`}
                >
                  <Icon className="h-4 w-4 text-tat-gold shrink-0" aria-hidden />
                  <span className="text-body-sm font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {current.id === "duration" && (
          <div className="grid grid-cols-2 gap-2">
            {DURATIONS.map((d) => {
              const active = state.duration === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => update({ duration: d.id })}
                  className={`flex flex-col items-start gap-1 p-3 rounded-card border transition-all ${
                    active
                      ? "bg-tat-orange/10 border-tat-orange"
                      : "bg-white border-tat-charcoal/15 hover:border-tat-orange/40"
                  }`}
                >
                  <span className="text-body-sm font-medium">{d.label}</span>
                  <span className="text-meta text-tat-slate">{d.hint}</span>
                </button>
              );
            })}
          </div>
        )}

        {current.id === "place" && (
          <div>
            {places.length > 0 ? (
              <>
                <p className="text-meta text-tat-slate mb-2">
                  Pick a city or attraction in {state.destinationLabel || "your destination"}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {places.map((p) => {
                    const active = state.place === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => update({ place: state.place === p ? "" : p })}
                        className={`px-3 py-1.5 rounded-pill text-body-sm border transition-all ${
                          active
                            ? "bg-tat-orange text-white border-tat-orange"
                            : "bg-white text-tat-charcoal border-tat-charcoal/15 hover:border-tat-orange/40"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-meta text-tat-slate">
                Optional — skip to see all packages for {state.destinationLabel || "your destination"}.
              </p>
            )}
            <div className="relative mt-3">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-tat-slate" aria-hidden />
              <input
                type="text"
                value={state.place}
                onChange={(e) => update({ place: e.target.value })}
                placeholder="Or type a place / attraction"
                className="w-full h-11 pl-11 pr-4 rounded-pill bg-tat-cream-warm/40 border border-tat-charcoal/10 placeholder:text-tat-slate outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 text-body-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1 text-body-sm text-tat-slate disabled:opacity-30 hover:text-tat-charcoal"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canNext}
          className="inline-flex items-center justify-center gap-2 h-12 px-5 min-w-[160px] rounded-pill font-semibold text-white bg-tat-teal hover:bg-tat-teal-deep transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLast ? "Show trips" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface HeroProps {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  trustStrip?: string;
  /** Used to power the inline quick-search. Optional — when absent, the
   *  search bar still works but only matches against POPULAR_DESTS. */
  destinations?: { slug: string; name: string; country?: string }[];
  /** Sanity-driven hero background image. Falls back to HERO_IMAGE_URL. */
  heroImage?: string;
  /** Sanity-driven YouTube / Vimeo URL. When set, click-to-play overlay. */
  videoUrl?: string;
  /** Optional poster URL for the video pre-play state (defaults to heroImage). */
  videoPosterUrl?: string;
}

export default function HeroSearchWizard({
  eyebrow = "Trust and Trip · Crafting Reliable Travel",
  titleStart = "Trips that feel",
  titleItalic = "made just for you.",
  lede = "A real planner. An itinerary in 24 hours. Free until you're sure.",
  trustStrip = "143+ trips planned this week · 4.9★ from 8,000+ travelers · 60+ destinations",
  destinations = [],
  heroImage,
  videoUrl,
  videoPosterUrl,
}: HeroProps) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(emptyState);
  const [step, setStep] = useState(0);
  const [playingVideo, setPlayingVideo] = useState(false);

  const handleSubmit = () => {
    router.push(buildUrl(state));
  };

  const finalHeroImage = heroImage || HERO_IMAGE_URL;
  const videoEmbed = parseHeroVideoUrl(videoUrl);
  const posterImage = videoPosterUrl || finalHeroImage;

  return (
    <section
      id="hero-search"
      aria-label="Plan your trip"
      className="relative w-full min-h-[88vh] md:min-h-[88vh] flex items-center overflow-hidden bg-tat-charcoal"
    >
      {/* Hero media — Sanity-driven. The still image always renders first
          (and stays the LCP) so a YouTube/Vimeo iframe never blocks initial
          paint. When a videoUrl is set, a play button overlays the still
          and click swaps in the autoplay embed. */}
      {playingVideo && videoEmbed ? (
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
          alt="A family enjoying a sunny beachside luxury holiday — Trust and Trip hero"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={70}
          className="object-cover"
        />
      )}
      {videoEmbed && !playingVideo && (
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
      {ENABLE_HERO_VIDEO && (
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
      )}
      {/* Light, warm overlay — keeps the photo vibrant while ensuring text
          contrast. Top-half stays bright; only the headline area darkens. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(20, 12, 30, 0.55) 0%, rgba(20, 12, 30, 0.25) 45%, rgba(255, 255, 255, 0.05) 100%)" }}
      />

      <div className="relative w-full mx-auto max-w-3xl px-5 md:px-8 lg:px-12 pt-24 pb-14 md:py-22 text-center text-white">
        <p className="text-[10px] md:text-eyebrow uppercase font-medium tracking-[0.22em] text-tat-orange-soft/90">{eyebrow}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-tat-orange/15 border border-tat-orange/40 backdrop-blur-sm text-tat-orange-soft text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1.5">
          <Zap className="h-3 w-3" aria-hidden />
          Free itinerary in 24 h · No card needed
        </span>
        <h1
          className="mt-4 font-display font-normal text-[40px] leading-[1.04] md:text-display text-white text-balance [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]"
        >
          {titleStart} <em className="not-italic font-display italic text-tat-gold">{titleItalic}</em>
        </h1>
        <p className="mt-4 text-base md:text-lead text-white/85 max-w-2xl mx-auto text-balance [text-shadow:0_1px_12px_rgba(0,0,0,0.55)]">{lede}</p>

        {/* Quick destination search — for users who already know where they
            want to go. Bypasses the multi-step wizard and lands them straight
            on /packages?destination=…. Type-ahead matches Sanity destinations
            first, falls back to a free-text slug submission on Enter. */}
        <HeroQuickSearch destinations={destinations} />

        {/* Pre-segmentation tiles — quick start by traveller persona */}
        <div className="relative z-10 mt-5 flex flex-wrap items-center justify-center gap-2">
          {TRAVELING_WITH.slice(0, 5).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setState({ ...emptyState(), with: t.id });
                  setStep(0);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill bg-white/10 hover:bg-white/20 border border-white/25 text-white text-[12px] md:text-sm font-medium backdrop-blur-sm transition-all"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {t.label}
              </button>
            );
          })}
        </div>

        <Wizard
          state={state}
          setState={setState}
          step={step}
          setStep={setStep}
          onSubmit={handleSubmit}
        />

        {/* Zero-friction escape hatches — users who don't want to use the
            wizard can either talk to a real planner on WhatsApp, or take
            a 60s quiz that scores three matches from our catalogue. */}
        <div className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-white/85 text-[13px] md:text-sm">
          <span className="text-white/55">Not sure where to start?</span>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-1.5 font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold/60 rounded-md"
          >
            <Sparkles className="h-4 w-4 text-tat-gold" aria-hidden />
            Take 60-sec quiz
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <span aria-hidden className="text-white/30">·</span>
          <a
            href="/api/wa/click?src=hero_chat&msg=Hi%20Trust%20and%20Trip%2C%20I%27d%20like%20to%20plan%20a%20trip."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold/60 rounded-md"
          >
            <MessageCircle className="h-4 w-4 text-tat-orange-soft" aria-hidden />
            Chat with a planner
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>

        {/* Google review pill sits above the brand trust strip — third-
            party verification reads stronger than self-reported copy.
            LivePlannerStatus right next to it gives the "humans are
            standing by" beat that converts indecisive visitors. */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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

export function MobileStickySearch() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<WizardState>(emptyState);
  const [step, setStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const hero = document.getElementById("hero-search");
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-56px 0px 0px 0px" }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (show) document.documentElement.classList.add("mobile-search-active");
    else document.documentElement.classList.remove("mobile-search-active");
    return () => document.documentElement.classList.remove("mobile-search-active");
  }, [show]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSubmit = () => {
    setOpen(false);
    router.push(buildUrl(state));
  };

  if (!show) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open trip planner"
        className="md:hidden fixed top-0 inset-x-0 z-[55] h-14 flex items-center px-4 gap-3 text-left bg-tat-paper/95 backdrop-blur-2xl border-b border-tat-orange/15 shadow-[0_8px_32px_-12px_rgba(45,26,55,0.18)]"
      >
        <Search className="h-4 w-4 text-tat-charcoal shrink-0" aria-hidden />
        <span className="flex-1 text-body-sm text-tat-charcoal/70 truncate">
          {state.destinationLabel || "Where do you want to go?"}
        </span>
        <span className="bg-tat-orange text-white text-meta px-3 py-1 rounded-pill font-medium">
          Plan
        </span>
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-[80] bg-tat-charcoal/60 backdrop-blur-sm flex items-end"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full bg-white rounded-t-card max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-tat-charcoal/10 sticky top-0 bg-white z-10">
              <span className="font-serif text-h3 text-tat-charcoal">Plan your trip</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-2 -mr-2 rounded-full hover:bg-tat-charcoal/5"
              >
                <X className="h-5 w-5 text-tat-charcoal" />
              </button>
            </div>
            <Wizard
              state={state}
              setState={setState}
              step={step}
              setStep={setStep}
              onSubmit={handleSubmit}
              variant="modal"
            />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Quick destination search ─────────────────────────────────────────────
//
// Shipped alongside the multi-step Wizard so users with destination intent
// can skip the 5 steps and go straight to the filtered packages list. Type-
// ahead matches Sanity destinations first; popular fallback list seeds the
// dropdown when input is empty so the affordance reads as "browseable" not
// "search-empty".
interface QuickSearchProps {
  destinations: { slug: string; name: string; country?: string }[];
}

function HeroQuickSearch({ destinations }: QuickSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  // Pool used for matching. Sanity destinations take priority; if the catalog
  // is empty (e.g. dev without Sanity creds) fall back to popular slugs.
  const pool: { slug: string; name: string; country?: string }[] =
    destinations.length > 0
      ? destinations
      : POPULAR_DESTS.map((p) => ({ slug: p.slug, name: p.label }));

  const q = query.trim().toLowerCase();
  const matches = q
    ? pool
        .filter((d) =>
          d.name.toLowerCase().includes(q) ||
          d.slug.toLowerCase().includes(q) ||
          (d.country?.toLowerCase().includes(q) ?? false)
        )
        .slice(0, 6)
    : pool.slice(0, 6);

  const goToDestination = (slug: string) => {
    router.push(`/packages?destination=${encodeURIComponent(slug)}`);
  };

  const submit = () => {
    if (!q) return;
    if (matches.length > 0) {
      goToDestination(matches[Math.max(0, activeIdx)]?.slug ?? matches[0].slug);
      return;
    }
    // No catalog match — push the typed string as a slug attempt; the
    // packages list page falls through to "no results" cleanly.
    goToDestination(slugify(q));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(matches.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(-1, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  };

  const showDropdown = focused && matches.length > 0;

  return (
    <div className="relative z-20 mt-7 mx-auto w-full max-w-xl">
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-pill shadow-[0_18px_38px_-18px_rgba(0,0,0,0.45)] ring-1 ring-white/40 pl-5 pr-1.5 py-1.5">
        <Search className="h-4 w-4 text-tat-charcoal/55 shrink-0" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIdx(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // Delay so click events on dropdown items still register.
            setTimeout(() => setFocused(false), 120);
          }}
          onKeyDown={onKeyDown}
          placeholder="Already know? Search destination — Bali, Kerala, Maldives…"
          aria-label="Search destinations"
          className="flex-1 min-w-0 bg-transparent text-tat-charcoal placeholder:text-tat-charcoal/50 text-sm md:text-[14px] py-2 outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!q && matches.length === 0}
          className="hidden sm:inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-pill bg-tat-teal text-white text-sm font-semibold hover:bg-tat-teal-deep transition disabled:opacity-50"
        >
          Find trips
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={submit}
          aria-label="Find trips"
          disabled={!q && matches.length === 0}
          className="sm:hidden grid place-items-center h-10 w-10 rounded-pill bg-tat-teal text-white disabled:opacity-50"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {showDropdown && (
        <ul
          role="listbox"
          aria-label="Destination suggestions"
          className="absolute left-0 right-0 mt-2 bg-white rounded-card shadow-[0_24px_48px_-18px_rgba(0,0,0,0.45)] ring-1 ring-tat-charcoal/8 overflow-hidden text-left"
        >
          {!q && (
            <li className="px-4 pt-3 pb-1.5 text-[10px] uppercase tracking-[0.2em] text-tat-charcoal/45 font-semibold">
              Popular destinations
            </li>
          )}
          {matches.map((d, i) => (
            <li key={d.slug}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToDestination(d.slug)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                  i === activeIdx
                    ? "bg-tat-orange/10 text-tat-charcoal"
                    : "text-tat-charcoal/85 hover:bg-tat-charcoal/5"
                }`}
              >
                <MapPin className="h-3.5 w-3.5 text-tat-gold" aria-hidden />
                <span className="flex-1 text-left">{d.name}</span>
                {d.country && d.country !== d.name && (
                  <span className="text-[11px] text-tat-charcoal/45">{d.country}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
