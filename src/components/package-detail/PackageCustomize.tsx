"use client";

import { useEffect, useState } from "react";
import {
  CalendarPlus, Hotel, CalendarRange, MapPin, UserPlus, Sparkles,
  Loader2, CheckCircle2, ArrowRight, Phone,
} from "lucide-react";
import { submitLead } from "@/lib/submit-lead";

interface Props {
  packageTitle: string;
  packageSlug: string;
  destinationName: string;
}

type ChipKey =
  | "add-day"
  | "hotel-tier"
  | "month"
  | "pickup"
  | "private-guide"
  | "other";

const CHIPS: {
  key: ChipKey;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  prefill: (ctx: { title: string; destination: string }) => string;
}[] = [
  {
    key: "add-day",
    icon: CalendarPlus,
    label: "Add or remove a day",
    hint: "Stretch it longer, or trim a day off",
    prefill: ({ title }) =>
      `Hi — I like ${title} but I'd like to change the duration. Can a planner suggest a version with a different day count and updated price?`,
  },
  {
    key: "hotel-tier",
    icon: Hotel,
    label: "Switch hotel tier",
    hint: "Bump up to 5★ or trim to a smarter category",
    prefill: ({ title }) =>
      `Hi — for ${title}, I'd like a different hotel category (luxury / boutique / budget). Please share options + revised quote.`,
  },
  {
    key: "month",
    icon: CalendarRange,
    label: "Travel a different month",
    hint: "Want shoulder-season pricing or peak dates",
    prefill: ({ title, destination }) =>
      `Hi — when's the ideal month to travel ${destination} on ${title}, and what's the price difference vs the listed rate?`,
  },
  {
    key: "pickup",
    icon: MapPin,
    label: "Different pickup city",
    hint: "Ex Mumbai, Bangalore, Hyderabad, Chennai…",
    prefill: ({ title }) =>
      `Hi — I'd like ${title} starting from a different city than the one listed. Can you quote with my preferred pickup city?`,
  },
  {
    key: "private-guide",
    icon: UserPlus,
    label: "Add a private guide / driver",
    hint: "Solo car, English/Hindi guide, custom paced",
    prefill: ({ title, destination }) =>
      `Hi — for ${title}, I'd like a private vehicle and dedicated guide for ${destination}. Please share the upgrade cost.`,
  },
  {
    key: "other",
    icon: Sparkles,
    label: "Something else entirely",
    hint: "Plan a completely tailored version of this",
    prefill: ({ title }) =>
      `Hi — I'd like a fully customised version of ${title}. Open to a planner's call to discuss what I'm looking for.`,
  },
];

export default function PackageCustomize({ packageTitle, packageSlug, destinationName }: Props) {
  const [active, setActive] = useState<ChipKey | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onChip = (key: ChipKey, overrideMessage?: string) => {
    const chip = CHIPS.find((c) => c.key === key);
    if (!chip) return;
    setActive(key);
    setMessage(
      overrideMessage ?? chip.prefill({ title: packageTitle, destination: destinationName }),
    );
    setErr(null);
    setDone(false);
    setTimeout(() => {
      document.getElementById("customize-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 30);
  };

  // Listen for prefill events from sibling components (e.g. duration
  // variants chip row in the hero). Decouples those CTAs from this
  // section's state without prop-drilling.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ key?: ChipKey; message?: string }>).detail;
      if (!detail?.key) return;
      onChip(detail.key, detail.message);
    };
    window.addEventListener("tat:customize-prefill", handler);
    return () => window.removeEventListener("tat:customize-prefill", handler);
    // packageTitle / destinationName captured in onChip closure — re-bind
    // when they change so the right context is used.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageTitle, destinationName]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;
    setBusy(true);
    setErr(null);
    const res = await submitLead({
      name: name.trim(),
      email: "",
      phone: phone.trim(),
      package_title: packageTitle,
      package_slug: packageSlug,
      source: "package_customize",
      message: message.trim(),
      _hp: hp,
    } as Parameters<typeof submitLead>[0]).catch(() => ({ ok: false, error: "Network error" } as const));
    setBusy(false);
    if (res.ok) setDone(true);
    else setErr(res.error ?? "Could not submit. Please try again.");
  };

  return (
    <section id="customize" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <span className="eyebrow">Make it yours</span>
      <h2 className="heading-section mt-2 mb-2 text-balance">
        Anything you want to
        <span className="italic text-tat-gold font-light"> change?</span>
      </h2>
      <p className="text-tat-charcoal/65 dark:text-tat-paper/65 text-[14px] leading-relaxed max-w-[60ch] mb-6">
        Every package is a starting point — pick a tweak below and a planner will rework the
        itinerary, hotels, and quote around it. No commitment until you say go.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-6">
        {CHIPS.map((c) => {
          const Icon = c.icon;
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onChip(c.key)}
              aria-pressed={isActive}
              className={`group text-left rounded-2xl border px-4 py-3.5 transition-all flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2 ${
                isActive
                  ? "border-tat-gold bg-tat-gold/5"
                  : "border-tat-charcoal/10 hover:border-tat-charcoal/25 bg-white"
              }`}
            >
              <span
                className={`shrink-0 grid place-items-center h-9 w-9 rounded-full transition-colors ${
                  isActive ? "bg-tat-gold text-white" : "bg-tat-gold/10 text-tat-gold"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-tat-charcoal leading-tight">
                  {c.label}
                </span>
                <span className="block text-[12px] text-tat-charcoal/55 mt-0.5 leading-snug">
                  {c.hint}
                </span>
              </span>
              <ArrowRight
                className={`h-4 w-4 mt-1 shrink-0 transition-all ${
                  isActive
                    ? "text-tat-gold translate-x-0.5"
                    : "text-tat-charcoal/25 group-hover:text-tat-charcoal/50 group-hover:translate-x-0.5"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Inline request form — only shown after a chip is picked. */}
      {active && (
        <div
          id="customize-form"
          className="rounded-2xl border border-tat-charcoal/10 bg-tat-cream/40 p-5 md:p-6"
        >
          {done ? (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-tat-success-fg shrink-0" />
              <div>
                <p className="font-medium text-tat-success-fg">
                  Got it — a planner will call you within working hours.
                </p>
                <p className="text-xs text-tat-success-fg/80 mt-0.5">
                  We'll come back with a reworked itinerary + revised quote tailored to your tweak.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input
                type="text"
                name="_hp"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
              />
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-tat-charcoal/55 font-medium mb-1">
                  Your tweak
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-white border border-tat-charcoal/12 rounded-xl px-3.5 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-tat-gold/40"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-tat-charcoal/55 font-medium mb-1">
                    Full name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your full name"
                    className="w-full bg-white border border-tat-charcoal/12 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tat-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-tat-charcoal/55 font-medium mb-1">
                    Mobile no.
                  </label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 rounded-xl bg-tat-charcoal/[0.04] border border-tat-charcoal/10 text-sm text-tat-charcoal/70 font-medium">
                      🇮🇳 +91
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      type="tel"
                      inputMode="tel"
                      placeholder="98765 43210"
                      className="flex-1 bg-white border border-tat-charcoal/12 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tat-gold/40"
                    />
                  </div>
                </div>
              </div>
              {err && <p className="text-xs text-tat-danger-fg">{err}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-tat-teal text-white font-semibold py-3 px-6 rounded-xl hover:bg-tat-teal-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Send to a planner
                  </>
                )}
              </button>
              <p className="text-[11px] text-tat-charcoal/45">
                No card needed. Reply by call or WhatsApp within working hours (8 AM – 10 PM IST).
              </p>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
