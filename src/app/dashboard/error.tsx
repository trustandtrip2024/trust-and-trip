"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 p-6 md:p-8 shadow-soft">
        <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h1 className="font-display text-xl md:text-2xl font-medium text-ink mb-2">
          Dashboard couldn&apos;t load
        </h1>
        <p className="text-sm text-ink/60 leading-relaxed mb-4">
          Something went wrong while loading this page. You can try again, or head back home.
        </p>

        {error.message && (
          <div className="mb-5 p-3 rounded-xl bg-red-50/60 border border-red-100">
            <p className="text-[11px] uppercase tracking-wider text-red-500/70 font-medium mb-1">
              Error details
            </p>
            <p className="text-xs text-red-700 font-mono break-words leading-relaxed">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink text-cream hover:bg-gold hover:text-ink rounded-xl text-sm font-semibold transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-ink/15 text-ink/70 hover:border-ink/30 rounded-xl text-sm font-medium transition-all"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-5 text-[11px] text-ink/30 font-mono">
            Ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
