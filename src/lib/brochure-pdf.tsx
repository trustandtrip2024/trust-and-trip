import "server-only";
import { Document, Page, Text, View, StyleSheet, Image, Link } from "@react-pdf/renderer";
import type { Package } from "./data";

// Brand palette mirrored from Tailwind config so the PDF reads as a
// natural continuation of the website. Hex values, not Tailwind tokens —
// react-pdf doesn't speak Tailwind.
const COLOR = {
  paper: "#FBF7F1",
  cream: "#F5EFE3",
  charcoal: "#2A2A2A",
  charcoalSoft: "#3A3A3A",
  slate: "#6B6B6B",
  gold: "#C8932A",
  goldSoft: "#E2BE76",
  orange: "#E87B3D",
  teal: "#0E7C7B",
  rule: "#E5DCC9",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR.paper,
    padding: 36,
    fontSize: 10,
    color: COLOR.charcoal,
    fontFamily: "Helvetica",
  },

  // ── Cover page ─────────────────────────────────────────────────────
  cover: { padding: 0, backgroundColor: COLOR.charcoal, color: COLOR.paper },
  coverImage: { width: "100%", height: 320, objectFit: "cover" },
  coverGoldBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 6, backgroundColor: COLOR.gold,
  },
  coverContent: { padding: 36, paddingTop: 28 },
  coverEyebrow: {
    fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
    color: COLOR.goldSoft, marginBottom: 8,
  },
  coverTitle: {
    fontSize: 28, fontWeight: 700, lineHeight: 1.18,
    color: COLOR.paper, marginBottom: 14, fontFamily: "Helvetica-Bold",
  },
  coverMeta: { flexDirection: "row", gap: 16, marginBottom: 24 },
  coverMetaItem: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6,
  },
  coverMetaLabel: {
    fontSize: 7, letterSpacing: 1.4, textTransform: "uppercase",
    color: COLOR.goldSoft, marginBottom: 2,
  },
  coverMetaValue: { fontSize: 11, color: COLOR.paper, fontFamily: "Helvetica-Bold" },
  coverPriceRow: {
    marginTop: 12, paddingTop: 14, borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
  },
  coverPriceLabel: { fontSize: 9, color: "rgba(255,255,255,0.7)" },
  coverPriceValue: { fontSize: 24, color: COLOR.gold, fontFamily: "Helvetica-Bold" },
  coverFooter: {
    position: "absolute", bottom: 24, left: 36, right: 36,
    flexDirection: "row", justifyContent: "space-between",
    fontSize: 8, color: "rgba(255,255,255,0.6)",
  },

  // ── Section page ───────────────────────────────────────────────────
  topRule: { height: 2, backgroundColor: COLOR.gold, marginBottom: 16 },
  brand: {
    fontSize: 8, letterSpacing: 2, textTransform: "uppercase",
    color: COLOR.gold, marginBottom: 4, fontFamily: "Helvetica-Bold",
  },
  pageTitle: {
    fontSize: 18, fontFamily: "Helvetica-Bold",
    color: COLOR.charcoal, marginBottom: 14,
  },
  eyebrow: {
    fontSize: 8, letterSpacing: 1.6, textTransform: "uppercase",
    color: COLOR.gold, marginBottom: 4, marginTop: 14, fontFamily: "Helvetica-Bold",
  },
  h2: {
    fontSize: 14, fontFamily: "Helvetica-Bold",
    color: COLOR.charcoal, marginBottom: 8,
  },
  h3: {
    fontSize: 11, fontFamily: "Helvetica-Bold",
    color: COLOR.charcoal, marginBottom: 4,
  },
  body: { fontSize: 10, lineHeight: 1.5, color: COLOR.charcoalSoft },
  bullet: {
    flexDirection: "row", marginBottom: 4, paddingRight: 12,
  },
  bulletDot: {
    color: COLOR.gold, fontSize: 10, marginRight: 6, fontFamily: "Helvetica-Bold",
  },
  bulletText: { fontSize: 9.5, color: COLOR.charcoalSoft, flex: 1, lineHeight: 1.4 },

  // Day card
  dayCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: COLOR.rule,
    borderRadius: 6, padding: 12, marginBottom: 8,
  },
  dayPill: {
    fontSize: 7, letterSpacing: 1.6, textTransform: "uppercase",
    color: COLOR.paper, backgroundColor: COLOR.charcoal,
    alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 2, marginBottom: 6, fontFamily: "Helvetica-Bold",
  },
  dayTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: COLOR.charcoal, marginBottom: 4 },
  mealRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  mealPill: {
    fontSize: 7, color: COLOR.gold, borderWidth: 1, borderColor: COLOR.gold,
    borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1,
  },

  // Two-column inclusions / exclusions
  twoCol: { flexDirection: "row", gap: 14 },
  col: {
    flex: 1, backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: COLOR.rule, borderRadius: 6, padding: 10,
  },

  // Hotel card
  hotelCard: {
    flexDirection: "row", gap: 10, marginBottom: 8,
    backgroundColor: COLOR.cream, borderRadius: 6, padding: 10,
    borderWidth: 1, borderColor: COLOR.rule,
  },
  hotelMeta: {
    fontSize: 7, color: COLOR.gold, marginBottom: 2,
    letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "Helvetica-Bold",
  },

  // Footer
  footer: {
    position: "absolute", bottom: 18, left: 36, right: 36,
    flexDirection: "row", justifyContent: "space-between",
    fontSize: 7, color: COLOR.slate,
    paddingTop: 6, borderTopWidth: 0.5, borderTopColor: COLOR.rule,
  },
});

