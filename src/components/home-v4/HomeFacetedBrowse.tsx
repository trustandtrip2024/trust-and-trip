"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Users, Wallet, ArrowRight, type LucideIcon } from "lucide-react";
import type { Destination } from "@/lib/data";

interface Props {
  destinations: Destination[];
}

const MONTHS = [
  "Flexible","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
];
const TRAVEL_TYPES = ["Couple", "Family", "Group", "Solo"] as const;
const BUDGETS = [
  { id: "",         label: "Any" },
  { id: "<50k",     label: "Under ₹50k" },
  { id: "50k-1L",   label: "₹50k–₹1L" },
  { id: "1L-2L",    label: "₹1L–₹2L" },
  { id: "2L+",      label: "₹2L+" },
];

/**
 * Single faceted-browse block — replaces BudgetChipShelf, VisaFreeShelf,
 * MayMixedChipShelf, LiveDeals, and the bulk of BrowseByStyle. Four
 * inputs (destination, month, who, budget) submit straight to the
 * /packages catalogue with the matching query params. Reuses every
 * filter PackagesClient.tsx already honours — no new endpoint.
 *
 * Replaces ~600 lines of redundant chip-rail code with one form.
 */
export default function HomeFacetedBrowse({ destinations }: Props) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [month, setMonth] = useState("");
  const [travelType, setTravelType] = useState<(typeof TRAVEL_TYPES)[number] | "">("");
  const [budget, setBudget] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (month && month !== "Flexible") params.set("month", month);
    if (travelType) params.set("type", travelType);
    if (budget) params.set("budget", budget);
    router.push(`/packages${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section
      aria-labelledby="faceted-browse-heading"
      className="bg-tat-paper border-y border-tat-charcoal/8"
    >
      <div className="container-custom py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Find your trip
            </p>
            <h2
              id="faceted-browse-heading"
              className="mt-1.5 font-display text-[24px] md:text-[30px] leading-tight text-tat-charcoal"
            >
              Pick four things, see real options.
            </h2>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-2 md:gap-3 rounded-2xl bg-white border border-tat-charcoal/12 p-2 md:p-2.5 shadow-soft"
        >
          <Field label="Where" icon={Search}>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              aria-label="Destination"
              className="w-full bg-transparent text-[14px] text-tat-charcoal focus:outline-none cursor-pointer"
            >
              <option value="">Any destination</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="When" icon={Calendar}>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              aria-label="Travel month"
              className="w-full bg-transparent text-[14px] text-tat-charcoal focus:outline-none cursor-pointer"
            >
              <option value="">Pick month</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Who" icon={Users}>
            <select
              value={travelType}
              onChange={(e) => setTravelType(e.target.value as (typeof TRAVEL_TYPES)[number] | "")}
              aria-label="Travelers"
              className="w-full bg-transparent text-[14px] text-tat-charcoal focus:outline-none cursor-pointer"
            >
              <option value="">Any group</option>
              {TRAVEL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Budget" icon={Wallet}>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              aria-label="Budget per person"
              className="w-full bg-transparent text-[14px] text-tat-charcoal focus:outline-none cursor-pointer"
            >
              {BUDGETS.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </Field>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-tat-charcoal text-white font-semibold text-[14px] hover:bg-tat-charcoal/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
          >
            Show trips
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label, icon: Icon, children,
}: {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <label className="block px-3 py-2.5 rounded-xl bg-tat-charcoal/[0.03] border border-transparent hover:border-tat-charcoal/8 cursor-pointer transition-colors">
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-tat-charcoal/55">
        <Icon className="h-3 w-3 text-tat-gold" aria-hidden />
        {label}
      </span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}
