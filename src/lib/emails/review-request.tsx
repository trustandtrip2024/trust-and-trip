import * as React from "react";

interface Props {
  name: string;
  packageTitle: string;
  destinationName?: string;
  reviewUrl: string;
  googleReviewUrl: string;
}

export function ReviewRequestEmail({ name, packageTitle, destinationName, reviewUrl, googleReviewUrl }: Props) {
  const firstName = name.split(" ")[0] || "there";
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", background: "#FBF7F1", padding: "32px 16px", margin: 0 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(42,42,42,0.08)" }}>
          <div style={{ background: "#2A2A2A", padding: "36px 32px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, background: "#C8932A", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <span style={{ color: "#2A2A2A", fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700 }}>T</span>
            </div>
            <h1 style={{ color: "#FBF7F1", fontFamily: "Georgia, serif", fontSize: 26, margin: "8px 0 4px", fontWeight: 500 }}>
              Welcome home, {firstName} ☕
            </h1>
            <p style={{ color: "#C8932A", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, fontWeight: 500 }}>
              Trust and Trip
            </p>
          </div>

          <div style={{ padding: "32px" }}>
            <p style={{ fontSize: 16, color: "#2A2A2A", fontFamily: "Georgia, serif", marginTop: 0 }}>
              Hope the trip was everything you hoped for.
            </p>
            <p style={{ fontSize: 14, color: "#2A2A2A", lineHeight: 1.65 }}>
              You just returned from <strong>{packageTitle}</strong>
              {destinationName ? <> in <strong>{destinationName}</strong></> : null}.
              Your memories can help the next traveller pick with confidence — and honest
              reviews keep us sharp.
            </p>

            <p style={{ fontSize: 14, color: "#2A2A2A", lineHeight: 1.65, marginTop: 18 }}>
              Could you spare 60 seconds for one of these?
            </p>

            <div style={{ display: "block", marginTop: 18 }}>
              <div style={{ border: "1px solid rgba(200,147,42,0.35)", borderRadius: 12, padding: 18, background: "rgba(200,147,42,0.06)" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B88530", margin: "0 0 6px", fontWeight: 600 }}>
                  Option A · 30 seconds
                </p>
                <p style={{ fontSize: 14, color: "#2A2A2A", margin: "0 0 12px", fontWeight: 600 }}>
                  Leave a Google review
                </p>
                <p style={{ fontSize: 12, color: "rgba(42,42,42,0.6)", margin: "0 0 14px", lineHeight: 1.5 }}>
                  The biggest help to us. Future travellers see it when they search for us.
                </p>
                <a href={googleReviewUrl} style={{ display: "inline-block", background: "#C8932A", color: "#2A2A2A", padding: "10px 22px", borderRadius: 999, textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                  ★ Review on Google
                </a>
              </div>

              <div style={{ border: "1px solid rgba(42,42,42,0.1)", borderRadius: 12, padding: 18, marginTop: 14 }}>
                <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(42,42,42,0.55)", margin: "0 0 6px", fontWeight: 600 }}>
                  Option B · 90 seconds
                </p>
                <p style={{ fontSize: 14, color: "#2A2A2A", margin: "0 0 12px", fontWeight: 600 }}>
                  Share photos + a longer review
                </p>
                <p style={{ fontSize: 12, color: "rgba(42,42,42,0.6)", margin: "0 0 14px", lineHeight: 1.5 }}>
                  We'll feature the best ones on the destination page — great for future travellers.
                </p>
                <a href={reviewUrl} style={{ display: "inline-block", background: "#2A2A2A", color: "#FBF7F1", padding: "10px 22px", borderRadius: 999, textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                  Write a full review
                </a>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "rgba(42,42,42,0.55)", marginTop: 26, lineHeight: 1.55 }}>
              If anything didn&apos;t go as planned, please reply to this email first —
              we&apos;d love the chance to make it right before anyone else hears about it.
            </p>

            <p style={{ fontSize: 12, color: "rgba(42,42,42,0.5)", marginTop: 22 }}>
              Thank you for trusting us, <br />
              Team Trust and Trip
            </p>
          </div>

          <div style={{ background: "#FBF7F1", padding: "18px 32px", borderTop: "1px solid rgba(42,42,42,0.06)" }}>
            <p style={{ fontSize: 10, color: "rgba(42,42,42,0.45)", margin: 0, textAlign: "center" }}>
              <a href="https://trustandtrip.com" style={{ color: "rgba(42,42,42,0.55)", textDecoration: "none" }}>trustandtrip.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
