import * as React from "react";

interface Props {
  name: string;
  amountPaise: number;
  txnRef?: string;
  periodStart?: string;
  periodEnd?: string;
  dashboardUrl: string;
}

const fmtINR = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export function CreatorPayoutEmail({ name, amountPaise, txnRef, periodStart, periodEnd, dashboardUrl }: Props) {
  const firstName = name.split(" ")[0] || "there";
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", background: "#FAF7F2", padding: "32px 16px", margin: 0 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(11,28,44,0.08)" }}>
          <div style={{ background: "#0B1C2C", padding: "36px 32px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, background: "#E8A94C", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <span style={{ color: "#0B1C2C", fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700 }}>T</span>
            </div>
            <p style={{ color: "#E8A94C", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 8px", fontWeight: 500 }}>
              Payout sent
            </p>
            <h1 style={{ color: "#FAF7F2", fontFamily: "Georgia, serif", fontSize: 32, margin: "4px 0", fontWeight: 500 }}>
              {fmtINR(amountPaise)}
            </h1>
            <p style={{ color: "rgba(250,247,242,0.6)", fontSize: 13, margin: 0 }}>
              for {firstName}
            </p>
          </div>

          <div style={{ padding: "32px" }}>
            <p style={{ fontSize: 16, color: "#0B1C2C", fontFamily: "Georgia, serif", marginTop: 0 }}>
              Payment is on its way 🚀
            </p>
            <p style={{ fontSize: 14, color: "#0B1C2C", lineHeight: 1.6 }}>
              Your commission for the period
              {periodStart && periodEnd ? <> {periodStart} → {periodEnd}</> : null}
              {" "}has been transferred via your registered payout method. Bank settlement
              typically reflects within 1–2 business days.
            </p>

            {txnRef && (
              <div style={{ background: "#FAF7F2", border: "1px solid rgba(11,28,44,0.08)", borderRadius: 12, padding: "14px 18px", marginTop: 18 }}>
                <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(11,28,44,0.55)", margin: "0 0 6px", fontWeight: 600 }}>
                  Transaction reference
                </p>
                <p style={{ fontSize: 13, color: "#0B1C2C", fontFamily: "monospace", margin: 0, wordBreak: "break-all" }}>
                  {txnRef}
                </p>
              </div>
            )}

            <div style={{ textAlign: "center", margin: "26px 0 18px" }}>
              <a href={dashboardUrl} style={{ display: "inline-block", background: "#E8A94C", color: "#0B1C2C", padding: "12px 28px", borderRadius: 999, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                View earnings history
              </a>
            </div>

            <p style={{ fontSize: 12, color: "rgba(11,28,44,0.55)", marginTop: 24, lineHeight: 1.5 }}>
              Keep sharing your link — the next payout cycle is already running. Reply to
              this email if you spot anything off.
            </p>

            <p style={{ fontSize: 12, color: "rgba(11,28,44,0.5)", marginTop: 18 }}>
              — Team Trust and Trip
            </p>
          </div>

          <div style={{ background: "#FAF7F2", padding: "18px 32px", borderTop: "1px solid rgba(11,28,44,0.06)" }}>
            <p style={{ fontSize: 10, color: "rgba(11,28,44,0.45)", margin: 0, textAlign: "center" }}>
              <a href={dashboardUrl} style={{ color: "rgba(11,28,44,0.55)", textDecoration: "none" }}>Earnings</a>
              {" · "}
              <a href="https://trustandtrip.com" style={{ color: "rgba(11,28,44,0.55)", textDecoration: "none" }}>trustandtrip.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
