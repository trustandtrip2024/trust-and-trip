import "server-only";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";

const COLOR = {
  paper: "#FBF7F1",
  cream: "#F5E6D3",
  creamWarm: "#EFD9BD",
  charcoal: "#2A2A2A",
  charcoalSoft: "#3A3A3A",
  slate: "#6B7280",
  gold: "#C8932A",
  goldSoft: "#E2BE76",
  orange: "#E87B3D",
  orangeSoft: "#F4A876",
  teal: "#0E7C7B",
  tealDeep: "#094948",
  tealMist: "#B5D4D4",
  rule: "#E5DCC9",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR.paper,
    padding: 40,
    fontSize: 10,
    color: COLOR.charcoal,
    fontFamily: "Helvetica",
  },

  cover: { padding: 0, backgroundColor: COLOR.charcoal, color: COLOR.paper },
  coverTealBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 8, backgroundColor: COLOR.teal,
  },
  coverGoldBar: {
    position: "absolute", top: 8, left: 0, right: 0,
    height: 3, backgroundColor: COLOR.gold,
  },
  coverInner: { padding: 48, paddingTop: 80, height: "100%" },
  coverEyebrow: {
    fontSize: 9, letterSpacing: 2.4, textTransform: "uppercase",
    color: COLOR.goldSoft, marginBottom: 14,
  },
  coverTitle: {
    fontSize: 38, fontFamily: "Helvetica-Bold",
    color: COLOR.paper, marginBottom: 10, lineHeight: 1.08,
  },
  coverItalic: {
    fontSize: 22, fontFamily: "Helvetica-Oblique",
    color: COLOR.gold, marginBottom: 36,
  },
  coverSlogan: {
    fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 8,
  },
  coverMeta: {
    marginTop: "auto", paddingTop: 20,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)",
    flexDirection: "row", justifyContent: "space-between",
  },
  coverMetaLabel: {
    fontSize: 7, letterSpacing: 1.6, textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)", marginBottom: 3,
  },
  coverMetaValue: { fontSize: 11, color: COLOR.paper, fontFamily: "Helvetica-Bold" },

  topRule: { height: 2, backgroundColor: COLOR.teal, marginBottom: 18 },
  brandHeader: {
    fontSize: 8, letterSpacing: 2, textTransform: "uppercase",
    color: COLOR.teal, marginBottom: 4, fontFamily: "Helvetica-Bold",
  },
  pageTitle: {
    fontSize: 22, fontFamily: "Helvetica-Bold",
    color: COLOR.charcoal, marginBottom: 4, lineHeight: 1.1,
  },
  pageTitleItalic: {
    fontSize: 22, fontFamily: "Helvetica-Oblique", color: COLOR.gold,
  },
  pageIntro: { fontSize: 10, lineHeight: 1.55, color: COLOR.charcoalSoft, marginTop: 6, marginBottom: 16 },

  eyebrow: {
    fontSize: 8, letterSpacing: 1.6, textTransform: "uppercase",
    color: COLOR.gold, marginBottom: 6, marginTop: 14, fontFamily: "Helvetica-Bold",
  },
  h2: {
    fontSize: 14, fontFamily: "Helvetica-Bold",
    color: COLOR.charcoal, marginBottom: 8, marginTop: 6,
  },
  h3: {
    fontSize: 11, fontFamily: "Helvetica-Bold",
    color: COLOR.charcoal, marginBottom: 4,
  },
  body: { fontSize: 10, lineHeight: 1.55, color: COLOR.charcoalSoft },
  bodyMuted: { fontSize: 9, lineHeight: 1.5, color: COLOR.slate },

  bullet: { flexDirection: "row", marginBottom: 5, paddingRight: 12 },
  bulletDot: { color: COLOR.teal, fontSize: 10, marginRight: 6, fontFamily: "Helvetica-Bold" },
  bulletText: { fontSize: 9.5, color: COLOR.charcoalSoft, flex: 1, lineHeight: 1.45 },

  card: {
    backgroundColor: COLOR.white,
    borderWidth: 1, borderColor: COLOR.rule,
    borderRadius: 6, padding: 12, marginBottom: 8,
  },
  cardCream: {
    backgroundColor: COLOR.cream,
    borderWidth: 1, borderColor: COLOR.rule,
    borderRadius: 6, padding: 12, marginBottom: 8,
  },

  pillarRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  pillar: {
    flex: 1, backgroundColor: COLOR.white,
    borderWidth: 1, borderColor: COLOR.rule, borderRadius: 6, padding: 10,
    borderTopWidth: 3, borderTopColor: COLOR.teal,
  },
  pillarTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: COLOR.tealDeep, marginBottom: 4 },
  pillarBody: { fontSize: 9, color: COLOR.charcoalSoft, lineHeight: 1.4 },

  swatchGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  swatch: {
    width: "48%", flexDirection: "row",
    borderWidth: 1, borderColor: COLOR.rule, borderRadius: 6, overflow: "hidden",
    backgroundColor: COLOR.white,
  },
  swatchChip: { width: 56, height: 56 },
  swatchMeta: { padding: 8, flex: 1 },
  swatchName: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: COLOR.charcoal },
  swatchHex: { fontSize: 8.5, color: COLOR.slate, marginTop: 2, fontFamily: "Courier" },
  swatchUse: { fontSize: 8, color: COLOR.charcoalSoft, marginTop: 3, lineHeight: 1.35 },

  twoCol: { flexDirection: "row", gap: 12, marginBottom: 8 },
  col: {
    flex: 1, backgroundColor: COLOR.white,
    borderWidth: 1, borderColor: COLOR.rule, borderRadius: 6, padding: 10,
  },
  colTeal: { borderTopWidth: 3, borderTopColor: COLOR.teal },
  colOrange: { borderTopWidth: 3, borderTopColor: COLOR.orange },

  doRow: { flexDirection: "row", marginBottom: 5 },
  doMark: { fontSize: 10, fontFamily: "Helvetica-Bold", color: COLOR.teal, width: 14 },
  dontMark: { fontSize: 10, fontFamily: "Helvetica-Bold", color: COLOR.orange, width: 14 },
  doText: { fontSize: 9.5, color: COLOR.charcoalSoft, flex: 1, lineHeight: 1.45 },

  quote: {
    backgroundColor: COLOR.cream,
    padding: 14, borderRadius: 6, marginVertical: 8,
    borderLeftWidth: 3, borderLeftColor: COLOR.gold,
  },
  quoteText: { fontSize: 11, fontFamily: "Helvetica-Oblique", color: COLOR.charcoal, lineHeight: 1.4 },
  quoteAttr: { fontSize: 7.5, letterSpacing: 1.4, textTransform: "uppercase", color: COLOR.gold, marginTop: 6 },

  table: { borderWidth: 1, borderColor: COLOR.rule, borderRadius: 6, marginBottom: 8 },
  trHead: {
    flexDirection: "row", backgroundColor: COLOR.cream,
    borderBottomWidth: 1, borderBottomColor: COLOR.rule,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 0.5, borderBottomColor: COLOR.rule,
  },
  trLast: { flexDirection: "row" },
  th: {
    fontSize: 8, letterSpacing: 1.2, textTransform: "uppercase",
    color: COLOR.tealDeep, fontFamily: "Helvetica-Bold",
    padding: 6,
  },
  td: { fontSize: 9, color: COLOR.charcoalSoft, padding: 6, lineHeight: 1.4 },

  statRow: { flexDirection: "row", gap: 8, marginVertical: 8 },
  stat: {
    flex: 1, backgroundColor: COLOR.charcoal,
    padding: 12, borderRadius: 6, alignItems: "center",
  },
  statValue: { fontSize: 18, color: COLOR.gold, fontFamily: "Helvetica-Bold" },
  statLabel: {
    fontSize: 7, letterSpacing: 1.4, textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)", marginTop: 4,
  },

  footer: {
    position: "absolute", bottom: 18, left: 40, right: 40,
    flexDirection: "row", justifyContent: "space-between",
    fontSize: 7, color: COLOR.slate,
    paddingTop: 6, borderTopWidth: 0.5, borderTopColor: COLOR.rule,
  },
});

