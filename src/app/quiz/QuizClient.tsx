"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, Heart, Mountain, Building2, Church, Sun, Users, User, MessageCircle, RotateCcw, Mail, Loader2, CheckCircle2 } from "lucide-react";
import type { Package } from "@/lib/data";
import {
  scorePackages,
  type QuizAnswers,
  type QuizTravelType,
  type QuizVibe,
  type QuizDuration,
  type QuizBudget,
} from "@/lib/quiz-match";
import { submitLead } from "@/lib/submit-lead";
import { analytics } from "@/lib/analytics";

type StepKey = "travelType" | "vibe" | "duration" | "budget" | "results";

const STEPS: StepKey[] = ["travelType", "vibe", "duration", "budget", "results"];

const TRAVEL_OPTIONS: { id: QuizTravelType; label: string; icon: typeof Heart; sub: string }[] = [
  { id: "Couple",  label: "With my partner",   icon: Heart,    sub: "Honeymoon, anniversary, escape" },
  { id: "Family",  label: "Family + kids",     icon: Users,    sub: "Toddler to grandparent" },
  { id: "Solo",    label: "Solo",              icon: User,     sub: "My pace, my call" },
  { id: "Group",   label: "Group of friends",  icon: Users,    sub: "5+ travellers" },
  { id: "Pilgrim", label: "Pilgrimage / yatra",icon: Church,   sub: "Char Dham, Vaishno Devi…" },
];

const VIBE_OPTIONS: { id: QuizVibe; label: string; icon: typeof Sun; sub: string }[] = [
  { id: "Beach",     label: "Beaches + water",    icon: Sun,        sub: "Bali, Maldives, Kerala" },
  { id: "Mountain",  label: "Mountains + cool",   icon: Mountain,   sub: "Switzerland, Spiti, Kashmir" },
  { id: "Culture",   label: "Culture + history",  icon: Sparkles,   sub: "Rajasthan, Japan, Vietnam" },
  { id: "Spiritual", label: "Spiritual + temples",icon: Church,     sub: "Yatra, Varanasi, Ayodhya" },
  { id: "City",      label: "Cities + skylines",  icon: Building2,  sub: "Dubai, Singapore, London" },
];

const DURATION_OPTIONS: { id: QuizDuration; label: string; sub: string }[] = [
  { id: "3-5", label: "3 – 5 days",  sub: "Long weekend feel" },
  { id: "6-9", label: "6 – 9 days",  sub: "Most popular window" },
  { id: "10+", label: "10+ days",    sub: "Slow, deep, full immersion" },
];

const BUDGET_OPTIONS: { id: QuizBudget; label: string; sub: string }[] = [
  { id: "lt50k",  label: "Under ₹50,000",     sub: "per person" },
  { id: "50-100k",label: "₹50,000 – ₹1,00,000", sub: "per person" },
  { id: "100k+",  label: "₹1,00,000+",        sub: "per person, premium" },
];

interface PartialAnswers {
  travelType?: QuizTravelType;
  vibe?: QuizVibe;
  duration?: QuizDuration;
  budget?: QuizBudget;
}

function isComplete(a: PartialAnswers): a is QuizAnswers {
  return !!a.travelType && !!a.vibe && !!a.duration && !!a.budget;
}

