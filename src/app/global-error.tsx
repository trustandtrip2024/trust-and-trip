"use client";

import { useEffect } from "react";

// Catches errors thrown inside the root layout (providers, fonts, head),
// which app/error.tsx cannot catch. Must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  // Inline styles only — this renders outside the root layout so the
  // Tailwind stylesheet hasn't loaded. Hex literals mirror tat tokens:
  //   PAPER    = #FBF7F1 (tat-paper)
  //   CHARCOAL = #2A2A2A (tat-charcoal)
  //   TEAL     = #0E7C7B (tat-teal — primary CTA)
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#FBF7F1", color: "#2A2A2A" }}>
        <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ maxWidth: 520, textAlign: "center" }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Something went wrong.</h1>
            <p style={{ fontSize: "0.95rem", opacity: 0.7, marginBottom: 20 }}>
              A page-level error occurred. Try refreshing or going back home.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{ padding: "0.65rem 1.25rem", background: "#0E7C7B", color: "#FBF7F1", border: 0, borderRadius: 10, cursor: "pointer", fontWeight: 600 }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{ padding: "0.65rem 1.25rem", background: "transparent", color: "#2A2A2A", border: "1px solid rgba(42,42,42,0.2)", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}
              >
                Go home
              </a>
            </div>
            {error.digest && (
              <p style={{ marginTop: 22, fontSize: "0.7rem", opacity: 0.4, fontFamily: "monospace" }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
