"use client";

import { ArrowUpDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  ariaLabel: string;
}

/**
 * Compact sort dropdown for chip shelves. Native `<select>` for free
 * accessibility (keyboard, screen reader, mobile native picker) — styled
 * to read as a chip, not a form control. The icon sits absolute behind a
 * transparent select; click target is the whole pill.
 */
export default function SortSelect({ value, onChange, options, ariaLabel }: Props) {
  const current = options.find((o) => o.value === value) ?? options[0];
  return (
    <div className="relative shrink-0">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 gap-1 text-tat-charcoal/60"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span className="text-[12px] font-semibold">{current.label}</span>
      </span>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none cursor-pointer h-8 pl-9 pr-3 rounded-pill border border-tat-charcoal/15 bg-white text-[12px] font-semibold text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2 hover:border-tat-gold/60"
        style={{ minWidth: `${current.label.length * 8 + 56}px` }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
