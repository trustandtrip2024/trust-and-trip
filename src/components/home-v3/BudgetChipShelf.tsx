"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Wallet, Gem, Crown, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PackageCard, { type PackageCardProps } from "@/components/ui/PackageCard";

interface Props {
  packages: PackageCardProps[];
}

type BudgetId = "under-50k" | "50k-1L" | "1L-2L" | "2L-plus";

const CHIPS: {
  id: BudgetId;
  label: string;
  icon: LucideIcon;
  min: number;
  max: number;
  href: string;
}[] = [
  { id: "under-50k", label: "Under ₹50k",     icon: Wallet,   min: 0,      max: 50000,    href: "/packages?budget=under-50k" },
  { id: "50k-1L",    label: "₹50k – ₹1L",     icon: Sparkles, min: 50000,  max: 100000,   href: "/packages?budget=50k-1L" },
  { id: "1L-2L",     label: "₹1L – ₹2L",      icon: Gem,      min: 100000, max: 200000,   href: "/packages?budget=1L-2L" },
  { id: "2L-plus",   label: "₹2L+",           icon: Crown,    min: 200000, max: Infinity, href: "/packages?budget=2L-plus" },
];

export default function BudgetChipShelf({ packages }: Props) {
  const [active, setActive] = useState<BudgetId>("under-50k");
  const cfg = CHIPS.find((c) => c.id === active)!;

  const items = useMemo(() => {
    return packages
      .filter((p) => p.price >= cfg.min && p.price < cfg.max)
      .sort((a, b) => a.price - b.price)
      .slice(0, 10);
  }, [packages, cfg]);

  return (
    <section
      id="budget"
      aria-labelledby="budget-shelf-title"
      className="py-12 md:py-16 bg-tat-cream-warm/30 dark:bg-tat-charcoal/95 scroll-mt-44 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Pick your budget
            </p>
            <h2
              id="budget-shelf-title"
              className="mt-2 font-display font-normal text-[22px] md:text-[30px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Trips that fit{" "}
              <em className="not-italic font-display italic text-tat-gold">your budget.</em>
            </h2>
          </div>
          <Link
            href={cfg.href}
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            See all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Budget chips */}
        <div
          role="tablist"
          aria-label="Filter trips by budget"
          className="mt-5 -mx-5 px-5 lg:mx-0 lg:px-0 flex gap-2 overflow-x-auto no-scrollbar pb-1"
        >
          {CHIPS.map(({ id, label, icon: Icon }) => {
            const isActive = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(id)}
                className={[
                  "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-[12px] font-semibold transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2",
                  isActive
                    ? "bg-tat-charcoal text-tat-paper border border-tat-charcoal"
                    : "bg-white text-tat-charcoal/80 border border-tat-charcoal/15 hover:border-tat-gold/60 hover:text-tat-gold",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        {items.length > 0 ? (
          <div className="mt-5 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
            <ul className="flex gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0 items-stretch">
              {items.map((p) => (
                <li
                  key={`${active}-${p.href}`}
                  className="shrink-0 snap-start flex w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[24%]"
                >
                  <PackageCard {...p} density="compact" />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-tat-charcoal/15 p-6 text-center">
            <p className="text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70">
              No trips listed in this band yet. We can build one — drop us a budget.
            </p>
            <Link
              href={cfg.href}
              className="mt-3 inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
            >
              Tell us your budget
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="sm:hidden mt-5 text-center">
          <Link
            href={cfg.href}
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            See all in this band
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
