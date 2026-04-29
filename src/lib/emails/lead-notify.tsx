import * as React from "react";

interface Props {
  name: string;
  phone: string;
  email: string;
  destination?: string;
  travelType?: string;
  travelDate?: string;
  numTravellers?: string;
  budget?: string;
  message?: string;
  packageTitle?: string;
  source: string;
  pageUrl?: string;
}

export function LeadNotifyEmail({
  name, phone, email, destination, travelType, travelDate,
  numTravellers, budget, message, packageTitle, source, pageUrl,
}: Props) {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", background: "#FBF7F1", padding: "32px 16px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(42,42,42,0.08)" }}>
          {/* Header */}
          <div style={{ background: "#2A2A2A", padding: "24px 32px" }}>
            <p style={{ color: "#C8932A", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>New Enquiry</p>
            <h1 style={{ color: "#FBF7F1", fontFamily: "Georgia, serif", fontSize: 22, margin: "8px 0 0" }}>
              Trust and Trip — Lead Alert
            </h1>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px" }}>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 20px" }}>
              A new enquiry came in via <strong>{source.replace(/_/g, " ")}</strong>
              {pageUrl ? ` from ${pageUrl}` : ""}.
            </p>

            {/* Lead info */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <tbody>
                <Row label="Name" value={name} highlight />
                <Row label="Phone" value={phone} highlight />
                <Row label="Email" value={email} />
                {packageTitle && <Row label="Package" value={packageTitle} />}
                {destination && <Row label="Destination" value={destination} />}
                {travelType && <Row label="Travel Type" value={travelType} />}
                {numTravellers && <Row label="Travellers" value={numTravellers} />}
                {travelDate && <Row label="Travel Date" value={travelDate} />}
                {budget && <Row label="Budget" value={budget} />}
                {message && <Row label="Message" value={message} />}
              </tbody>
            </table>

            {/* CTAs */}
            <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
              <a href={`https://wa.me/918115999588?text=${encodeURIComponent(`Hi! Following up with ${name} (${phone}) — new enquiry from Trust and Trip.`)}`}
                style={{ background: "#25D366", color: "#fff", padding: "12px 20px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                Reply on WhatsApp
              </a>
              <a href={`tel:${phone}`}
                style={{ background: "#2A2A2A", color: "#FBF7F1", padding: "12px 20px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                Call Now
              </a>
            </div>
          </div>

          <div style={{ padding: "16px 32px", background: "#FBF7F1", borderTop: "1px solid rgba(42,42,42,0.08)" }}>
            <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>
              Trust and Trip · hello@trustandtrip.com · +91 8115 999 588
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <tr style={{ borderBottom: "1px solid #FBF7F1" }}>
      <td style={{ padding: "10px 0", color: "#6B7280", width: 120, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</td>
      <td style={{ padding: "10px 0", color: highlight ? "#2A2A2A" : "#2D3E52", fontWeight: highlight ? 600 : 400 }}>{value}</td>
    </tr>
  );
}
