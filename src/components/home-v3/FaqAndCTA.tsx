"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Is the itinerary really free until I book?",
    a: "Yes. A real planner builds your full itinerary — destinations, hotels, activities, day-by-day flow, line-item pricing — and sends it within 24 hours. You pay only when you say yes. If our plan doesn't fit, walk away with zero charge.",
  },
  {
    q: "How much do I pay upfront, and when?",
    a: "30% deposit (minimum ₹5,000) holds your booking and locks hotel rates. The balance is due 21 days before departure for international trips, 7 days for domestic. Razorpay handles all payments — UPI, cards, net banking, EMI options available.",
  },
  {
    q: "Can I change dates or cancel after booking?",
    a: "Date changes are free up to 30 days before departure (subject to airline/hotel availability). Cancellations are governed by supplier terms — typically 100% refund up to 45 days, sliding scale closer in. Full policy is shared in writing before you pay anything.",
  },
  {
    q: "Do you handle visas, insurance, and forex?",
    a: "Visa: yes — full document checklist, application support, embassy appointments where needed. Insurance: bundled by default with every international trip. Forex: we partner with BookMyForex for the best rates, delivered home.",
  },
  {
    q: "Who's actually planning my trip?",
    a: "One named planner from our team — not a chatbot, not a call-center rotation. Same person from quote to homecoming. You'll have their direct WhatsApp.",
  },
  {
    q: "What if something goes wrong on the trip?",
    a: "24/7 emergency line manned by a real human. Local on-ground partners in 60+ destinations. We've handled flight cancellations, hospital admissions, lost passports — usually with the traveler hardly noticing.",
  },
  {
    q: "Do you do pilgrim trips with elderly parents?",
    a: "Yes — Char Dham, Vaishno Devi, Tirupati, Amarnath, and more. We arrange VIP darshan slots, helicopter transfers, doctor-on-call, and hotels within walking distance of temples. Senior-friendly pace built into every yatra.",
  },
  {
    q: "Can you match a quote I got from another agent?",
    a: "If the inclusions are genuinely the same — yes, we'll match or beat. We'll also show you in writing where the other quote may be hiding costs (room category, flight class, exclusions). Honest pricing means no surprises.",
  },
];

export default function FaqAndCTA() {
  const [open, setOpen] = useState<number>(0);
  const { open: openPlanner } = useTripPlanner();

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="py-14 md:py-20 bg-tat-paper dark:bg-tat-charcoal scroll-mt-44 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 md:gap-14">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Common questions
            </p>
            <h2
              id="faq-title"
              className="mt-2 font-display font-normal text-[26px] md:text-[36px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Everything you&apos;d ask{" "}
              <em className="not-italic font-display italic text-tat-gold">before saying yes.</em>
            </h2>
            <p className="mt-3 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70">
              Free itinerary, payment terms, change policy, refunds. Straight answers — no fine print buried later.
            </p>

            <div className="mt-6 md:mt-8 rounded-2xl bg-gradient-to-br from-tat-gold/10 to-tat-orange/10 dark:from-tat-gold/15 dark:to-tat-orange/15 p-5 md:p-6 ring-1 ring-tat-gold/20">
              <div className="flex items-center gap-2 text-tat-gold">
                <Sparkles className="h-4 w-4" />
                <p className="text-[11px] uppercase tracking-wider font-semibold">
                  Free itinerary in 24 hrs
                </p>
              </div>
              <h3 className="mt-2 font-display font-medium text-[20px] md:text-[22px] leading-tight text-tat-charcoal dark:text-tat-paper">
                Tell us where you want to go.
              </h3>
              <p className="mt-2 text-[13px] text-tat-charcoal/70 dark:text-tat-paper/70">
                A real planner reads your brief, builds your trip, sends it back within a day. No charge until you book.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openPlanner()}
                  className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-tat-orange text-white text-[14px] font-semibold shadow-sm hover:bg-tat-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
                >
                  Plan my trip
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip%20%E2%80%94%20I%27d%20like%20help%20planning%20my%20trip."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-white dark:bg-tat-charcoal text-tat-charcoal dark:text-tat-paper text-[14px] font-semibold ring-1 ring-tat-charcoal/15 dark:ring-white/15 hover:ring-tat-charcoal/30"
                >
                  <MessageCircle className="h-4 w-4 text-tat-teal" />
                  WhatsApp
                </a>
              </div>
            </div>

            <p className="mt-4 text-[12px] text-tat-charcoal/55 dark:text-tat-paper/55">
              Still unsure?{" "}
              <Link href="/about" className="text-tat-gold font-semibold hover:underline underline-offset-4">
                Meet the team
              </Link>
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {FAQS.map((f, i) => (
              <FaqRow
                key={i}
                item={f}
                isOpen={open === i}
                onToggle={() => setOpen(open === i ? -1 : i)}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FaqRow({
  item, isOpen, onToggle,
}: {
  item: FaqItem; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <li className="rounded-xl bg-white dark:bg-white/[0.03] ring-1 ring-tat-charcoal/10 dark:ring-white/10 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 px-4 md:px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-inset"
      >
        <span className="font-display font-medium text-[15px] md:text-[16px] text-tat-charcoal dark:text-tat-paper leading-snug">
          {item.q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-tat-gold transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="px-4 md:px-5 pb-4 text-[13px] md:text-[14px] leading-relaxed text-tat-charcoal/75 dark:text-tat-paper/75">
            {item.a}
          </p>
        </div>
      </div>
    </li>
  );
}