export default function QuizClient({ packages }: { packages: Package[] }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({});

  const step = STEPS[stepIdx];
  const progress = Math.round(((stepIdx) / (STEPS.length - 1)) * 100);

  const top3 = useMemo(() => {
    if (!isComplete(answers)) return [];
    return scorePackages(packages, answers);
  }, [answers, packages]);

  // Fire quiz_start once on first mount.
  useEffect(() => {
    analytics.quizStart();
  }, []);

  // Fire quiz_complete the first time the user lands on results.
  useEffect(() => {
    if (step === "results" && isComplete(answers)) {
      analytics.quizComplete({
        travelType: answers.travelType,
        vibe: answers.vibe,
        duration: answers.duration,
        budget: answers.budget,
        topMatchSlug: top3[0]?.pkg.slug,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function pick<K extends keyof PartialAnswers>(key: K, value: NonNullable<PartialAnswers[K]>) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    analytics.quizStep(String(key), String(value));
    // Auto-advance after each pick so the quiz feels snappy.
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function back() {
    setStepIdx((i) => Math.max(i - 1, 0));
  }

  function reset() {
    setAnswers({});
    setStepIdx(0);
  }

  return (
    <main className="min-h-screen bg-tat-paper">
      <section className="pt-24 md:pt-28 pb-10 border-b border-tat-charcoal/10">
        <div className="container-custom max-w-3xl">
          <p className="tt-eyebrow">4 questions · 60 seconds</p>
          <h1 className="mt-3 font-display text-display-lg leading-[1.05] text-tat-charcoal text-balance">
            Find the trip that
            <span className="italic text-tat-gold font-light"> fits you.</span>
          </h1>
          <p className="mt-4 text-tat-charcoal/70 max-w-xl leading-relaxed">
            Tell us a bit about you and we&rsquo;ll match the 3 packages most likely to feel right —
            from 200+ curated trips across 60+ destinations.
          </p>

          <div className="mt-8 h-1.5 w-full rounded-full bg-tat-charcoal/10 overflow-hidden">
            <div
              className="h-full bg-tat-gold transition-all duration-300"
              style={{ width: `${progress}%` }}
              aria-hidden
            />
          </div>
          <p className="mt-2 text-meta text-tat-charcoal/55">
            Step {Math.min(stepIdx + 1, STEPS.length - 1)} of {STEPS.length - 1}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-custom max-w-4xl">
          {step === "travelType" && (
            <StepCard title="Who are you traveling with?" subtitle="Pick the closest fit — we'll personalise from there.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRAVEL_OPTIONS.map(({ id, label, sub, icon: Icon }) => (
                  <OptionTile
                    key={id}
                    selected={answers.travelType === id}
                    onClick={() => pick("travelType", id)}
                    icon={<Icon className="h-5 w-5" />}
                    label={label}
                    sub={sub}
                  />
                ))}
              </div>
            </StepCard>
          )}

          {step === "vibe" && (
            <StepCard title="What kind of trip pulls you?" subtitle="Mood matters more than place. Pick the one that excites.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VIBE_OPTIONS.map(({ id, label, sub, icon: Icon }) => (
                  <OptionTile
                    key={id}
                    selected={answers.vibe === id}
                    onClick={() => pick("vibe", id)}
                    icon={<Icon className="h-5 w-5" />}
                    label={label}
                    sub={sub}
                  />
                ))}
              </div>
            </StepCard>
          )}

          {step === "duration" && (
            <StepCard title="How many days do you have?" subtitle="Be honest — we'll plan a richer trip with the right amount of time.">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DURATION_OPTIONS.map(({ id, label, sub }) => (
                  <OptionTile
                    key={id}
                    selected={answers.duration === id}
                    onClick={() => pick("duration", id)}
                    label={label}
                    sub={sub}
                  />
                ))}
              </div>
            </StepCard>
          )}

          {step === "budget" && (
            <StepCard title="Comfortable budget per person?" subtitle="Quoted in INR. International flights are usually ~₹30k–60k extra and we quote them separately.">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUDGET_OPTIONS.map(({ id, label, sub }) => (
                  <OptionTile
                    key={id}
                    selected={answers.budget === id}
                    onClick={() => pick("budget", id)}
                    label={label}
                    sub={sub}
                  />
                ))}
              </div>
            </StepCard>
          )}

          {step === "results" && isComplete(answers) && (
            <Results answers={answers} top3={top3} onReset={reset} />
          )}

          {step !== "travelType" && step !== "results" && (
            <div className="mt-8">
              <button
                type="button"
                onClick={back}
                className="inline-flex items-center gap-1.5 text-body-sm font-medium text-tat-charcoal/65 hover:text-tat-charcoal"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StepCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-h2 font-medium text-tat-charcoal text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-tat-charcoal/65 leading-relaxed max-w-xl">{subtitle}</p>
      )}
      <div className="mt-7">{children}</div>
    </div>
  );
}

