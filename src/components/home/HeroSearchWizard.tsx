"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search, Calendar, Users, User, Heart, Star, ArrowRight, ChevronLeft,
  Mountain, Sparkles, Briefcase, Crown, Sunset, Church, MapPin, X, Zap,
} from "lucide-react";

// Hero photo. Light, vibrant — a family enjoying a beachside luxury moment.
// Swap this URL to update the hero. The image is lazy-loaded by the
// browser image cache after the first paint; we use Next/Image with
// `priority` so it lands in the LCP.
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=2400&q=80";

// Optional looping background video — kept as enhancement only. If
// present the file is served from /public/video; otherwise the image
// stays as the hero. Disabled for now per the brand brief: the family
// photo is the hero, no motion required.
const ENABLE_HERO_VIDEO = false;
const VIDEO_MP4 = "/video/hero.mp4";
const VIDEO_WEBM = "/video/hero.webm";

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
          className="inline-flex items-center justify-center gap-2 h-12 px-5 min-w-[160px] rounded-pill font-semibold text-white bg-tat-burnt hover:bg-tat-burnt/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
}

export default function HeroSearchWizard({
  eyebrow = "Trust and Trip · Crafting Reliable Travel",
  titleStart = "Trips that feel",
  titleItalic = "made just for you.",
  lede = "A real planner. An itinerary in 24 hours. Free until you're sure.",
  trustStrip = "143+ trips planned this week · 4.9★ from 8,000+ travelers · 60+ destinations",
}: HeroProps) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(emptyState);
  const [step, setStep] = useState(0);

  const handleSubmit = () => {
    router.push(buildUrl(state));
  };

  return (
    <section
      id="hero-search"
      aria-label="Plan your trip"
      className="relative w-full min-h-[88vh] md:min-h-[88vh] flex items-center overflow-hidden bg-tat-charcoal"
    >
      <Image
        src={HERO_IMAGE_URL}
        alt="A family enjoying a sunny beachside luxury holiday — Trust and Trip hero"
        fill
        priority
        sizes="100vw"
        quality={80}
        className="object-cover"
      />
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
          {titleStart} <em className="not-italic font-display italic text-tat-burnt">{titleItalic}</em>
        </h1>
        <p className="mt-4 text-base md:text-lead text-white/85 max-w-2xl mx-auto text-balance [text-shadow:0_1px_12px_rgba(0,0,0,0.55)]">{lede}</p>

        {/* Pre-segmentation tiles — quick start by traveller persona */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-2">
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