interface BrochureProps {
  pkg: Package;
}

function fmtINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function PageFooter({ slug }: { slug: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>trustandtrip.com/packages/{slug}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

/**
 * Server-rendered package brochure. Three logical pages:
 *   1. Cover — hero image + title + key meta + headline price
 *   2. Overview + itinerary — why this trip, day-by-day plan
 *   3. Inclusions / hotels / contact — fine print + how to book
 *
 * Page breaks driven by `break` prop on Pages so all itinerary days
 * stay together where possible. react-pdf flows long content
 * automatically, so a 14-day itinerary will spill onto a 4th page
 * naturally.
 */
export function BrochurePDF({ pkg }: BrochureProps) {
  const meta = [
    { label: "Duration", value: pkg.duration },
    { label: "Type", value: pkg.travelType },
    { label: "Destination", value: pkg.destinationName },
  ];

  return (
    <Document
      title={`${pkg.title} — Trust and Trip`}
      author="Trust and Trip"
      subject={pkg.description}
      creator="Trust and Trip"
    >
      {/* ── Cover ────────────────────────────────────────────────── */}
      <Page size="A4" style={styles.cover}>
        <View style={styles.coverGoldBar} fixed />
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={pkg.heroImage} style={styles.coverImage} />
        <View style={styles.coverContent}>
          <Text style={styles.coverEyebrow}>Trust and Trip · Trip brochure</Text>
          <Text style={styles.coverTitle}>{pkg.title}</Text>
          <View style={styles.coverMeta}>
            {meta.map((m) => (
              <View key={m.label} style={styles.coverMetaItem}>
                <Text style={styles.coverMetaLabel}>{m.label}</Text>
                <Text style={styles.coverMetaValue}>{m.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.coverPriceRow}>
            <View>
              <Text style={styles.coverPriceLabel}>Starting from</Text>
              <Text style={styles.coverPriceValue}>{fmtINR(pkg.price)} <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>/ person</Text></Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.coverPriceLabel}>Itinerary code</Text>
              <Text style={{ fontSize: 11, color: COLOR.paper, fontFamily: "Helvetica-Bold" }}>{pkg.slug.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <View style={styles.coverFooter} fixed>
          <Text>trustandtrip.com</Text>
          <Text>+91 81159 99588 · plan@trustandtrip.com</Text>
        </View>
      </Page>

      {/* ── Overview + itinerary ─────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} />
        <Text style={styles.brand}>Trust and Trip · Trip brochure</Text>
        <Text style={styles.pageTitle}>{pkg.title}</Text>

        {pkg.bestFor && (
          <Text style={[styles.body, { fontStyle: "italic", color: COLOR.gold, marginBottom: 8 }]}>
            Best for: {pkg.bestFor}
          </Text>
        )}

        <Text style={styles.body}>{pkg.description}</Text>

        {pkg.whyThisPackage && pkg.whyThisPackage.length > 0 && (
          <>
            <Text style={styles.eyebrow}>Why this package</Text>
            {pkg.whyThisPackage.slice(0, 4).map((b, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </>
        )}

        {pkg.highlights && pkg.highlights.length > 0 && (
          <>
            <Text style={styles.eyebrow}>Tour highlights</Text>
            {pkg.highlights.slice(0, 8).map((h, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>✓</Text>
                <Text style={styles.bulletText}>{h}</Text>
              </View>
            ))}
          </>
        )}

        {pkg.itinerary.length > 0 && (
          <>
            <Text style={styles.eyebrow}>Day-by-day</Text>
            {pkg.itinerary.map((d, i) => {
              const dayNum = d.day ?? i + 1;
              const meals: string[] = [];
              if (d.meals?.breakfast) meals.push("B");
              if (d.meals?.lunch) meals.push("L");
              if (d.meals?.dinner) meals.push("D");
              return (
                <View key={i} style={styles.dayCard} wrap={false}>
                  <Text style={styles.dayPill}>DAY {dayNum}</Text>
                  <Text style={styles.dayTitle}>{d.title}</Text>
                  <Text style={styles.body}>{d.description}</Text>
                  {meals.length > 0 && (
                    <View style={styles.mealRow}>
                      {meals.map((m) => (
                        <Text key={m} style={styles.mealPill}>Meal: {m}</Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        <PageFooter slug={pkg.slug} />
      </Page>

      {/* ── Inclusions / hotels / contact ────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} />
        <Text style={styles.brand}>Trust and Trip · Fine print</Text>
        <Text style={styles.pageTitle}>What&rsquo;s in — and what&rsquo;s not.</Text>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={[styles.h3, { color: COLOR.gold }]}>Included</Text>
            {pkg.inclusions.slice(0, 14).map((item, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>✓</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
            {pkg.inclusions.length === 0 && (
              <Text style={styles.body}>Standard inclusions — see website.</Text>
            )}
          </View>
          <View style={styles.col}>
            <Text style={[styles.h3, { color: COLOR.slate }]}>Not included</Text>
            {pkg.exclusions.slice(0, 14).map((item, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={[styles.bulletDot, { color: COLOR.slate }]}>×</Text>
                <Text style={[styles.bulletText, { color: COLOR.slate }]}>{item}</Text>
              </View>
            ))}
            {pkg.exclusions.length === 0 && (
              <Text style={styles.body}>Common: international flights, visas, personal expenses.</Text>
            )}
          </View>
        </View>

        {/* Hotels — multi-city array preferred, single-hotel fallback */}
        {pkg.hotels && pkg.hotels.length > 0 ? (
          <>
            <Text style={styles.eyebrow}>Where you&rsquo;ll stay</Text>
            {pkg.hotels.map((h, i) => (
              <View key={i} style={styles.hotelCard} wrap={false}>
                <View style={{ flex: 1 }}>
                  {(h.city || typeof h.nights === "number") && (
                    <Text style={styles.hotelMeta}>
                      {h.city ?? ""}{h.city && h.nights ? " · " : ""}{typeof h.nights === "number" ? `${h.nights} night${h.nights === 1 ? "" : "s"}` : ""}
                    </Text>
                  )}
                  <Text style={styles.h3}>{h.name}{typeof h.stars === "number" ? ` · ${h.stars}★` : ""}</Text>
                  {h.description && <Text style={styles.body}>{h.description}</Text>}
                </View>
              </View>
            ))}
          </>
        ) : pkg.hotel?.name ? (
          <>
            <Text style={styles.eyebrow}>Where you&rsquo;ll stay</Text>
            <View style={styles.hotelCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.h3}>{pkg.hotel.name}{typeof pkg.hotel.stars === "number" ? ` · ${pkg.hotel.stars}★` : ""}</Text>
                {pkg.hotel.description && <Text style={styles.body}>{pkg.hotel.description}</Text>}
              </View>
            </View>
          </>
        ) : null}

        {/* Contact */}
        <Text style={styles.eyebrow}>How to book</Text>
        <Text style={styles.body}>
          Reply to this brochure on email at{" "}
          <Link src="mailto:plan@trustandtrip.com" style={{ color: COLOR.gold }}>plan@trustandtrip.com</Link>
          {" "}or WhatsApp{" "}
          <Link src="https://wa.me/918115999588" style={{ color: COLOR.gold }}>+91 81159 99588</Link>
          {" "}with your dates and we&rsquo;ll have a planner build a draft itinerary within 24 hours.
        </Text>
        <Text style={[styles.body, { marginTop: 8, color: COLOR.slate, fontSize: 8.5 }]}>
          Prices are per person on twin sharing unless stated. Free cancellation up to 30 days before departure on most packages. Final quote subject to dates, room mix, and add-ons.
        </Text>

        <PageFooter slug={pkg.slug} />
      </Page>
    </Document>
  );
}
