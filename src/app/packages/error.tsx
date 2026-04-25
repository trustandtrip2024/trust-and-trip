"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function PackagesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-6">✈️</p>
        <h2 className="font-display text-2xl font-medium text-tat-charcoal mb-3">
          Couldn&apos;t load packages right now
        </h2>
        <p className="text-tat-charcoal/60 mb-8 leading-relaxed">
          Our packages are loading from the cloud and hit a brief snag.
          Tap retry or contact us directly.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="btn-primary inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
          <Link href="/contact" className="btn-outline">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
