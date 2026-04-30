"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Calendar, Users, Wallet, ArrowRight, MessageCircle, Star,
} from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

const HERO_BG =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=70";
const FOUNDER_NAME = "Akash Mishra";
const WHATSAPP_HREF =
  "https://wa.me/918115999588?text=" +
  encodeURIComponent("Hi Akash — I'd like help planning my trip.");

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
}

export default function Hero({
  trustStrip = "4.9★ on Google · 8,000+ travelers · 60+ destinations · Crafted since 2019",
}: Props = {}) {
  const { open: openPlanner } = useTripPlanner();
  const [destination, setDestination] = useState("");
  const [month, setMonth] = useState("");
  const [pax, setPax] = useState("");
  const [budget, setBudget] = useState("");

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
      className="relative isolate overflow-hidden bg-tat-charcoal"
    >
      {/* Background image */}
      <Image
        src={HERO_BG}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        quality={70}
        className="object-cover -z-10"
      />
      {/* Bottom-weighted gradient — keeps form legible */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,12,30,0.55) 0%, rgba(20,12,30,0.40) 35%, rgba(20,12,30,0.85) 100%)",
        }}
      />

      <div className="container-custom pt-14 pb-10 md:pt-24 md:pb-20">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-white/10 backdrop-blur-sm text-tat-orange-soft text-[11px] font-semibold uppercase tracking-[0.18em] border border-white/15">
            <Star className="h-3 w-3 fill-tat-orange-soft text-tat-orange-soft" />
            Trust and Trip · Crafted travel since 2019
          </p>
          <h1
            id="hero-h1"
            className="mt-4 font-display font-normal text-[34px] sm:text-[44px] md:text-[60px] lg:text-[68px] leading-[1.05] text-white text-balance"
          >
            Trips planned by a real human{" "}
            <em className="not-italic font-display italic text-tat-gold">
              in 24 hours.
            </em>
          </h1>
          <p className="mt-4 md:mt-5 text-[15px] md:text-lead text-white/85 max-w-2xl">
            Tell us your dates and what you love. {FOUNDER_NAME} drafts your
            itinerary himself — free until you&apos;re sure. No card, no commitment.
          </p>
        </div>

        {/* ─── Search form ───────────────────────────────────────── */}
        <form
          onSubmit={submit}
          className="mt-7 md:mt-9 bg-white/95 dark:bg-tat-charcoal/95 backdrop-blur-md rounded-2xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
        >
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
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 h-12 md:h-14 px-6 md:px-7 rounded-xl bg-tat-teal hover:bg-tat-teal-deep text-white font-semibold text-[15px] shadow-[0_12px_28px_-10px_rgba(14,124,123,0.7)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
              >
                Plan my trip
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Below-form trust line + WhatsApp escape */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white/85">
          <p className="inline-flex flex-wrap items-center gap-x-2 text-meta">
            <Star className="h-3.5 w-3.5 fill-tat-gold text-tat-gold" aria-hidden />
            <span className="font-semibold text-white">{trustStrip}</span>
          </p>
          <Link
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-meta font-semibold text-white/85 hover:text-tat-orange-soft underline-offset-4 hover:underline transition"
          >
            <MessageCircle className="h-4 w-4 text-whatsapp" />
            or chat on WhatsApp · {FOUNDER_NAME}
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
