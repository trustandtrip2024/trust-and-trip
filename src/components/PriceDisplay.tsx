"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { convert, format, CURRENCIES } from "@/lib/currency";

interface Props {
  inr: number;          // canonical price in INR (whole rupees)
  className?: string;
  size?: "sm" | "md" | "lg";
  showSecondary?: boolean; // show converted price next to INR for non-INR users (default true)
}

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

// Renders the canonical INR price, plus an inline secondary readout in the
// visitor's chosen currency (e.g. "₹49,999 ≈ $599") when they've picked
// anything other than INR. Razorpay will still charge in INR — the secondary
// is read-only for visitor comfort.
export default function PriceDisplay({ inr, className = "", size = "md", showSecondary = true }: Props) {
  const { currency, rates, ready } = useCurrency();
  const sizeCls = SIZE[size];

  const inrText = format(inr, "INR");
  if (!ready || currency === "INR" || !showSecondary) {
    return <span className={`${sizeCls} ${className}`}>{inrText}</span>;
  }

  const converted = convert(inr, currency, rates);
  const secondary = format(converted, currency);

  return (
    <span className={`${sizeCls} ${className}`}>
      {inrText}
      <span className="text-ink/45 text-xs font-normal ml-1.5" aria-label={`Approximately ${secondary}`}>
        ≈ {secondary}
      </span>
      <span className="sr-only"> ({CURRENCIES[currency].label})</span>
    </span>
  );
}
