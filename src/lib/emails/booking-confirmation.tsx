import * as React from "react";

interface Props {
  name: string;
  bookingId: string;
  packageTitle: string;
  packagePrice: number;
  numTravellers: number;
  depositAmount: number;
  travelDate?: string | null;
  paymentId?: string | null;
  bookingUrl: string;
  receiptUrl: string;
  whatsappUrl: string;
}

const fmtINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function BookingConfirmationEmail({
  name, bookingId, packageTitle, packagePrice, numTravellers, depositAmount,
  travelDate, paymentId, bookingUrl, receiptUrl, whatsappUrl,
}: Props) {
  const firstName = name.split(" ")[0] || "there";
  const total = packagePrice * numTravellers;
  const balance = total - depositAmount;
  const shortRef = bookingId.slice(0, 8).toUpperCase();

  return (
    <html>
      <body style={{ fontFamily: "sans-serif", background: "#FAF7F2", padding: "32px 16px", margin: 0 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(11,28,44,0.08)" }}>
          <div style={{ background: "#0B1C2C", padding: "36px 32px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, background: "#E8A94C", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <span style={{ color: "#0B1C2C", fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700 }}>T</span>
            </div>
            <p style={{ color: "#E8A94C", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 8px", fontWeight: 500 }}>
              Booking Confirmed
            </p>
            <h1 style={{ color: "#FAF7F2", fontFamily: "Georgia, serif", fontSize: 26, margin: "4px 0 6px", fontWeight: 500 }}>
              You're going on a trip, {firstName}!
            </h1>
            <p style={{ color: "rgba(250,247,242,0.55)", fontSize: 12, margin: 0, fontFamily: "monospace" }}>
              Booking #{shortRef}
            </p>
          </div>

          <div style={{ padding: "32px" }}>
            <p style={{ fontSize: 14, color: "#0B1C2C", lineHeight: 1.6, marginTop: 0 }}>
              Your deposit has been received and your trip is locked in. Save this email — it
              has everything you need.
            </p>

            <div style={{ border: "1px solid rgba(11,28,44,0.08)", borderRadius: 12, padding: 20, marginTop: 18 }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#0B1C2C", margin: "0 0 14px" }}>
                {packageTitle}
              </p>
              <Row label="Travellers" value={`${numTravellers} ${numTravellers === 1 ? "person" : "people"}`} />
              {travelDate && <Row label="Travel date" value={travelDate} />}
              <Row label="Package total" value={fmtINR(total)} />
              <Row label="Deposit paid" value={fmtINR(depositAmount)} highlight />
              <Row label="Balance due" value={fmtINR(balance)} bold />
              {paymentId && <Row label="Payment ID" value={paymentId} mono small />}
            </div>

            <div style={{ display: "block", textAlign: "center", margin: "26px 0 18px" }}>
              <a href={bookingUrl} style={{ display: "inline-block", background: "#E8A94C", color: "#0B1C2C", padding: "12px 28px", borderRadius: 999, textDecoration: "none", fontWeight: 600, fontSize: 14, marginRight: 8, marginBottom: 8 }}>
                View booking
              </a>
              <a href={receiptUrl} style={{ display: "inline-block", background: "#0B1C2C", color: "#FAF7F2", padding: "12px 24px", borderRadius: 999, textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                Download GST invoice
              </a>
            </div>

            <div style={{ background: "#FAF7F2", border: "1px solid rgba(11,28,44,0.06)", borderRadius: 12, padding: "16px 18px", marginTop: 18 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(11,28,44,0.55)", margin: "0 0 8px", fontWeight: 600 }}>
                What happens next
              </p>
              <ol style={{ fontSize: 13, color: "#0B1C2C", margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                <li>Our travel concierge calls you within 24 hours to finalise dates and itinerary preferences.</li>
                <li>We send your full itinerary, hotel vouchers and pickup details 7 days before departure.</li>
                <li>Balance ({fmtINR(balance)}) is due 14 days before travel.</li>
              </ol>
            </div>

            <div style={{ textAlign: "center", marginTop: 22 }}>
              <p style={{ fontSize: 12, color: "rgba(11,28,44,0.55)", margin: "0 0 10px" }}>
                Need to change something? Have a question?
              </p>
              <a href={whatsappUrl} style={{ display: "inline-block", background: "#25D366", color: "#fff", padding: "10px 22px", borderRadius: 999, textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                Chat on WhatsApp
              </a>
            </div>

            <p style={{ fontSize: 12, color: "rgba(11,28,44,0.5)", marginTop: 28, lineHeight: 1.5 }}>
              We&apos;re thrilled to be part of this trip. <br />
              — Team Trust and Trip
            </p>
          </div>

          <div style={{ background: "#FAF7F2", padding: "18px 32px", borderTop: "1px solid rgba(11,28,44,0.06)" }}>
            <p style={{ fontSize: 10, color: "rgba(11,28,44,0.45)", margin: 0, textAlign: "center" }}>
              <a href={bookingUrl} style={{ color: "rgba(11,28,44,0.55)", textDecoration: "none" }}>Booking</a>
              {" · "}
              <a href={receiptUrl} style={{ color: "rgba(11,28,44,0.55)", textDecoration: "none" }}>Receipt</a>
              {" · "}
              <a href="https://trustandtrip.com" style={{ color: "rgba(11,28,44,0.55)", textDecoration: "none" }}>trustandtrip.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

function Row({ label, value, highlight, bold, mono, small }: { label: string; value: string; highlight?: boolean; bold?: boolean; mono?: boolean; small?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: "1px solid rgba(11,28,44,0.04)" }}>
      <span style={{ fontSize: 12, color: "rgba(11,28,44,0.55)" }}>{label}</span>
      <span style={{
        fontSize: small ? 10 : (bold ? 15 : 13),
        fontFamily: mono ? "monospace" : "sans-serif",
        wordBreak: mono ? "break-all" : "normal",
        color: highlight ? "#0F8B4F" : "#0B1C2C",
        fontWeight: bold ? 700 : (highlight ? 600 : 500),
        marginLeft: 12,
        textAlign: "right",
      }}>
        {value}
      </span>
    </div>
  );
}
