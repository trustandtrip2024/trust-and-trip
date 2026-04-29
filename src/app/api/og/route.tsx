import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const revalidate = 86400; // 24 h CDN cache

const BRAND = {
  paper: "#FBF7F1",
  charcoal: "#2A2A2A",
  gold: "#C8932A",
  teal: "#0E7C7B",
  orange: "#E87B3D",
};

function fmtINR(n: number): string {
  return n.toLocaleString("en-IN");
}

// Module-scoped font cache — survives across warm invocations on the same
// edge instance so we only pay the Google Fonts fetch once per region.
let _interSemibold: ArrayBuffer | null = null;
let _interBold: ArrayBuffer | null = null;

async function loadFont(weight: 600 | 700): Promise<ArrayBuffer | null> {
  if (weight === 600 && _interSemibold) return _interSemibold;
  if (weight === 700 && _interBold) return _interBold;

  // Google Fonts CSS API → extract the .woff2 URL → fetch the binary.
  // Edge runtime supports fetch; ImageResponse accepts ArrayBuffer.
  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\((https:[^)]+)\)\s*format\('woff2'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    const buf = await fontRes.arrayBuffer();
    if (weight === 600) _interSemibold = buf;
    else _interBold = buf;
    return buf;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const title = (searchParams.get("title") || "Trust and Trip — Trips made just for you").slice(0, 96);
  const dest = (searchParams.get("dest") || "").slice(0, 32);
  const eyebrow = (searchParams.get("eyebrow") || "Trust and Trip").slice(0, 28);
  const priceParam = searchParams.get("price");
  const ratingParam = searchParams.get("rating");
  const reviewsParam = searchParams.get("reviews");

  const price = priceParam ? Number(priceParam) : null;
  const rating = ratingParam ? Number(ratingParam) : 4.9;
  const reviews = reviewsParam ? Number(reviewsParam) : 200;

  const [interSemi, interBold] = await Promise.all([loadFont(600), loadFont(700)]);
  const fonts: Array<{
    name: string;
    data: ArrayBuffer;
    weight: 600 | 700;
    style: "normal";
  }> = [];
  if (interSemi) fonts.push({ name: "Inter", data: interSemi, weight: 600, style: "normal" });
  if (interBold) fonts.push({ name: "Inter", data: interBold, weight: 700, style: "normal" });
  const fontFamily = fonts.length
    ? "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    : "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BRAND.paper,
          padding: "72px 80px",
          fontFamily,
          color: BRAND.charcoal,
          position: "relative",
        }}
      >
        {/* gold corner ribbon */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 8,
            background: `linear-gradient(90deg, ${BRAND.gold} 0%, ${BRAND.orange} 60%, ${BRAND.teal} 100%)`,
          }}
        />

        {/* eyebrow + destination chip */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontSize: 20,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: BRAND.charcoal,
              fontWeight: 600,
            }}
          >
            {eyebrow}
          </span>
          {dest && (
            <span
              style={{
                fontSize: 18,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: BRAND.paper,
                background: BRAND.teal,
                padding: "6px 16px",
                borderRadius: 999,
                fontWeight: 600,
                display: "flex",
              }}
            >
              {dest}
            </span>
          )}
        </div>

        {/* title — wraps; up to 3 lines */}
        <div
          style={{
            marginTop: 48,
            fontSize: 76,
            lineHeight: 1.05,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            display: "flex",
            color: BRAND.charcoal,
            maxWidth: "90%",
          }}
        >
          {title}
        </div>

        {/* price + rating row pinned to bottom */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {price ? (
              <>
                <span style={{ fontSize: 18, color: BRAND.charcoal, opacity: 0.6, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  From
                </span>
                <span style={{ fontSize: 56, fontWeight: 700, color: BRAND.charcoal, letterSpacing: "-0.01em" }}>
                  ₹{fmtINR(price)}
                </span>
              </>
            ) : (
              <span style={{ fontSize: 28, color: BRAND.charcoal, opacity: 0.7, fontStyle: "italic" }}>
                A real planner. An itinerary in 24 hours.
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: BRAND.gold }}>★</span>
              <span style={{ fontSize: 36, fontWeight: 700, color: BRAND.charcoal }}>
                {rating.toFixed(1)}
              </span>
            </div>
            <span style={{ fontSize: 18, color: BRAND.charcoal, opacity: 0.6 }}>
              {fmtINR(reviews)}+ verified reviews
            </span>
            <span
              style={{
                fontSize: 18,
                color: BRAND.paper,
                background: BRAND.charcoal,
                padding: "8px 18px",
                borderRadius: 999,
                fontWeight: 600,
                marginTop: 8,
                display: "flex",
              }}
            >
              trustandtrip.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length ? fonts : undefined,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      },
    },
  );
}
