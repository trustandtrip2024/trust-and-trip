import * as React from "react";

interface Props {
  name: string;
  packageTitle?: string;
  destination?: string;
}

export function LeadConfirmEmail({ name, packageTitle, destination }: Props) {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", background: "#FAF7F2", padding: "32px 16px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(11,28,44,0.08)" }}>
          {/* Header */}
          <div style={{ background: "#0B1C2C", padding: "32px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, background: "#E8A94C", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <span style={{ color: "#0B1C2C", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700 }}>T</span>
            </div>
            <h1 style={{ color: "#FAF7F2", fontFamily: "Georgia, serif", fontSize: 26, margin: "8px 0 4px" }}>
              We've got your enquiry!
            </h1>
            <p style={{ color: "#E8A94C", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
              Trust and Trip
            </p>
          </div>

          <div style={{ padding: "32px" }}>
            <p style={{ fontSize: 16, color: "#0B1C2C", fontFamily: "Georgia, serif", marginTop: 0 }}>
              Hi {name},
            </p>
            <p style={{ fontSize: 14, color: "#556678", lineHeight: 1.7 }}>
              Thank you for reaching out! We've received your enquiry
              {packageTitle ? ` for <strong>${packageTitle}</strong>` : destination ? ` for ${destination}` : ""}
              {" "}and one of our travel planners will get back to you within{" "}
              <strong style={{ color: "#0B1C2C" }}>2 hours</strong>.
            </p>

            <div style={{ background: "#FAF7F2", borderRadius: 12, padding: "20px 24px", margin: "24px 0" }}>
              <p style={{ fontSize: 11, color: "#E8A94C", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 14px", fontWeight: 600 }}>
                What happens next
              </p>
              {[
                ["Within 2 hours", "A planner reviews your enquiry and reaches out on WhatsApp"],
                ["Same day", "You receive a personalised itinerary draft"],
                ["On your approval", "We finalise hotels, activities and pricing together"],
              ].map(([time, desc]) => (
                <div key={time} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, background: "#E8A94C", borderRadius: "50%", marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0B1C2C" }}>{time}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8C9AAB" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 28 }}>
              <a href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I%20just%20submitted%20an%20enquiry."
                style={{ background: "#25D366", color: "#fff", padding: "14px 32px", borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 600, display: "inline-block" }}>
                Chat with us on WhatsApp
              </a>
            </div>
          </div>

          <div style={{ padding: "16px 32px", background: "#F4F6F8", borderTop: "1px solid #E6EAEF", textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#8C9AAB", margin: 0 }}>
              Trust and Trip · hello@trustandtrip.com · +91 8115 999 588
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
