import * as React from "react";

interface Props {
  name: string;
  packageTitle: string;
  packageSlug: string;
  oldPrice: number;
  newPrice: number;
  percentOff: number;
  destinationName?: string;
  duration?: string;
  image?: string;
}

const BASE_URL = "https://trustandtrip.com";

export function PriceDropEmail({
  name, packageTitle, packageSlug, oldPrice, newPrice, percentOff,
  destinationName, duration, image,
}: Props) {
  const savings = oldPrice - newPrice;
  const link = `${BASE_URL}/packages/${packageSlug}?utm_source=email&utm_medium=price_drop&utm_campaign=wishlist_alert`;

  return (
    <html>
      <body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#FBF7F1", padding: "32px 16px", margin: 0 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(42,42,42,0.08)" }}>
          {/* Banner */}
          <div style={{ background: "#2A2A2A", padding: "28px 32px" }}>
            <p style={{ color: "#C8932A", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, fontWeight: 600 }}>
              Price Drop Alert
            </p>
            <h1 style={{ color: "#FBF7F1", fontFamily: "Georgia, serif", fontSize: 24, margin: "8px 0 0", lineHeight: 1.2 }}>
              Your saved trip just got <span style={{ color: "#C8932A", fontStyle: "italic" }}>{percentOff}% cheaper.</span>
            </h1>
          </div>

          {/* Image */}
          {image && (
            <div style={{ width: "100%", height: 220, overflow: "hidden" }}>
              <img src={image} alt={packageTitle} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}

          {/* Body */}
          <div style={{ padding: "28px 32px 12px" }}>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 12 }}>
              Hi {name},
            </p>
            <p style={{ color: "#374151", fontSize: 15, lineHeight: 1.55, marginBottom: 20 }}>
              Great news — the package you saved just dropped in price. A few seats opened up, so we&apos;re passing the savings on to you.
            </p>

            {/* Package card */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 20 }}>
              {destinationName && (
                <p style={{ color: "#6b7280", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 6px" }}>
                  {destinationName}
                </p>
              )}
              <h2 style={{ color: "#2A2A2A", fontFamily: "Georgia, serif", fontSize: 18, margin: "0 0 8px", lineHeight: 1.3 }}>
                {packageTitle}
              </h2>
              {duration && (
                <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 16px" }}>{duration}</p>
              )}

              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
                <span style={{ color: "#9ca3af", fontSize: 14, textDecoration: "line-through" }}>
                  ₹{oldPrice.toLocaleString("en-IN")}
                </span>
                <span style={{ color: "#2A2A2A", fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 500 }}>
                  ₹{newPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <p style={{ color: "#16a34a", fontSize: 13, fontWeight: 600, margin: "4px 0 0" }}>
                You save ₹{savings.toLocaleString("en-IN")} per person
              </p>
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <a
                href={link}
                style={{
                  display: "inline-block",
                  background: "#2A2A2A",
                  color: "#FBF7F1",
                  padding: "14px 28px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Grab this deal →
              </a>
            </div>

            <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", margin: "0 0 4px" }}>
              Prices can change any time. We&apos;re holding this rate for you.
            </p>
          </div>

          {/* Footer */}
          <div style={{ background: "#FBF7F1", padding: "20px 32px", borderTop: "1px solid #f3f4f6" }}>
            <p style={{ color: "#6b7280", fontSize: 12, lineHeight: 1.5, margin: "0 0 8px" }}>
              Not interested in price alerts? <a href={`${BASE_URL}/dashboard/saved`} style={{ color: "#6b7280" }}>Manage saved trips</a>.
            </p>
            <p style={{ color: "#9ca3af", fontSize: 11, margin: 0 }}>
              Trust and Trip · R-607, Amrapali Princely, Noida · +91 8115 999 588
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