function PageFooter({ section }: { section: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>Trust and Trip · Brand Book v1.0 · {section}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Swatch({ name, hex, use }: { name: string; hex: string; use: string }) {
  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchChip, { backgroundColor: hex }]} />
      <View style={styles.swatchMeta}>
        <Text style={styles.swatchName}>{name}</Text>
        <Text style={styles.swatchHex}>{hex}</Text>
        <Text style={styles.swatchUse}>{use}</Text>
      </View>
    </View>
  );
}

export function BrandBookPDF() {
  return (
    <Document
      title="Trust and Trip — Brand Book v1.0"
      author="Trust and Trip Experiences Pvt. Ltd."
      subject="Brand & Marketing Guidelines"
      creator="Trust and Trip"
    >
      {/* ── Cover ────────────────────────────────────────────────── */}
      <Page size="A4" style={styles.cover}>
        <View style={styles.coverTealBar} fixed />
        <View style={styles.coverGoldBar} fixed />
        <View style={styles.coverInner}>
          <Text style={styles.coverEyebrow}>Brand Book · Version 1.0</Text>
          <Text style={styles.coverTitle}>Travel with Trust —</Text>
          <Text style={styles.coverItalic}>Not issues.</Text>
          <Text style={styles.coverSlogan}>Crafting Reliable Travel</Text>
          <Text style={[styles.coverSlogan, { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 4 }]}>
            Brand identity, voice, and marketing direction for Trust and Trip Experiences Pvt. Ltd.
          </Text>

          <View style={styles.coverMeta}>
            <View>
              <Text style={styles.coverMetaLabel}>Issued</Text>
              <Text style={styles.coverMetaValue}>May 2026</Text>
            </View>
            <View>
              <Text style={styles.coverMetaLabel}>Owner</Text>
              <Text style={styles.coverMetaValue}>Akash Mishra, Founder</Text>
            </View>
            <View>
              <Text style={styles.coverMetaLabel}>Audience</Text>
              <Text style={styles.coverMetaValue}>Internal · Designers · Agencies</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.coverMetaLabel}>Site</Text>
              <Text style={styles.coverMetaValue}>trustandtrip.com</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ── 1 · Brand Essence ────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} />
        <Text style={styles.brandHeader}>01 · Brand Essence</Text>
        <Text style={styles.pageTitle}>
          Three pillars, <Text style={styles.pageTitleItalic}>one belief.</Text>
        </Text>
        <Text style={styles.pageIntro}>
          Trust and Trip Experiences Pvt. Ltd. was founded in Noida in 2019 with one mission: make
          travel genuinely worry-free for every kind of traveller. We design personalised holiday
          itineraries with a real human planner across 60+ destinations in India and abroad.
        </Text>

        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            &ldquo;The best trips aren&rsquo;t the ones you plan. They&rsquo;re the ones that are planned for you.&rdquo;
          </Text>
          <Text style={styles.quoteAttr}>— A belief we live by, since day one</Text>
        </View>

        <Text style={styles.eyebrow}>The three pillars</Text>
        <View style={styles.pillarRow}>
          <View style={styles.pillar}>
            <Text style={styles.pillarTitle}>Transparent</Text>
            <Text style={styles.pillarBody}>
              What we quote is what you pay. No hidden fees, no airport upsells, every inclusion listed upfront.
            </Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarTitle}>Reliable</Text>
            <Text style={styles.pillarBody}>
              24-hour itinerary turnaround. Real planner, not a template. Support 8 AM – 10 PM, 6 days a week.
            </Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarTitle}>Trustworthy</Text>
            <Text style={styles.pillarBody}>
              ₹0 to start. You pay only when sure. Transparent cancellation policy across most packages.
            </Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>Brand essentials</Text>
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.th, { flex: 1 }]}>Field</Text>
            <Text style={[styles.th, { flex: 2 }]}>Value</Text>
          </View>
          {[
            ["Legal name", "Trust and Trip Experiences Pvt. Ltd."],
            ["Short name", "Trust and Trip / TAT"],
            ["Slogan (locked)", "Crafting Reliable Travel"],
            ["Anti-tagline", "Travel with Trust — Not issues."],
            ["Founded", "2019, Noida"],
            ["Founder", "Akash Mishra"],
            ["Archetype", "Sage + Caregiver"],
          ].map(([k, v], i, arr) => (
            <View key={k} style={i === arr.length - 1 ? styles.trLast : styles.tr}>
              <Text style={[styles.td, { flex: 1, color: COLOR.tealDeep, fontFamily: "Helvetica-Bold" }]}>{k}</Text>
              <Text style={[styles.td, { flex: 2 }]}>{v}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.eyebrow}>Defensible stats</Text>
        <View style={styles.statRow}>
          {[
            { v: "8,000+", l: "Travelers" },
            { v: "60+", l: "Destinations" },
            { v: "4.9★", l: "Google rating" },
            { v: "2019", l: "Since" },
          ].map((s) => (
            <View key={s.l} style={styles.stat}>
              <Text style={styles.statValue}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.bodyMuted}>
          Every number maps to a verifiable source — Supabase counts, Sanity records, Google Places, or founding date. No vibe numbers.
        </Text>

        <PageFooter section="Essence" />
      </Page>

      {/* ── 2 · Color System ─────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} />
        <Text style={styles.brandHeader}>02 · Color System</Text>
        <Text style={styles.pageTitle}>
          Teal commands. <Text style={styles.pageTitleItalic}>Gold flourishes.</Text>
        </Text>
        <Text style={styles.pageIntro}>
          Locked 2026-04-29. Primary brand voice is teal — &ldquo;trust + travel.&rdquo; Gold is decorative
          only. Orange is the urgency lane, used sparingly. Crimson is killed.
        </Text>

        <Text style={styles.eyebrow}>Primary — Teal</Text>
        <Text style={styles.bodyMuted}>CTAs, links, focus rings, scrollbar, selection. Wherever the user is asked to engage.</Text>
        <View style={[styles.swatchGrid, { marginTop: 8 }]}>
          <Swatch name="tat.teal" hex="#0E7C7B" use="Default brand. CTA buttons, links." />
          <Swatch name="tat.teal-deep" hex="#094948" use="Hover, dark surfaces, deep contrast." />
          <Swatch name="tat.teal-mist" hex="#B5D4D4" use="Tint, success-bg, soft fills." />
        </View>

        <Text style={styles.eyebrow}>Surface canvas</Text>
        <View style={styles.swatchGrid}>
          <Swatch name="tat.cream" hex="#F5E6D3" use="Primary background. Warm canvas." />
          <Swatch name="tat.cream-warm" hex="#EFD9BD" use="Alt background, section bands." />
          <Swatch name="tat.paper" hex="#FBF7F1" use="Card background, light surfaces." />
        </View>

        <Text style={styles.eyebrow}>Accent — Gold (decorative ONLY)</Text>
        <Text style={styles.bodyMuted}>Eyebrows, prices, italic flourishes, badges. Never on CTA buttons.</Text>
        <View style={[styles.swatchGrid, { marginTop: 8 }]}>
          <Swatch name="tat.gold" hex="#C8932A" use="Eyebrows, italic flourish, price chips." />
          <Swatch name="goldSoft (PDF)" hex="#E2BE76" use="On dark surfaces only (PDF, hero overlays)." />
        </View>

        <Text style={styles.eyebrow}>Urgency — Orange</Text>
        <Text style={styles.bodyMuted}>Limited slots, flash deals, countdowns, &ldquo;ends soon.&rdquo; Single warm-bright hue, rationed.</Text>
        <View style={[styles.swatchGrid, { marginTop: 8 }]}>
          <Swatch name="tat.orange" hex="#E87B3D" use="Urgency badges, flash deal tags." />
          <Swatch name="tat.orange-soft" hex="#F4A876" use="Tint, hover, soft urgency state." />
        </View>

        <Text style={styles.eyebrow}>Ground tones</Text>
        <View style={styles.swatchGrid}>
          <Swatch name="tat.charcoal" hex="#2A2A2A" use="Body text, headlines, dark surfaces." />
          <Swatch name="tat.slate" hex="#6B7280" use="Meta text, captions, muted UI." />
        </View>

        <View style={[styles.cardCream, { borderLeftWidth: 3, borderLeftColor: COLOR.orange }]}>
          <Text style={[styles.h3, { color: COLOR.tealDeep }]}>One rule, no exceptions</Text>
          <Text style={styles.body}>
            CTA = teal. Eyebrow / price = gold. Urgency = orange. No crossover. No crimson. No invented hex.
          </Text>
        </View>

        <PageFooter section="Color" />
      </Page>

      {/* ── 3 · Typography ───────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} />
        <Text style={styles.brandHeader}>03 · Typography</Text>
        <Text style={styles.pageTitle}>
          Fraunces for heart. <Text style={styles.pageTitleItalic}>Inter for clarity.</Text>
        </Text>
        <Text style={styles.pageIntro}>
          Two families. Display serif Fraunces sets the literary tone in headlines and italic flourishes.
          Inter handles every body word and UI label. No third typeface.
        </Text>

        <Text style={styles.eyebrow}>Display / Serif</Text>
        <View style={styles.card}>
          <Text style={[styles.h3, { color: COLOR.tealDeep }]}>Fraunces</Text>
          <Text style={styles.body}>var(--font-display) · also serif fallback</Text>
          <Text style={[styles.body, { fontStyle: "italic", color: COLOR.gold, marginTop: 6 }]}>
            Used for h1–h3, hero titles, italic accent flourishes.
          </Text>
        </View>

        <Text style={styles.eyebrow}>Body / Sans</Text>
        <View style={styles.card}>
          <Text style={[styles.h3, { color: COLOR.tealDeep }]}>Inter</Text>
          <Text style={styles.body}>var(--font-sans) · system-ui fallback chain</Text>
          <Text style={styles.bodyMuted}>UI labels, paragraphs, meta, eyebrows.</Text>
        </View>

        <Text style={styles.eyebrow}>Type scale</Text>
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.th, { flex: 1 }]}>Token</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Size (clamp)</Text>
            <Text style={[styles.th, { flex: 1 }]}>Use</Text>
          </View>
          {[
            ["display-xl", "3rem → 6.5rem", "Landing-page hero"],
            ["display-lg", "2.25 → 4.5rem", "Hero h1"],
            ["display", "2 → 3.5rem", "Section h1"],
            ["h1", "1.875 → 2.75rem", "Page h1"],
            ["h2", "1.5 → 2rem", "Section h2"],
            ["h3", "1.25 → 1.5rem", "Subsection"],
            ["lead", "1.0625 → 1.25rem", "Paragraph lead"],
            ["prose", "1.0625rem / 1.7 lh", "Long-form blog"],
            ["body", "1rem / 1.6 lh", "Standard body"],
            ["body-sm", "0.875rem", "Captions, dense UI"],
            ["meta", "0.8125rem", "Helper text"],
            ["eyebrow", "0.75rem · 0.16em", "Uppercase label above heading"],
          ].map(([t, s, u], i, arr) => (
            <View key={t} style={i === arr.length - 1 ? styles.trLast : styles.tr}>
              <Text style={[styles.td, { flex: 1, fontFamily: "Courier", color: COLOR.tealDeep }]}>{t}</Text>
              <Text style={[styles.td, { flex: 1.5, fontFamily: "Courier" }]}>{s}</Text>
              <Text style={[styles.td, { flex: 1 }]}>{u}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.eyebrow}>Signature flourish pattern</Text>
        <View style={styles.cardCream}>
          <Text style={styles.body}>
            Regular display heading + italic gold finisher. One per heading max. Always{" "}
            <Text style={{ fontFamily: "Helvetica-Bold" }}>italic, font-light, tat-gold</Text>.
          </Text>
          <View style={{ marginTop: 8, gap: 4 }}>
            <Text style={[styles.body, { fontFamily: "Helvetica-Oblique" }]}>
              &ldquo;Travel with Trust — <Text style={{ color: COLOR.gold }}>Not issues.</Text>&rdquo;
            </Text>
            <Text style={[styles.body, { fontFamily: "Helvetica-Oblique" }]}>
              &ldquo;Five milestones, <Text style={{ color: COLOR.gold }}>one belief.</Text>&rdquo;
            </Text>
            <Text style={[styles.body, { fontFamily: "Helvetica-Oblique" }]}>
              &ldquo;Real people, <Text style={{ color: COLOR.gold }}>real replies.</Text>&rdquo;
            </Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>Shape & feel</Text>
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.th, { flex: 1 }]}>Token</Text>
            <Text style={[styles.th, { flex: 2 }]}>Value / use</Text>
          </View>
          {[
            ["Radius card", "16px — primary card surface"],
            ["Radius sub", "12px — secondary blocks"],
            ["Radius pill", "9999px — chips, badges, CTAs"],
            ["Shadow soft", "Default surface elevation"],
            ["Shadow glow-teal", "CTA hover, primary actions"],
            ["Shadow glow-gold", "Decorative badges, awards"],
            ["Shadow glow-ember", "Urgency states only"],
            ["Texture grain", "Subtle SVG noise on hero overlays"],
          ].map(([t, v], i, arr) => (
            <View key={t} style={i === arr.length - 1 ? styles.trLast : styles.tr}>
              <Text style={[styles.td, { flex: 1, fontFamily: "Helvetica-Bold", color: COLOR.tealDeep }]}>{t}</Text>
              <Text style={[styles.td, { flex: 2 }]}>{v}</Text>
            </View>
          ))}
        </View>

        <PageFooter section="Typography" />
      </Page>

      {/* ── 4 · Voice & Copy ─────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} />
        <Text style={styles.brandHeader}>04 · Voice & Copy</Text>
        <Text style={styles.pageTitle}>
          Warm, literary, <Text style={styles.pageTitleItalic}>quietly confident.</Text>
        </Text>
        <Text style={styles.pageIntro}>
          Trust and Trip speaks like a thoughtful friend who has actually been there. Sensory before
          superlative. Numbers earn trust; words don&rsquo;t shout. Sage + Caregiver, never Hero.
        </Text>

        <Text style={styles.eyebrow}>Personality dial</Text>
        <View style={styles.twoCol}>
          <View style={[styles.col, styles.colTeal]}>
            <Text style={[styles.h3, { color: COLOR.tealDeep }]}>Yes</Text>
            {[
              "Warm, literary, calm",
              "Slow, intentional pacing",
              "Quiet expertise — show, don't tell",
              "Human-first language",
              "Sensory openers (sight, sound)",
              "Em-dash + reframe",
              "Numerical proof tucked in prose",
            ].map((s) => (
              <View key={s} style={styles.doRow}>
                <Text style={styles.doMark}>+</Text>
                <Text style={styles.doText}>{s}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.col, styles.colOrange]}>
            <Text style={[styles.h3, { color: "#9A4E15" }]}>No</Text>
            {[
              "Hype, salesy, ALL CAPS",
              "Fake urgency, fake countdowns",
              "Boastful, hero-pose copy",
              "Bot-tone or templated voice",
              "Cliché openers (\"Are you ready?\")",
              "Hindi-English mash-ups in body",
              "Cheapest / lowest-price guarantees",
            ].map((s) => (
              <View key={s} style={styles.doRow}>
                <Text style={styles.dontMark}>×</Text>
                <Text style={styles.doText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.eyebrow}>Tone ladder by surface</Text>
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.th, { flex: 1 }]}>Surface</Text>
            <Text style={[styles.th, { flex: 1 }]}>Register</Text>
            <Text style={[styles.th, { flex: 1.6 }]}>Sample</Text>
          </View>
          {[
            ["Hero / dest tagline", "Literary, sensory", "\"Where Turquoise Meets Infinity.\""],
            ["Body prose", "Warm, plain", "\"Wake to the sound of the Indian Ocean.\""],
            ["CTA buttons", "Direct, low-pressure", "\"Get free quote\" / \"Talk to a planner\""],
            ["Trust strip", "Numerical proof", "\"4.9★ · 8,000+ travelers · since 2019\""],
            ["Urgency", "Honest, not fake", "\"10% off — book 60+ days ahead\""],
          ].map(([s, r, ex], i, arr) => (
            <View key={s} style={i === arr.length - 1 ? styles.trLast : styles.tr}>
              <Text style={[styles.td, { flex: 1, fontFamily: "Helvetica-Bold", color: COLOR.tealDeep }]}>{s}</Text>
              <Text style={[styles.td, { flex: 1 }]}>{r}</Text>
              <Text style={[styles.td, { flex: 1.6, fontStyle: "italic", color: COLOR.charcoal }]}>{ex}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.eyebrow}>Words to favor</Text>
        <View style={styles.cardCream}>
          <Text style={styles.body}>
            handcrafted · curated · planner · journey · escape · ritual · sanctuary · worry-free ·
            quietly · transparent · reliable · trustworthy · crafted
          </Text>
        </View>

        <Text style={styles.eyebrow}>Words to ban</Text>
        <View style={[styles.cardCream, { borderLeftWidth: 3, borderLeftColor: COLOR.orange }]}>
          <Text style={styles.body}>
            cheap · deal of a lifetime · UNBELIEVABLE · 🔥 · book now or miss out · act fast ·
            lowest price guaranteed · once-in-a-blue-moon
          </Text>
        </View>

        <Text style={styles.eyebrow}>Naming conventions</Text>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Packages: &ldquo;&lt;Destination&gt; &lt;N&gt;N/&lt;M&gt;D &lt;Theme&gt;&rdquo; — e.g. &ldquo;Bali 4N/5D Honeymoon Escape.&rdquo;
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Experiences: plural noun + tagline — &ldquo;Honeymoon Escapes — Just the two of you. Just the way it should be.&rdquo;
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Pricing: ₹ INR, no decimals, Indian formatting — &ldquo;₹55,000&rdquo; not &ldquo;Rs. 55000.00.&rdquo;
          </Text>
        </View>

        <PageFooter section="Voice" />
      </Page>

      {/* ── 5 · Audience & Channels ──────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} />
        <Text style={styles.brandHeader}>05 · Audience & Channels</Text>
        <Text style={styles.pageTitle}>
          Six segments, <Text style={styles.pageTitleItalic}>one voice.</Text>
        </Text>
        <Text style={styles.pageIntro}>
          Audience tiers below define ticket size and channel weight. Voice never changes — only
          surface and proof points do. A pilgrim landing page and a Maldives honeymoon page share
          the same teal CTA and gold flourish.
        </Text>

        <Text style={styles.eyebrow}>Audience segmentation</Text>
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.th, { flex: 1 }]}>Segment</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>Trips</Text>
            <Text style={[styles.th, { flex: 0.8 }]}>Ticket</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>Top channels</Text>
          </View>
          {[
            ["Honeymoon couples", "Bali, Maldives, Switzerland, Santorini", "₹55K–₹185K", "Instagram, Google, referrals"],
            ["Families (3-gen)", "Dubai, Kerala, Singapore, Thailand", "₹42K–₹120K", "Google search, WhatsApp, WoM"],
            ["Pilgrims", "Char Dham, Kedarnath, Vaishno Devi", "₹15K–₹80K", "SEO blog, regional FB"],
            ["Solo / Wellness", "Kerala Ayurveda, Bali Ubud", "₹35K–₹95K", "Instagram, blog SEO"],
            ["Groups (corp/college)", "Goa, Vietnam, Thailand, Bali", "Bulk", "LinkedIn, direct outreach"],
            ["Budget intl", "Vietnam, Thailand, Nepal, Sri Lanka", "₹30K–₹65K", "SEO blog, Google ads"],
          ].map(([seg, t, p, ch], i, arr) => (
            <View key={seg} style={i === arr.length - 1 ? styles.trLast : styles.tr}>
              <Text style={[styles.td, { flex: 1, fontFamily: "Helvetica-Bold", color: COLOR.tealDeep }]}>{seg}</Text>
              <Text style={[styles.td, { flex: 1.4 }]}>{t}</Text>
              <Text style={[styles.td, { flex: 0.8, fontFamily: "Courier" }]}>{p}</Text>
              <Text style={[styles.td, { flex: 1.2 }]}>{ch}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.eyebrow}>Channel playbook</Text>

        <View style={styles.card}>
          <Text style={[styles.h3, { color: COLOR.tealDeep }]}>Instagram · @trust_and_trip</Text>
          <Text style={styles.body}>
            Reels: sensory POV (drone, train, houseboat dawn). No talking heads.
            Static: italic-gold flourish quote on photo. Cadence: 4 reels/wk, 3 statics/wk, daily stories.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.h3, { color: COLOR.tealDeep }]}>Google / SEO — highest yield</Text>
          <Text style={styles.body}>
            Long-form guides (Char Dham, Phu Quoc, affordable countries). Real dates, real prices, 2K+ words.
            Destination pages already carry bestTimeToVisit, idealDuration, priceFrom — push internal linking.
            Schema: AboutPage + Person + TravelAgency live; add Trip schema to package pages.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.h3, { color: COLOR.tealDeep }]}>WhatsApp · +91 81159 99588</Text>
          <Text style={styles.body}>
            Default planner channel since 2021. Lead capture → instant ack within 5 min, 8 AM – 10 PM.
            Templated welcome: warm + a specific question, never a generic auto-reply.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.h3, { color: COLOR.tealDeep }]}>Email · Resend transactional + newsletter</Text>
          <Text style={styles.body}>
            Transactional already wired (lead, booking, payment). Build monthly newsletter:
            &ldquo;where Indians are travelling next month&rdquo; + a founder note. React Email templates in src/lib/emails/.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.h3, { color: COLOR.tealDeep }]}>Bitrix24 CRM</Text>
          <Text style={styles.body}>
            Every lead, booking, and newsletter signup pushes to Bitrix24. UF custom fields drive segmentation.
            Pipeline stages mirror site state: created → verified → confirmed.
          </Text>
        </View>

        <PageFooter section="Channels" />
      </Page>

      {/* ── 6 · Campaigns & Don'ts ───────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} />
        <Text style={styles.brandHeader}>06 · Campaigns & Guardrails</Text>
        <Text style={styles.pageTitle}>
          Five anchors, <Text style={styles.pageTitleItalic}>zero compromises.</Text>
        </Text>
        <Text style={styles.pageIntro}>
          Five campaign anchors are ready to run. The don&rsquo;t list below is non-negotiable —
          breaking any item dilutes the brand more than any short-term lift can recover.
        </Text>

        <Text style={styles.eyebrow}>Campaign anchors (ready to run)</Text>
        {[
          ["1. \"Pay only when sure\"", "Hero claim. Lead-gen ad: ₹0 to start. A planner builds your itinerary in 24 hours."],
          ["2. 10% Early Bird", "Book 60+ days ahead. Already on About + footer. Push to landing pages + emails."],
          ["3. Char Dham 2026", "Seasonal SEO peak Mar–Jun. Existing blog ranks; layer paid in May."],
          ["4. \"Crafted since 2019\"", "Trust narrative. Founder-led video on About page + LinkedIn."],
          ["5. Aria — AI co-pilot", "2026 milestone. Position WITH planner, not replacing. PR + product-page tile."],
        ].map(([t, b]) => (
          <View key={t} style={styles.card}>
            <Text style={[styles.h3, { color: COLOR.tealDeep }]}>{t}</Text>
            <Text style={styles.body}>{b}</Text>
          </View>
        ))}

        <Text style={styles.eyebrow}>Brand don&rsquo;ts (compliance checklist)</Text>
        {[
          "Stock photos with whitened smiles. Use real client photos when possible.",
          "Fake countdowns or \"X people viewing now.\" Dynamic pricing module is cosmetic — never claim it as live inventory.",
          "Crimson red anywhere. Killed.",
          "Gold on CTA buttons. Teal only.",
          "Multiple italic flourishes per heading. One.",
          "Hindi-English mash-ups in body copy. Reserve regional language for pilgrim / regional pages.",
          "Talking-head founder pitch reels. Founder appears in still + voiceover, not pitch.",
          "\"Lowest price guaranteed.\" Off-brand. We compete on care.",
        ].map((s, i) => (
          <View key={i} style={styles.doRow}>
            <Text style={styles.dontMark}>×</Text>
            <Text style={styles.doText}>{s}</Text>
          </View>
        ))}

        <PageFooter section="Campaigns" />
      </Page>

      {/* ── 7 · Asset gaps + contact ─────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule} />
        <Text style={styles.brandHeader}>07 · Asset Inventory & Contact</Text>
        <Text style={styles.pageTitle}>
          What we have. <Text style={styles.pageTitleItalic}>What we owe.</Text>
        </Text>
        <Text style={styles.pageIntro}>
          Asset gaps below are owned actions for design, content, and ops teams.
          When commissioning external creative, hand this brand book + the gaps list to the agency.
        </Text>

        <Text style={styles.eyebrow}>Open asset gaps</Text>
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.th, { flex: 1.6 }]}>Asset</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>Status</Text>
            <Text style={[styles.th, { flex: 0.7 }]}>Owner</Text>
          </View>
          {[
            ["Logo SVG kit (mono / reversed)", "Only /icon.svg today — full kit needed", "Design"],
            ["Founder bio reel (60s)", "Missing", "Content"],
            ["Destination cinemagraphs", "Unsplash fallback in use", "Content"],
            ["Email visual refresh", "Functional, not fully styled", "Dev"],
            ["IG quote-card template", "Ad-hoc each post", "Design"],
            ["WhatsApp Business profile", "Verify catalog + welcome msg", "Ops"],
            ["Google Business Profile photos", "Refresh quarterly", "Ops"],
          ].map(([a, s, o], i, arr) => (
            <View key={a} style={i === arr.length - 1 ? styles.trLast : styles.tr}>
              <Text style={[styles.td, { flex: 1.6, fontFamily: "Helvetica-Bold", color: COLOR.tealDeep }]}>{a}</Text>
              <Text style={[styles.td, { flex: 1.4 }]}>{s}</Text>
              <Text style={[styles.td, { flex: 0.7 }]}>{o}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.eyebrow}>Contact</Text>
        <View style={styles.cardCream}>
          <Text style={styles.h3}>Trust and Trip Experiences Pvt. Ltd.</Text>
          <Text style={styles.body}>R-607, Amrapali Princely, Sector 71, Noida 201301, Uttar Pradesh, India</Text>
          <Text style={[styles.body, { marginTop: 6 }]}>
            Phone: <Link src="tel:+918115999588" style={{ color: COLOR.teal }}>+91 8115 999 588</Link> · <Link src="tel:+917275999588" style={{ color: COLOR.teal }}>+91 7275 999 588</Link>
          </Text>
          <Text style={styles.body}>
            Email: <Link src="mailto:hello@trustandtrip.com" style={{ color: COLOR.teal }}>hello@trustandtrip.com</Link>
          </Text>
          <Text style={styles.body}>
            Web: <Link src="https://trustandtrip.com" style={{ color: COLOR.teal }}>trustandtrip.com</Link>
          </Text>
          <Text style={[styles.bodyMuted, { marginTop: 6 }]}>Hours: 8 AM – 10 PM · Tuesday closed</Text>
        </View>

        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            &ldquo;Trust and Trip = Crafting Reliable Travel. Teal CTA. Gold flourish. Cream canvas.
            Voice = literary, calm, human. Numbers earn trust; words don&rsquo;t shout.&rdquo;
          </Text>
          <Text style={styles.quoteAttr}>— Brand book v1.0 · laminate this page</Text>
        </View>

        <PageFooter section="Inventory" />
      </Page>
    </Document>
  );
}
