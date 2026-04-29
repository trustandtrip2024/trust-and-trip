import * as React from "react";

interface Props {
  name: string;
  email: string;
  tempPassword: string | null;
  refCode: string;
  commissionPct: number;
  loginUrl: string;
  dashboardUrl: string;
  refLink: string;
}

export function CreatorWelcomeEmail({
  name, email, tempPassword, refCode, commissionPct, loginUrl, dashboardUrl, refLink,
}: Props) {
  const firstName = name.split(" ")[0];
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", background: "#FBF7F1", padding: "32px 16px", margin: 0 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(42,42,42,0.08)" }}>
          <div style={{ background: "#2A2A2A", padding: "36px 32px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, background: "#C8932A", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <span style={{ color: "#2A2A2A", fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700 }}>T</span>
            </div>
            <h1 style={{ color: "#FBF7F1", fontFamily: "Georgia, serif", fontSize: 26, margin: "8px 0 4px", fontWeight: 500 }}>
              You're in, {firstName} ✨
            </h1>
            <p style={{ color: "#C8932A", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, fontWeight: 500 }}>
              Trust and Trip · Creator Program
            </p>
          </div>

          <div style={{ padding: "32px" }}>
            <p style={{ fontSize: 16, color: "#2A2A2A", fontFamily: "Georgia, serif", marginTop: 0 }}>
              Welcome aboard.
            </p>
            <p style={{ fontSize: 14, color: "#2A2A2A", lineHeight: 1.6 }}>
              Your creator application has been approved. You can now share trips with your
              audience and earn <strong>{commissionPct}% commission</strong> on every booking made
              through your personal link.
            </p>

            {tempPassword && (
              <div style={{ background: "#FBF7F1", border: "1px solid rgba(42,42,42,0.08)", borderRadius: 12, padding: "18px 20px", marginTop: 20 }}>
                <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(42,42,42,0.55)", margin: "0 0 10px", fontWeight: 600 }}>
                  Your login
                </p>
                <p style={{ fontSize: 13, color: "#2A2A2A", margin: "4px 0" }}>
                  <strong>Email:</strong> {email}
                </p>
                <p style={{ fontSize: 13, color: "#2A2A2A", margin: "4px 0", fontFamily: "monospace" }}>
                  <strong style={{ fontFamily: "sans-serif" }}>Temp password:</strong> {tempPassword}
                </p>
                <p style={{ fontSize: 11, color: "rgba(42,42,42,0.5)", margin: "10px 0 0" }}>
                  Change this from Profile → Password after your first login.
                </p>
              </div>
            )}

            {!tempPassword && (
              <div style={{ background: "#FBF7F1", border: "1px solid rgba(42,42,42,0.08)", borderRadius: 12, padding: "18px 20px", marginTop: 20 }}>
                <p style={{ fontSize: 13, color: "#2A2A2A", margin: 0 }}>
                  Log in with your existing Trust and Trip account email: <strong>{email}</strong>
                </p>
              </div>
            )}

            <div style={{ textAlign: "center", margin: "26px 0 18px" }}>
              <a href={loginUrl} style={{ display: "inline-block", background: "#C8932A", color: "#2A2A2A", padding: "12px 28px", borderRadius: 999, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                Log in to dashboard
              </a>
            </div>

            <hr style={{ border: 0, borderTop: "1px solid rgba(42,42,42,0.08)", margin: "26px 0" }} />

            <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(42,42,42,0.55)", margin: "0 0 8px", fontWeight: 600 }}>
              Your referral details
            </p>
            <p style={{ fontSize: 13, color: "#2A2A2A", margin: "4px 0" }}>
              <strong>Ref code:</strong> <span style={{ fontFamily: "monospace", color: "#B88530" }}>{refCode}</span>
            </p>
            <p style={{ fontSize: 13, color: "#2A2A2A", margin: "4px 0", wordBreak: "break-all" }}>
              <strong>Share link:</strong> <a href={refLink} style={{ color: "#B88530", fontFamily: "monospace" }}>{refLink}</a>
            </p>
            <p style={{ fontSize: 12, color: "rgba(42,42,42,0.6)", lineHeight: 1.6, marginTop: 12 }}>
              Any visitor who lands via your link stays attributed to you for 30 days. When
              they book, {commissionPct}% of the package value accrues in your dashboard.
              Payouts monthly once ₹1,000 is cleared.
            </p>

            <div style={{ marginTop: 24, padding: "16px 18px", background: "rgba(200,147,42,0.08)", border: "1px solid rgba(200,147,42,0.25)", borderRadius: 12 }}>
              <p style={{ fontSize: 12, color: "#2A2A2A", margin: 0, lineHeight: 1.5 }}>
                Need ideas? Share the link in your Instagram bio, stories, or reels. The more
                specific the destination pitch, the higher the conversion.
              </p>
            </div>

            <p style={{ fontSize: 12, color: "rgba(42,42,42,0.5)", marginTop: 28, lineHeight: 1.5 }}>
              Questions? Reply to this email or WhatsApp us at +91 81159 99588. We're rooting for you.
            </p>

            <p style={{ fontSize: 12, color: "rgba(42,42,42,0.5)", marginTop: 18 }}>
              — Team Trust and Trip
            </p>
          </div>

          <div style={{ background: "#FBF7F1", padding: "18px 32px", borderTop: "1px solid rgba(42,42,42,0.06)" }}>
            <p style={{ fontSize: 10, color: "rgba(42,42,42,0.45)", margin: 0, textAlign: "center" }}>
              <a href={dashboardUrl} style={{ color: "rgba(42,42,42,0.55)", textDecoration: "none" }}>Dashboard</a>
              {" · "}
              <a href="https://trustandtrip.com" style={{ color: "rgba(42,42,42,0.55)", textDecoration: "none" }}>trustandtrip.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
