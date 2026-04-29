import * as React from "react";

interface SourceRow {
  src: string;
  leads: number;
  tierA: number;
  bookings: number;
}

interface Props {
  date: string;                 // "2026-04-28"
  windowLabel: string;          // "Last 24h" / "Yesterday"
  totalLeads: number;
  prevLeads: number;
  tierA: number;
  prevTierA: number;
  bookings: number;
  prevBookings: number;
  grossDeposit: number;
  prevGrossDeposit: number;
  unrespondedTierA: number;
  topSources: SourceRow[];
  alerts: string[];
}

const charcoal = "#2A2A2A";
const paper = "#FBF7F1";
const gold = "#C8932A";
const slate = "#6B7280";

function fmtINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}
function delta(curr: number, prev: number) {
  if (prev === 0 && curr === 0) return { sign: "", text: "—", color: slate };
  if (prev === 0) return { sign: "↑", text: "new", color: "#15803D" };
  const d = ((curr - prev) / prev) * 100;
  if (Math.abs(d) < 0.5) return { sign: "·", text: "flat", color: slate };
  return d > 0
    ? { sign: "↑", text: `${d.toFixed(0)}%`, color: "#15803D" }
    : { sign: "↓", text: `${Math.abs(d).toFixed(0)}%`, color: "#B91C1C" };
}

export function FounderDigestEmail({
  date,
  windowLabel,
  totalLeads,
  prevLeads,
  tierA,
  prevTierA,
  bookings,
  prevBookings,
  grossDeposit,
  prevGrossDeposit,
  unrespondedTierA,
  topSources,
  alerts,
}: Props) {
  const dLeads = delta(totalLeads, prevLeads);
  const dTierA = delta(tierA, prevTierA);
  const dBookings = delta(bookings, prevBookings);
  const dRev = delta(grossDeposit, prevGrossDeposit);

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
            boxShadow: "0 2px 20px rgba(42,42,42,0.08)",
          }}
        >
          <div style={{ background: charcoal, padding: "26px 32px" }}>
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
              Trust and Trip · Daily Digest · {date}
            </p>
            <h1 style={{ color: paper, fontSize: 22, margin: "10px 0 0", lineHeight: 1.3 }}>
              {windowLabel} at a glance.
            </h1>
          </div>

          <div style={{ padding: "24px 32px", color: charcoal }}>
            {alerts.length > 0 && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 18,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#B91C1C",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  Action needed
                </p>
                <ul style={{ margin: "6px 0 0", padding: "0 0 0 18px", color: "#7F1D1D", fontSize: 13.5 }}>
                  {alerts.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            <table cellPadding={0} cellSpacing={0} style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <Row label="Leads"           value={String(totalLeads)} d={dLeads} />
                <Row label="Tier A leads"    value={String(tierA)}      d={dTierA} sub={`${pct(tierA, totalLeads)} of leads`} />
                <Row label="Bookings paid"   value={String(bookings)}   d={dBookings} />
                <Row label="Gross deposit"   value={fmtINR(grossDeposit)} d={dRev} />
                <Row label="Unresponded Tier A" value={String(unrespondedTierA)} sub="open & status=new" highlight={unrespondedTierA > 0} />
              </tbody>
            </table>

            {topSources.length > 0 && (
              <>
                <h3
                  style={{
                    margin: "24px 0 8px",
                    fontSize: 14,
                    color: slate,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  Top sources today
                </h3>
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial, sans-serif", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${slate}33`, color: slate }}>
                      <th align="left"  style={{ padding: "6px 0" }}>Source</th>
                      <th align="right" style={{ padding: "6px 0" }}>Leads</th>
                      <th align="right" style={{ padding: "6px 0" }}>Tier A</th>
                      <th align="right" style={{ padding: "6px 0" }}>Booked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSources.map((r) => (
                      <tr key={r.src} style={{ borderBottom: `1px solid ${slate}1a` }}>
                        <td style={{ padding: "8px 0", color: charcoal }}>{r.src}</td>
                        <td align="right" style={{ padding: "8px 0", color: charcoal }}>{r.leads}</td>
                        <td align="right" style={{ padding: "8px 0", color: "#15803D" }}>{r.tierA}</td>
                        <td align="right" style={{ padding: "8px 0", color: "#7C3AED" }}>{r.bookings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <div style={{ marginTop: 22, fontSize: 13, fontFamily: "Arial, sans-serif" }}>
              <a
                href={`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com"}/admin/funnel`}
                style={{ color: charcoal, textDecoration: "underline" }}
              >
                Open funnel dashboard →
              </a>
              <span style={{ color: slate, padding: "0 8px" }}>·</span>
              <a
                href={`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com"}/admin/attribution/creatives`}
                style={{ color: charcoal, textDecoration: "underline" }}
              >
                Creative leaderboard →
              </a>
            </div>
          </div>

          <div style={{ background: "#F5EFE1", padding: "12px 32px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 11, color: slate, fontFamily: "Arial, sans-serif", letterSpacing: "0.1em" }}>
              Trust and Trip · Daily Digest · auto-sent at 8 AM IST
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

function Row({
  label,
  value,
  d,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  d?: { sign: string; text: string; color: string };
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <tr style={{ borderBottom: `1px solid ${slate}1a` }}>
      <td style={{ padding: "12px 0", fontSize: 13, color: slate, fontFamily: "Arial, sans-serif" }}>{label}</td>
      <td style={{ padding: "12px 0", textAlign: "right" }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 22, color: highlight ? "#B91C1C" : charcoal, fontWeight: 600 }}>
          {value}
        </span>
        {d && (
          <span style={{ marginLeft: 8, color: d.color, fontSize: 12, fontFamily: "Arial, sans-serif" }}>
            {d.sign} {d.text}
          </span>
        )}
        {sub && (
          <div style={{ fontSize: 11, color: slate, marginTop: 2, fontFamily: "Arial, sans-serif" }}>{sub}</div>
        )}
      </td>
    </tr>
  );
}

function pct(n: number, d: number): string {
  if (!d) return "—";
  return ((n / d) * 100).toFixed(1) + "%";
}
