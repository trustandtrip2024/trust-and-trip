import * as React from "react";
import type { GeneratedItinerary } from "@/lib/itinerary-engine";

interface Props {
  name: string;
  itinerary: GeneratedItinerary;
  matchedPackages?: { slug: string; title: string; currentPrice: number; rating: number }[];
  whatsappNumber?: string;
}

const charcoal = "#0B1C2C";
const paper = "#FAF7F2";
const gold = "#E8A94C";
const slate = "#6B7280";

const HOST = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com";

export function ItineraryDraftEmail({ name, itinerary, matchedPackages = [], whatsappNumber = "918115999588" }: Props) {
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi Trust and Trip — I'd like to discuss the ${itinerary.title} draft you sent.`
  )}`;

  return (
    <html>
      <body style={{ fontFamily: "Georgia, serif", background: paper, padding: "24px 12px", margin: 0 }}>
        <div
          style={{
            maxWidth: 620,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 20px rgba(11,28,44,0.08)",
          }}
        >
          {/* Header */}
          <div style={{ background: charcoal, padding: "28px 32px", textAlign: "center" }}>
            <p
              style={{
                color: gold,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                margin: 0,
                fontFamily: "Arial, sans-serif",
              }}
            >
              Your draft itinerary · Trust and Trip
            </p>
            <h1 style={{ color: paper, fontSize: 26, margin: "12px 0 4px", lineHeight: 1.25 }}>
              {itinerary.title}
            </h1>
            <p style={{ color: paper, opacity: 0.7, fontSize: 14, margin: 0, fontStyle: "italic" }}>
              {itinerary.tagline}
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px", color: charcoal }}>
            <p style={{ fontSize: 15, marginTop: 0 }}>Hi {name},</p>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#3B3F47" }}>
              Our planner has drafted a {itinerary.days.length}-day journey for you. This is a starting
              point — reply or message us on WhatsApp and we'll fine-tune dates, hotels, transfers, and
              total cost.
            </p>

            {/* Quick stats */}
            <table cellPadding={0} cellSpacing={0} style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={statLabel}>Best time</td>
                  <td style={statValue}>{itinerary.bestTimeToVisit}</td>
                </tr>
                <tr>
                  <td style={statLabel}>Estimated cost</td>
                  <td style={statValue}>{itinerary.estimatedCostRange}</td>
                </tr>
                <tr>
                  <td style={statLabel}>Highlights</td>
                  <td style={statValue}>{itinerary.highlights.slice(0, 3).join(" · ")}</td>
                </tr>
              </tbody>
            </table>

            {/* Days */}
            <h2 style={sectionH2}>Day by day</h2>
            {itinerary.days.map((d) => (
              <div
                key={d.day}
                style={{
                  borderLeft: `3px solid ${gold}`,
                  paddingLeft: 14,
                  margin: "14px 0",
                }}
              >
                <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: slate, fontFamily: "Arial, sans-serif" }}>
                  Day {d.day}
                </p>
                <h3 style={{ margin: "4px 0 8px", fontSize: 17, color: charcoal }}>{d.title}</h3>
                <p style={dayP}>
                  <strong>Morning. </strong>
                  {d.morning}
                </p>
                <p style={dayP}>
                  <strong>Afternoon. </strong>
                  {d.afternoon}
                </p>
                <p style={dayP}>
                  <strong>Evening. </strong>
                  {d.evening}
                </p>
                <p style={{ ...dayP, color: slate }}>
                  <strong style={{ color: charcoal }}>Stay. </strong>
                  {d.stay}
                </p>
                {d.tip && (
                  <p style={{ ...dayP, background: "#FFF8EC", padding: "8px 10px", borderRadius: 6, color: "#7A5A12" }}>
                    <strong>Tip. </strong>
                    {d.tip}
                  </p>
                )}
              </div>
            ))}

            {/* Matched packages */}
            {matchedPackages.length > 0 && (
              <>
                <h2 style={sectionH2}>Or pick a ready-made trip we already run</h2>
                {matchedPackages.map((p) => (
                  <a
                    key={p.slug}
                    href={`${HOST}/packages/${p.slug}`}
                    style={{
                      display: "block",
                      padding: "14px 16px",
                      border: "1px solid #E5DCC8",
                      borderRadius: 10,
                      margin: "10px 0",
                      textDecoration: "none",
                      color: charcoal,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{p.title}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: slate, fontFamily: "Arial, sans-serif" }}>
                      ★ {p.rating.toFixed(1)} · ₹{p.currentPrice.toLocaleString("en-IN")} / person
                    </p>
                  </a>
                ))}
              </>
            )}

            {/* CTA */}
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <a
                href={waLink}
                style={{
                  display: "inline-block",
                  padding: "14px 28px",
                  background: "#25D366",
                  color: "#fff",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontFamily: "Arial, sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                Talk to our planner on WhatsApp
              </a>
              <p style={{ marginTop: 14, fontSize: 12, color: slate, fontFamily: "Arial, sans-serif" }}>
                Or reply to this email — a real planner reads every message.
              </p>
            </div>

            {/* Visa */}
            {itinerary.visaInfo && (
              <p style={{ marginTop: 20, fontSize: 13, color: slate, fontFamily: "Arial, sans-serif", lineHeight: 1.55 }}>
                <strong style={{ color: charcoal }}>Visa note. </strong>
                {itinerary.visaInfo}
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{ background: "#F5EFE1", padding: "16px 32px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 11, color: slate, fontFamily: "Arial, sans-serif", letterSpacing: "0.1em" }}>
              Trust and Trip · Crafting Reliable Travel
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

const statLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: slate,
  padding: "6px 0",
  width: 110,
  fontFamily: "Arial, sans-serif",
  verticalAlign: "top",
};

const statValue: React.CSSProperties = {
  fontSize: 14,
  color: charcoal,
  padding: "6px 0",
  fontFamily: "Arial, sans-serif",
};

const sectionH2: React.CSSProperties = {
  marginTop: 28,
  marginBottom: 8,
  fontSize: 18,
  color: charcoal,
};

const dayP: React.CSSProperties = {
  margin: "6px 0",
  fontSize: 14,
  color: "#3B3F47",
  lineHeight: 1.55,
  fontFamily: "Arial, sans-serif",
};
