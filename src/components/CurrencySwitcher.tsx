"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";

interface Props {
  variant?: "navbar" | "footer";
}

export default function CurrencySwitcher({ variant = "navbar" }: Props) {
  const { currency, setCurrency, ready } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  if (!ready) return null;

  const trigger = variant === "navbar"
    ? "flex items-center gap-1.5 text-xs font-medium text-tat-charcoal/65 hover:text-tat-charcoal px-2 py-1 rounded-lg hover:bg-tat-charcoal/5 transition-colors"
    : "flex items-center gap-1.5 text-xs text-tat-paper/60 hover:text-tat-paper";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe2 className="h-3.5 w-3.5" />
        <span>{CURRENCIES[currency].symbol} {currency}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl border border-tat-charcoal/10 shadow-lg overflow-hidden z-50"
        >
          {(Object.values(CURRENCIES)).map((c) => {
            const active = c.code === currency;
            return (
              <button
                key={c.code}
                role="option"
                aria-selected={active}
                onClick={() => { setCurrency(c.code as CurrencyCode); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                  active ? "bg-tat-gold/10 text-tat-charcoal" : "text-tat-charcoal/75 hover:bg-tat-charcoal/5"
                }`}
              >
                <span className="font-mono w-7 text-center text-tat-charcoal/50 text-xs">{c.symbol}</span>
                <span className="font-medium">{c.code}</span>
                <span className="text-[11px] text-tat-charcoal/45 truncate">{c.label}</span>
                {active && <Check className="ml-auto h-3.5 w-3.5 text-tat-gold" />}
              </button>
            );
          })}
          <p className="text-[10px] text-tat-charcoal/40 px-3 py-2 border-t border-tat-charcoal/8 leading-relaxed">
            Charged in INR. Converted price for reference only.
          </p>
        </div>
      )}
    </div>
  );
}
