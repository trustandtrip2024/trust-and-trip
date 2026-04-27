import * as React from "react";

interface Props {
  couponCode: string;
  amountOff: number;
  minOrder: number;
  expiresOn: string;
}

export function NewsletterWelcomeEmail({ couponCode, amountOff, minOrder, expiresOn }: Props) {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", background: "#FAF7F2", padding: "32px 16px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(11,28,44,0.08)" }}>
          <div style={{ background: "#0B1C2C", padding: "32px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, background: "#E8A94C", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <span style={{ color: "#0B1C2C", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700 }}>T</span>
            </div>
            <h1 style={{ color: "#FAF7F2", fontFamily: "Georgia, serif", fontSize: 26, margin: "8px 0 4px" }}>
              Welcome to the inside list.
            </h1>
            <p style={{ color: "#E8A94C", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
              Trust and Trip
            </p>
          </div>

          <div style={{ padding: "32px" }}>
            <p style={{ fontSize: 14, color: "#556678", lineHeight: 1.7, marginTop: 0 }}>
              Here's your <strong style={{ color: "#0B1C2C" }}>₹{amountOff.toLocaleString("en-IN")} off</strong> code, as promised. Apply it at booking — works on any package above ₹{minOrder.toLocaleString("en-IN")}.
            </p>

            <div style={{ background: "#FAF7F2", border: "2px dashed #E8A94C", borderRadius: 12, padding: "24px", textAlign: "center", margin: "24px 0" }}>
              <p style={{ fontSize: 11, color: "#E8A94C", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 8px", fontWeight: 600 }}>
                Your code
              </p>
              <p style={{ fontFamily: "monospace", fontSize: 28, color: "#0B1C2C", margin: 0, letterSpacing: "0.1em", fontWeight: 700 }}>
                {couponCode}
              </p>
              <p style={{ fontSize: 12, color: "#556678", margin: "12px 0 0" }}>
                Valid until <strong>{expiresOn}</strong>
              </p>
            </div>

            <p style={{ fontSize: 13, color: "#556678", lineHeight: 1.6 }}>
              One email a month — flash deals, new destinations, stories from the road. No spam. Unsubscribe anytime.
            </p>

            <div style={{ textAlign: "center", margin: "28px 0 8px" }}>
              <a
                href="https://trustandtrip.com/packages"
                style={{ display: "inline-block", background: "#E8A94C", color: "#0B1C2C", padding: "12px 28px", borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: "none" }}
              >
                Browse packages →
              </a>
            </div>
          </div>

          <div style={{ background: "#FAF7F2", padding: "20px 32px", textAlign: "center", borderTop: "1px solid #E8E2D7" }}>
            <p style={{ fontSize: 11, color: "#556678", margin: 0 }}>
              Trust and Trip · Crafting Reliable Travel · trustandtrip.com
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
