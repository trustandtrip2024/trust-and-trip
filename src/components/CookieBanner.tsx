"use client";

import { useState } from "react";
import Link from "next/link";
import { Cookie, X, ChevronDown, ChevronUp } from "lucide-react";
import { useCookieConsent } from "@/context/CookieConsentContext";

export default function CookieBanner() {
  const { hasDecided, initialized, acceptAll, rejectAll } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);

  if (!initialized || hasDecided) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      className="fixed bottom-0 inset-x-0 z-[9999] pointer-events-none flex items-end justify-center p-4 md:p-6"
    >
      <div className="pointer-events-auto w-full max-w-2xl bg-ink text-cream rounded-2xl shadow-2xl border border-cream/10 overflow-hidden">
        {/* Main row */}
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-3 mb-4">
            <Cookie className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-cream mb-1">We use cookies</p>
              <p className="text-xs text-cream/60 leading-relaxed">
                We use cookies to personalise your experience, measure site performance, and show
                relevant ads. Read our{" "}
                <Link href="/privacy-policy" className="text-gold underline underline-offset-2 hover:no-underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Details toggle */}
          <button
            onClick={() => setShowDetails((s) => !s)}
            className="flex items-center gap-1 text-[11px] text-cream/40 hover:text-cream/70 transition-colors mb-4"
          >
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showDetails ? "Hide details" : "Cookie details"}
          </button>

          {/* Expanded details */}
          {showDetails && (
            <div className="mb-4 space-y-2 text-[11px] text-cream/50 border-t border-cream/10 pt-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-cream/80 font-medium mb-0.5">Necessary</p>
                  <p>Session management and site functionality. Always active.</p>
                </div>
                <span className="text-[10px] bg-cream/10 rounded-full px-2 py-0.5 shrink-0">Always on</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-cream/80 font-medium mb-0.5">Analytics</p>
                  <p>Google Analytics — helps us understand how visitors use the site.</p>
                </div>
                <span className="text-[10px] bg-cream/10 rounded-full px-2 py-0.5 shrink-0">Optional</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-cream/80 font-medium mb-0.5">Marketing</p>
                  <p>Meta Pixel — lets us show you relevant travel deals on Facebook & Instagram.</p>
                </div>
                <span className="text-[10px] bg-cream/10 rounded-full px-2 py-0.5 shrink-0">Optional</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={rejectAll}
              className="flex-1 text-sm font-medium px-4 py-2.5 rounded-xl border border-cream/20 text-cream/70 hover:text-cream hover:border-cream/40 transition-colors"
            >
              Necessary only
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 text-sm font-medium px-4 py-2.5 rounded-xl bg-gold text-ink hover:bg-gold/90 transition-colors"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
