"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-tat-paper px-4">
      <div className="text-center max-w-md">
        <div className="font-display text-8xl text-tat-gold/30 font-medium leading-none mb-6 select-none">
          Oops.
        </div>
        <h1 className="font-display text-h2 font-medium text-tat-charcoal mb-4">
          Something went wrong.
        </h1>
        <p className="text-tat-charcoal/60 leading-relaxed mb-8">
          We hit an unexpected snag loading this page. This is likely temporary —
          please try again or head back home.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 btn-primary"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link href="/" className="inline-flex items-center gap-2 btn-outline">
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-[11px] text-tat-charcoal/30 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
