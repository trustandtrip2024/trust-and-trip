"use client";

import Link from "next/link";
import { MessageCircle, Phone, Sparkles } from "lucide-react";
import BookingDeposit from "./BookingDeposit";
import { captureIntent } from "@/lib/capture-intent";

interface Props {
  packageSlug: string;
  packageTitle: string;
  packagePrice: number;
  duration: string;
  destinationName?: string;
  travelType?: string;
  waNumber: string;
}

const QUICK_Q = ["What's included?", "Can I customise?", "Check availability", "Best price?"];

export default function PackageDetailCTAs({
  packageSlug, packageTitle, packagePrice, duration,
  destinationName, travelType, waNumber,
}: Props) {
  const baseMeta = {
    package_slug: packageSlug,
    package_title: packageTitle,
    destination: destinationName,
    travel_type: travelType,
  };

  const waBook = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi Trust and Trip! 🙏\n\nI'd like to book the *${packageTitle}* package (₹${packagePrice.toLocaleString("en-IN")}/person · ${duration}).\n\nPlease help me proceed.`
  )}`;

  return (
    <>
      {/* Primary CTA cluster */}
      <div className="space-y-2.5">
        <a
          href={waBook}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => captureIntent("book_now_click", { ...baseMeta, note: "Book This Journey (WhatsApp)" })}
          className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold/90 text-ink font-semibold py-3.5 rounded-xl transition-colors text-sm"
        >
          <MessageCircle className="h-4 w-4" />
          Book This Journey
        </a>

        <BookingDeposit
          packageSlug={packageSlug}
          packageTitle={packageTitle}
          packagePrice={packagePrice}
        />

        <Link
          href="/customize-trip"
          onClick={() => captureIntent("customize_click", { ...baseMeta, note: "Customize This Trip (package detail)" })}
          className="flex items-center justify-center gap-2 w-full bg-ink/5 hover:bg-ink/10 text-ink font-medium py-3.5 rounded-xl transition-colors text-sm border border-ink/10"
        >
          <Sparkles className="h-4 w-4 text-gold" />
          Customize This Trip
        </Link>

        <a
          href="tel:+918115999588"
          onClick={() => captureIntent("call_click", { ...baseMeta, note: "Call a Planner (package detail)" })}
          className="flex items-center justify-center gap-2 w-full border border-ink/10 hover:border-ink/25 text-ink/60 hover:text-ink font-medium py-3 rounded-xl transition-colors text-sm"
        >
          <Phone className="h-4 w-4" />
          Call a Planner
        </a>
      </div>
    </>
  );
}

export function PackageQuickQuestions({
  packageTitle, packageSlug, destinationName, travelType, waNumber,
}: Pick<Props, "packageTitle" | "packageSlug" | "destinationName" | "travelType" | "waNumber">) {
  const baseMeta = {
    package_slug: packageSlug,
    package_title: packageTitle,
    destination: destinationName,
    travel_type: travelType,
  };
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_Q.map((q) => (
        <a
          key={q}
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi! Regarding *${packageTitle}* — ${q}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => captureIntent("enquire_click", { ...baseMeta, note: `Quick question: ${q}` })}
          className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full border border-ink/12 text-ink/60 hover:border-[#25D366] hover:text-[#25D366] transition-colors"
        >
          <MessageCircle className="h-3 w-3" />{q}
        </a>
      ))}
    </div>
  );
}
