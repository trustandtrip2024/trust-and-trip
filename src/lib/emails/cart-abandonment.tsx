import * as React from "react";

export interface CartAbandonmentItem {
  packageTitle: string;
  packageSlug: string;
  packageImage?: string;
  packagePrice: number;
  destinationName?: string;
  duration?: string;
  numTravelers?: number;
}

interface Props {
  name: string;
  items: CartAbandonmentItem[];
  tier: "24h" | "72h";
  cartUrl: string;
  whatsappUrl: string;
}

const fmtINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function CartAbandonmentEmail({ name, items, tier, cartUrl, whatsappUrl }: Props) {
  const firstName = name.split(" ")[0] || "there";
  const isFollowUp = tier === "72h";
  const subjectLead = isFollowUp
    ? "Still thinking it over? Here's a little nudge."
    : "You left something wonderful in your cart.";
  const bodyLead = isFollowUp
    ? "Last chance to pick up where you left off — our team can hold these packages for 24 more hours before prices refresh."
    : "We've saved these trips for you. Prices move with season and demand, so it's worth finishing soon.";

  const total = items.reduce((s, i) => s + (i.packagePrice * (i.numTravelers ?? 2)), 0);

  return (
    <html>
      <body style={{ fontFamily: "sans-serif", background: "#FBF7F1", padding: "32px 16px", margin: 0 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(42,42,42,0.08)" }}>
          <div style={{ background: "#2A2A2A", padding: "32px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, background: "#C8932A", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <span style={{ color: "#2A2A2A", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700 }}>T</span>
            </div>
            <h1 style={{ color: "#FBF7F1", fontFamily: "Georgia, serif", fontSize: 24, margin: "8px 0 4px", fontWeight: 500 }}>
              {subjectLead}
            </h1>
            <p style={{ color: "#C8932A", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
              Trust and Trip
            </p>
          </div>

          <div style={{ padding: "32px" }}>
            <p style={{ fontSize: 16, color: "#2A2A2A", fontFamily: "Georgia, serif", marginTop: 0 }}>
              Hi {firstName},
            </p>
            <p style={{ fontSize: 14, color: "#2A2A2A", lineHeight: 1.6 }}>
              {bodyLead}
            </p>

            {items.map((it, i) => (
              <div key={i} style={{ border: "1px solid rgba(42,42,42,0.08)", borderRadius: 12, padding: 16, marginTop: 16, display: "flex", gap: 14, alignItems: "center" }}>
                {it.packageImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.packageImage} alt={it.packageTitle} width={96} height={72} style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#2A2A2A", margin: "0 0 4px" }}>
                    {it.packageTitle}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(42,42,42,0.55)", margin: "0 0 8px" }}>
                    {[it.destinationName, it.duration].filter(Boolean).join(" · ")}
                  </p>
                  <p style={{ fontSize: 13, color: "#B88530", fontWeight: 600, margin: 0 }}>
                    {fmtINR(it.packagePrice)}
                    <span style={{ fontSize: 11, color: "rgba(42,42,42,0.5)", fontWeight: 400 }}> / person</span>
                  </p>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 22, padding: "14px 18px", background: "#FBF7F1", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(42,42,42,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Est. total
              </span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#2A2A2A" }}>
                {fmtINR(total)}
              </span>
            </div>

            <div style={{ textAlign: "center", margin: "28px 0 18px" }}>
              <a href={cartUrl} style={{ display: "inline-block", background: "#C8932A", color: "#2A2A2A", padding: "14px 32px", borderRadius: 999, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                {isFollowUp ? "Reserve with 30% deposit" : "Complete my booking"}
              </a>
            </div>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <p style={{ fontSize: 12, color: "rgba(42,42,42,0.55)", margin: "0 0 10px" }}>
                Want help customising? We're one message away.
              </p>
              <a href={whatsappUrl} style={{ display: "inline-block", background: "#25D366", color: "#fff", padding: "10px 22px", borderRadius: 999, textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                Chat on WhatsApp
              </a>
            </div>

            <p style={{ fontSize: 11, color: "rgba(42,42,42,0.45)", marginTop: 28, lineHeight: 1.5, textAlign: "center" }}>
              Prices shown reflect current season. We don't spam — this is the only reminder you'll get
              {isFollowUp ? " for these items." : "; one more will follow in 48 hours if you still haven't completed the booking."}
            </p>
          </div>

          <div style={{ background: "#FBF7F1", padding: "18px 32px", borderTop: "1px solid rgba(42,42,42,0.06)" }}>
            <p style={{ fontSize: 10, color: "rgba(42,42,42,0.45)", margin: 0, textAlign: "center" }}>
              <a href="https://trustandtrip.com/dashboard/cart" style={{ color: "rgba(42,42,42,0.55)", textDecoration: "none" }}>View cart</a>
              {" · "}
              <a href="https://trustandtrip.com" style={{ color: "rgba(42,42,42,0.55)", textDecoration: "none" }}>trustandtrip.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
