"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function DestinationsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-6">🗺️</p>
        <h2 className="font-display text-2xl font-medium text-tat-charcoal mb-3">
          Couldn&apos;t load destinations
        </h2>
        <p className="text-tat-charcoal/60 mb-8 leading-relaxed">
          We hit a brief snag fetching destination data. Please try again.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="btn-primary inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
          <Link href="/" className="btn-outline">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
