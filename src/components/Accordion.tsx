"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

export interface AccordionItem {
  title: string;
  content: string;
  subtitle?: string;
}

interface Props {
  items: AccordionItem[];
  defaultOpen?: number;
}

export default function Accordion({ items, defaultOpen = 0 }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);

  return (
    <div className="divide-y divide-tat-charcoal/10 border-y border-tat-charcoal/10">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-start gap-6 py-6 md:py-7 text-left group"
            >
              <span className="font-display text-sm text-tat-gold mt-1.5 tabular-nums tracking-wider shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                {item.subtitle && (
                  <p className="text-[10px] uppercase tracking-[0.25em] text-tat-charcoal/50 mb-1.5">
                    {item.subtitle}
                  </p>
                )}
                <h3 className="font-display text-xl md:text-2xl font-medium leading-tight text-tat-charcoal group-hover:text-tat-gold transition-colors">
                  {item.title}
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-tat-charcoal/70 leading-relaxed pr-6">
                        {item.content}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div
                className={`shrink-0 h-10 w-10 rounded-full border border-tat-charcoal/15 flex items-center justify-center transition-all duration-300 ${
                  isOpen ? "bg-tat-gold border-tat-gold rotate-45" : "group-hover:border-tat-charcoal"
                }`}
              >
                <Plus className={`h-4 w-4 transition-colors ${isOpen ? "text-tat-charcoal" : "text-tat-charcoal"}`} />
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