function OptionTile({
  selected,
  onClick,
  icon,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group text-left rounded-card px-5 py-4 md:py-5 border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold/60 focus-visible:ring-offset-2 ${
        selected
          ? "border-tat-gold bg-tat-gold/8 ring-1 ring-tat-gold/40"
          : "border-tat-charcoal/12 bg-white hover:border-tat-charcoal/30 hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span
            className={`shrink-0 grid place-items-center h-9 w-9 rounded-full ${
              selected ? "bg-tat-gold text-tat-paper" : "bg-tat-cream-warm/60 text-tat-gold"
            } transition-colors`}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-display text-h4 font-medium text-tat-charcoal leading-tight">
            {label}
          </p>
          {sub && <p className="mt-1 text-body-sm text-tat-charcoal/60">{sub}</p>}
        </div>
      </div>
    </button>
  );
}

function Results({
  answers,
  top3,
  onReset,
}: {
  answers: QuizAnswers;
  top3: ReturnType<typeof scorePackages>;
  onReset: () => void;
}) {
  const summaryParts = [
    answers.travelType,
    answers.vibe,
    answers.duration === "10+" ? "10+ days" : `${answers.duration} days`,
    answers.budget === "lt50k" ? "under ₹50k" : answers.budget === "50-100k" ? "₹50k–₹1L" : "₹1L+",
  ];

  return (
    <div>
      <p className="tt-eyebrow text-tat-gold">Your top 3 matches</p>
      <h2 className="mt-2 font-display text-display-md font-medium text-tat-charcoal leading-tight text-balance">
        For a <span className="italic text-tat-gold">{summaryParts[0].toLowerCase()} · {summaryParts[1].toLowerCase()}</span> trip,
        {" "}{summaryParts[2]}, {summaryParts[3]} —
      </h2>
      <p className="mt-2 text-tat-charcoal/65 leading-relaxed max-w-xl">
        These are the closest fits from our planner-curated catalogue. Tap any to see the full
        itinerary, or tell us your dates and we&rsquo;ll customise within the hour.
      </p>

      {top3.length > 0 ? (
        <ul className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-5">
          {top3.map(({ pkg, score }) => (
            <li
              key={pkg.slug}
              className="group rounded-card overflow-hidden bg-white border border-tat-charcoal/10 shadow-card hover:shadow-rail transition-all hover:-translate-y-0.5"
            >
              <Link
                href={`/packages/${pkg.slug}`}
                className="block"
                onClick={() => analytics.quizMatchClick(pkg.slug, score)}
              >
                <div className="relative aspect-[4/3] bg-tat-charcoal/10">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-tat-gold text-tat-paper text-[10px] uppercase tracking-[0.18em] font-bold px-2.5 py-1 rounded-pill">
                    Match {score}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-tag uppercase text-tat-slate">{pkg.duration} · {pkg.destinationName}</p>
                  <h3 className="mt-1.5 font-display text-h3 font-medium text-tat-charcoal leading-snug text-balance line-clamp-2">
                    {pkg.title}
                  </h3>
                  <p className="mt-3 font-display text-h3 text-tat-charcoal">
                    ₹{pkg.price.toLocaleString("en-IN")}
                    <span className="ml-1 text-body-sm text-tat-charcoal/55 font-normal">/ person</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-9 rounded-card border border-tat-charcoal/12 bg-white p-8 text-center">
          <p className="font-display text-h3 text-tat-charcoal">No exact matches yet — but we can build it.</p>
          <p className="mt-2 text-tat-charcoal/65 max-w-md mx-auto">
            That combination is rare. Tell us your dates and we&rsquo;ll custom-build a trip that
            fits — usually within the hour.
          </p>
        </div>
      )}

      <QuizLeadCapture answers={answers} top3={top3} />

      <div className="mt-12 rounded-card bg-tat-charcoal text-tat-paper p-7 md:p-9 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <p className="tt-eyebrow text-tat-gold">Next step</p>
          <p className="mt-2 font-display text-h3 text-tat-paper text-balance">
            Want a real planner to run with this?
          </p>
          <p className="mt-2 text-tat-paper/75 max-w-md">
            Get a free, customised draft itinerary in 60 seconds — based on your answers above.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/customize-trip?type=${answers.travelType}&vibe=${answers.vibe}&duration=${answers.duration}&budget=${answers.budget}`}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-pill bg-tat-gold text-tat-charcoal font-semibold hover:bg-tat-gold/90 transition"
          >
            Get my custom draft
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={`/api/wa/click?src=quiz_result&msg=${encodeURIComponent(
              `Hi! I just took the trip-finder quiz. I'm a ${answers.travelType.toLowerCase()} traveller looking for a ${answers.vibe.toLowerCase()} trip, ${answers.duration === "10+" ? "10+ days" : answers.duration + " days"}, ${answers.budget === "lt50k" ? "under ₹50k" : answers.budget === "50-100k" ? "₹50k–₹1L" : "₹1L+"} per person. Can you help?`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-pill bg-whatsapp text-white font-semibold hover:bg-whatsapp-hover transition"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-7 inline-flex items-center gap-1.5 text-body-sm font-medium text-tat-charcoal/65 hover:text-tat-charcoal"
      >
        <RotateCcw className="h-4 w-4" />
        Take quiz again
      </button>
    </div>
  );
}

function QuizLeadCapture({
  answers,
  top3,
}: {
  answers: QuizAnswers;
  top3: ReturnType<typeof scorePackages>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await submitLead({
      name: name.trim() || "Quiz visitor",
      email: email.trim(),
      phone: phone.trim(),
      source: "quiz",
      travel_type: answers.travelType,
      destination: top3[0]?.pkg.destinationName,
      budget: answers.budget,
      message: `Quiz answers — ${answers.travelType} · ${answers.vibe} · ${answers.duration} · ${answers.budget}. Top match: ${top3[0]?.pkg.title ?? "n/a"} (score ${top3[0]?.score ?? 0}).`,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Could not save right now. Try again?");
      return;
    }
    analytics.quizLeadSubmit();
    setDone(true);
  }

  if (done) {
    return (
      <div className="mt-12 rounded-card bg-tat-success-bg border border-tat-success-fg/30 p-7 md:p-9">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-tat-success-fg shrink-0 mt-0.5" />
          <div>
            <p className="font-display text-h3 text-tat-success-fg">Got it. We&rsquo;ll be in touch.</p>
            <p className="mt-2 text-tat-charcoal/75 leading-relaxed max-w-xl">
              A planner will message you within {new Date().getHours() >= 10 && new Date().getHours() < 20 ? "5 minutes" : "30 minutes"} with a draft itinerary based
              on your quiz answers. While you wait, take a look at the matched packages above
              — full itineraries are on each detail page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-12 rounded-card bg-white border border-tat-charcoal/12 shadow-card p-6 md:p-8"
      aria-label="Get a personalised draft itinerary"
    >
      <div className="flex items-start gap-3">
        <span className="grid place-items-center h-10 w-10 rounded-full bg-tat-gold/15 text-tat-gold shrink-0">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <p className="tt-eyebrow text-tat-gold">Email me the draft</p>
          <h3 className="mt-1 font-display text-h3 font-medium text-tat-charcoal text-balance">
            Skip the back-and-forth. We&rsquo;ll email you a custom draft itinerary based on your quiz answers.
          </h3>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          required
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 px-4 rounded-md border border-tat-charcoal/15 bg-white focus:border-tat-gold focus:ring-2 focus:ring-tat-gold/30 outline-none text-body-sm"
        />
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 px-4 rounded-md border border-tat-charcoal/15 bg-white focus:border-tat-gold focus:ring-2 focus:ring-tat-gold/30 outline-none text-body-sm"
        />
        <input
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="Phone (with country code)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-12 px-4 rounded-md border border-tat-charcoal/15 bg-white focus:border-tat-gold focus:ring-2 focus:ring-tat-gold/30 outline-none text-body-sm"
        />
      </div>

      {error && (
        <p className="mt-3 text-body-sm text-tat-danger-fg" role="alert">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 h-12 px-6 rounded-pill bg-tat-charcoal text-tat-paper font-semibold hover:bg-tat-charcoal/90 disabled:opacity-60 transition"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {submitting ? "Sending…" : "Email me my draft"}
        </button>
        <p className="text-meta text-tat-charcoal/55">
          We don&rsquo;t share your details. One email + a WhatsApp follow-up. Unsubscribe anytime.
        </p>
      </div>
    </form>
  );
}
