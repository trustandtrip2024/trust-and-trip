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

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F6F1E7", color: "#0B1C2C" }}>
        <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ maxWidth: 520, textAlign: "center" }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Something went wrong.</h1>
            <p style={{ fontSize: "0.95rem", opacity: 0.7, marginBottom: 20 }}>
              A page-level error occurred. Try refreshing or going back home.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{ padding: "0.65rem 1.25rem", background: "#0B1C2C", color: "#F6F1E7", border: 0, borderRadius: 10, cursor: "pointer", fontWeight: 600 }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{ padding: "0.65rem 1.25rem", background: "transparent", color: "#0B1C2C", border: "1px solid rgba(11,28,44,0.2)", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}
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
