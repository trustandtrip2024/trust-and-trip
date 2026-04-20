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
      <body style={{ fontFamily: "sans-serif", background: "#FAF7F2", padding: "32px 16px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(11,28,44,0.08)" }}>
          {/* Header */}
          <div style={{ background: "#0B1C2C", padding: "24px 32px" }}>
            <p style={{ color: "#E8A94C", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>New Enquiry</p>
            <h1 style={{ color: "#FAF7F2", fontFamily: "Georgia, serif", fontSize: 22, margin: "8px 0 0" }}>
              Trust and Trip — Lead Alert
            </h1>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px" }}>
            <p style={{ fontSize: 14, color: "#556678", margin: "0 0 20px" }}>
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
                style={{ background: "#0B1C2C", color: "#FAF7F2", padding: "12px 20px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                Call Now
              </a>
            </div>
          </div>

          <div style={{ padding: "16px 32px", background: "#F4F6F8", borderTop: "1px solid #E6EAEF" }}>
            <p style={{ fontSize: 11, color: "#8C9AAB", margin: 0 }}>
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
    <tr style={{ borderBottom: "1px solid #F4F6F8" }}>
      <td style={{ padding: "10px 0", color: "#8C9AAB", width: 120, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</td>
      <td style={{ padding: "10px 0", color: highlight ? "#0B1C2C" : "#2D3E52", fontWeight: highlight ? 600 : 400 }}>{value}</td>
    </tr>
  );
}
