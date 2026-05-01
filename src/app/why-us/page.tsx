export const revalidate = 86400;

import Link from "next/link";
import {
  ArrowRight, Phone, MessageCircle, Star, Crown, Compass, Wallet,
  ShieldCheck, Sparkles, X, Check,
} from "lucide-react";
import JsonLd from "@/components/JsonLd";

export const metadata = {
  title: "Why Trust and Trip — Founder-Led Travel Across India + 30 Countries",
  description: "What you get with Trust and Trip that aggregators and coach-tour companies can't match: a real planner with their name on your trip, ground partners we own, and a phone that picks up at 2am. Honest comparison vs Veena World and Pickyourtrail.",
  alternates: { canonical: "https://trustandtrip.com/why-us" },
  openGraph: {
    title: "Why Trust and Trip — A Real Travel Agency",
    description: "Founder-led trips across India + 30 countries. Three tiers (Essentials, Signature, Private). Honest comparison with Veena World and Pickyourtrail.",
  },
};

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "A real human builds your trip — not a template",
    body: "Every itinerary is drafted from scratch by a planner who has been to the destination. The same person you message on WhatsApp is the one mapping your route. No call-centre, no copy-paste from last week's customer.",
  },
  {
    icon: Compass,
    title: "Our own ground partners in 8 countries",
    body: "We don't resell OTA inventory dressed up. Hotels, transfers, guides — we work with operators we've vetted in person, in the destination. When a flight cancels at 11pm, our ground partner picks up. When an OTA's does, you're on hold.",
  },
  {
    icon: Crown,
    title: "Three tiers, same standard",
    body: "Essentials (₹15k yatras), Signature (most trips, 4-star anchors), Private (₹1.5L+ bespoke luxury). The same vetting and after-hours coverage applies whether you're booking a Char Dham yatra ex Haridwar or a Switzerland honeymoon.",
  },
  {
    icon: Sparkles,
    title: "Founder-signed itineraries",
    body: "Akash Mishra reviews every trip before it ships. If something feels off — a tight transfer window, a hotel that just slipped — we'll know it before you do, and you'll get the call, not the surprise.",
  },
];

const COMPARISON = [
  {
    row: "Itinerary",
    us: "Built from scratch by a real planner who's been to the destination",
    veena: "Fixed-departure template with locked dates and pace",
    pyt: "Algorithm-generated draft, then handed to a sales agent",
  },
  {
    row: "Group structure",
    us: "Your group only — your dates, your pace, your guide",
    veena: "Coach with 30+ strangers, fixed schedule, buffet meals",
    pyt: "Individual booking — no group lock-in, but no group benefits",
  },
  {
    row: "Ground partners",
    us: "Owned relationships in 8 countries; vetted in person",
    veena: "Bulk-rate hotel chains; little flexibility on choices",
    pyt: "OTA inventory wrapped in a UI; no in-destination relationship",
  },
  {
    row: "After-hours support",
    us: "WhatsApp Akash directly; planner reachable for trip-critical issues",
    veena: "Tour leader on the bus; head office during business hours",
    pyt: "Email queue; chat bot first, agent escalation",
  },
  {
    row: "Source-city pickup",
    us: "Ex-Lucknow, ex-Haridwar, ex-Kanpur and more for India trips",
    veena: "Departures from metros; tier-2/3 cities reach the bus on their own",
    pyt: "Flight ex-metros only; no ground pickup",
  },
  {
    row: "Pricing transparency",
    us: "Per-occupancy breakdown, real comparePrice when we beat OTAs",
    veena: "Bundled package price; per-person on twin sharing",
    pyt: "Per-person on twin sharing; separate quote for solo / triple",
  },
  {
    row: "Customisation",
    us: "Swap a hotel, add a city, extend by 2 nights — included before you pay",
    veena: "Fixed itinerary; pre-departure changes limited",
    pyt: "Customisable, but each change re-prices the whole trip",
  },
  {
    row: "Founder accessible",
    us: "Akash Mishra signs every trip; on WhatsApp 918115999588",
    veena: "Brand ambassadors, not founders; not contactable directly",
    pyt: "VC-funded; founders not in customer loop",
  },
];

const TIERS = [
  {
    name: "Essentials",
    range: "From ₹15k / person",
    desc: "Char Dham yatras, weekend Goa, Kerala 5N6D, family hill trips. Pocket-friendly without cutting corners on planning.",
    href: "/essentials",
    icon: Wallet,
    accent: "bg-tat-orange/15 text-tat-orange-soft border-tat-orange/30",
  },
  {
    name: "Signature",
    range: "From ₹50k / person",
    desc: "The right tier for most trips. 4-star anchors, your group only, source-city pickup, real planner on WhatsApp.",
    href: "/signature",
    icon: Compass,
    accent: "bg-tat-gold/15 text-tat-gold border-tat-gold/30",
  },
  {
    name: "Private",
    range: "From ₹1.5L / person",
    desc: "Bespoke luxury. Premium hotels, private guides, dedicated trip director, founder-signed.",
    href: "/private",
    icon: Crown,
    accent: "bg-tat-charcoal text-tat-paper border-tat-charcoal",
  },
];

const STATS = [
  { k: "Travelers", v: "8,000+" },
  { k: "Destinations", v: "India + 30 countries" },
  { k: "Google rating", v: "4.9★" },
  { k: "Founded", v: "2019" },
];

const FAQS = [
  {
    q: "Aren't you just another travel agency?",
    a: "We're a real one. Most of what's marketed as 'travel agency' online is either a fixed-departure coach company (Veena, Thomas Cook tours) or an OTA wrapper that calls itself a planner (Pickyourtrail, Make My Trip Holidays). We do neither — every itinerary is drafted by a human who's been to the destination, with ground partners we own. The founder personally signs every trip.",
  },
  {
    q: "How is pricing different from Veena World or coach tours?",
    a: "Coach tours quote a fixed price for a fixed group on fixed dates. We quote per-occupancy on your group only, with a comparePrice line where we genuinely beat aggregators (we don't fake one). On the same Char Dham yatra, you may pay 10–15% more than a 35-seat coach, but you get your own vehicle, pace, and guide.",
  },
  {
    q: "Why three tiers and not one?",
    a: "Because a ₹15,000 yatra and a ₹3-lakh Seychelles honeymoon need genuinely different planning depths, ground inventory, and after-hours coverage. Tiering surfaces that — same standard of human planning, different inventory and intensity. A 'one-size' agency either over-charges Essentials customers or under-delivers Private ones.",
  },
  {
    q: "Do you do international trips?",
    a: "Yes — 30+ countries with active ground partnerships in 8 (Bali, Thailand, Vietnam, Sri Lanka, Maldives, Nepal, Bhutan, UAE). For destinations outside that 8, we work through trusted DMC partners we've vetted on prior trips. Multi-country itineraries (Switzerland + Italy, Tanzania + Zanzibar) are a regular thing.",
  },
  {
    q: "What if something goes wrong on the trip?",
    a: "WhatsApp the planner who built your trip. Akash personally takes 2am calls if it's trip-critical (flight cancellation, medical issue). Our pilgrim concierge has a doctor on call for elder yatras. We don't outsource emergencies to a queue.",
  },
  {
    q: "How do I know you're real and not just marketing copy?",
    a: "Read 200+ Google reviews on our profile, talk to Akash directly on +91 81159 99588, or message the WhatsApp button on this site. We list our GST and corporate identity in the footer. We've been at this since 2019 and we're not VC-funded — we grow only as fast as repeat referrals let us.",
  },
];

export default function WhyUsPage() {
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Why Trust and Trip",
    url: "https://trustandtrip.com/why-us",
    description: "Trust and Trip's founder-led travel agency model — comparison with aggregators and coach-tour operators.",
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Trust and Trip",
    url: "https://trustandtrip.com",
    founder: { "@type": "Person", name: "Akash Mishra" },
    foundingDate: "2019",
    areaServed: ["IN", "Worldwide"],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.9,
      reviewCount: 200,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={orgLd} />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-14 md:pb-20 bg-tat-charcoal text-tat-paper overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-0 opacity-[0.18]"
          style={{
            background:
              "radial-gradient(ellipse at 20% 10%, rgba(212,175,55,0.5) 0%, transparent 60%), radial-gradient(ellipse at 90% 90%, rgba(14,124,123,0.45) 0%, transparent 60%)",
          }}
        />
        <div className="container-custom relative">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tat-gold/15 border border-tat-gold/30 text-tat-gold text-[11px] font-semibold uppercase tracking-[0.2em]">
            <Star className="h-3 w-3 fill-tat-gold" />
            Why Trust and Trip
          </p>
          <h1 className="mt-4 font-display text-display-lg md:text-display-xl font-medium leading-[1.02] max-w-4xl text-balance">
            A real travel agency,
            <span className="italic text-tat-gold font-light"> not a marketplace.</span>
          </h1>
          <p className="mt-6 text-tat-paper/75 max-w-2xl leading-relaxed text-base md:text-lg">
            We&rsquo;re a founder-led agency planning trips across India and 30 countries. Every
            itinerary is drafted by a real human who&rsquo;s been to the destination, with
            ground partners we own — and a phone Akash personally picks up if something goes
            sideways at 2am.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/customize-trip"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm hover:bg-tat-gold/90"
            >
              Brief a planner <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/918115999588?text=Hi%20Akash!%20I%27d%20like%20to%20chat%20about%20a%20trip."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-paper/10 hover:bg-tat-paper/15 text-tat-paper border border-tat-paper/20 font-semibold text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Chat with Akash
            </a>
          </div>

          <ul className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 text-[12px] md:text-[13px]">
            {STATS.map((s) => (
              <li key={s.k} className="rounded-2xl bg-tat-paper/5 border border-tat-paper/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-tat-paper/50 font-semibold">{s.k}</p>
                <p className="mt-1 text-tat-paper font-display text-base md:text-lg">{s.v}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Four principles */}
      <section className="py-14 md:py-20 bg-tat-paper">
        <div className="container-custom">
          <span className="eyebrow">What you actually get</span>
          <h2 className="heading-section mt-2 mb-10 max-w-3xl text-balance">
            Four things that matter{" "}
            <span className="italic text-tat-gold font-light">when something goes wrong.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-tat-cream-warm/40 border border-tat-charcoal/8 p-6">
                <div className="h-10 w-10 rounded-full bg-tat-gold/15 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-tat-gold" />
                </div>
                <h3 className="font-display text-lg md:text-xl font-medium text-tat-charcoal">{title}</h3>
                <p className="mt-2 text-sm text-tat-charcoal/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-14 md:py-20 bg-tat-cream-warm/30">
        <div className="container-custom">
          <span className="eyebrow">Honest comparison</span>
          <h2 className="heading-section mt-2 mb-3 max-w-3xl text-balance">
            Trust and Trip vs the alternatives.
          </h2>
          <p className="text-tat-charcoal/65 max-w-2xl mb-10 text-sm leading-relaxed">
            We&rsquo;re not for everyone. Coach tours are cheaper if you don&rsquo;t mind the bus. Aggregator
            sites are faster if you just need a hotel. Here&rsquo;s the unvarnished cut so you can pick
            what fits.
          </p>

          {/* Desktop: 4-column table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-tat-charcoal/8 bg-tat-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-tat-cream-warm/50 text-left">
                  <th className="px-5 py-4 font-semibold text-tat-charcoal/65 text-[11px] uppercase tracking-[0.18em]"></th>
                  <th className="px-5 py-4 font-semibold text-tat-charcoal text-[12px]">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-tat-gold text-tat-gold" />
                      Trust and Trip
                    </span>
                  </th>
                  <th className="px-5 py-4 font-semibold text-tat-charcoal/70 text-[12px]">Veena World / coach tours</th>
                  <th className="px-5 py-4 font-semibold text-tat-charcoal/70 text-[12px]">Pickyourtrail / aggregators</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((c, i) => (
                  <tr key={c.row} className={i % 2 === 0 ? "" : "bg-tat-cream-warm/20"}>
                    <td className="px-5 py-4 text-tat-charcoal/55 text-[11px] uppercase tracking-[0.16em] font-semibold align-top">{c.row}</td>
                    <td className="px-5 py-4 align-top">
                      <span className="inline-flex items-start gap-2 text-tat-charcoal">
                        <Check className="h-4 w-4 text-tat-gold shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{c.us}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top text-tat-charcoal/55 leading-relaxed">{c.veena}</td>
                    <td className="px-5 py-4 align-top text-tat-charcoal/55 leading-relaxed">{c.pyt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="md:hidden space-y-4">
            {COMPARISON.map((c) => (
              <div key={c.row} className="rounded-2xl border border-tat-charcoal/8 bg-tat-paper p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-tat-charcoal/50 font-semibold mb-3">{c.row}</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-tat-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-semibold text-tat-charcoal">Trust and Trip</p>
                      <p className="text-sm text-tat-charcoal/75 mt-0.5 leading-relaxed">{c.us}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <X className="h-4 w-4 text-tat-charcoal/30 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-semibold text-tat-charcoal/55">Coach tours</p>
                      <p className="text-sm text-tat-charcoal/55 mt-0.5 leading-relaxed">{c.veena}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <X className="h-4 w-4 text-tat-charcoal/30 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-semibold text-tat-charcoal/55">Aggregators</p>
                      <p className="text-sm text-tat-charcoal/55 mt-0.5 leading-relaxed">{c.pyt}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three tiers */}
      <section className="py-14 md:py-20 bg-tat-paper">
        <div className="container-custom">
          <span className="eyebrow">Pick your tier</span>
          <h2 className="heading-section mt-2 mb-3 max-w-3xl text-balance">
            Same standard,{" "}
            <span className="italic text-tat-gold font-light">three intensities.</span>
          </h2>
          <p className="text-tat-charcoal/65 max-w-2xl mb-10 text-sm leading-relaxed">
            ₹15k yatras and ₹3-lakh honeymoons need genuinely different inventory. Tiering
            surfaces that without compromising the human-planning standard.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {TIERS.map((t) => (
              <Link
                key={t.name}
                href={t.href}
                className="group rounded-2xl border border-tat-charcoal/8 bg-tat-paper p-6 hover:border-tat-gold/40 hover:bg-tat-cream-warm/30 transition-all flex flex-col"
              >
                <span className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-[0.18em] ${t.accent}`}>
                  <t.icon className="h-3 w-3" />
                  {t.name}
                </span>
                <p className="mt-4 font-display text-2xl font-medium text-tat-charcoal">{t.range}</p>
                <p className="mt-2 text-sm text-tat-charcoal/65 leading-relaxed flex-1">{t.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-tat-gold group-hover:gap-1.5 transition-all">
                  See trips <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Founder block */}
      <section className="py-14 md:py-20 bg-tat-charcoal text-tat-paper">
        <div className="container-custom max-w-4xl">
          <div className="rounded-3xl bg-tat-paper/[0.04] border border-tat-paper/10 p-7 md:p-10">
            <div className="flex items-start gap-5 md:gap-7">
              <div className="shrink-0">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-tat-gold/20 ring-2 ring-tat-gold/40 flex items-center justify-center font-display text-xl md:text-2xl text-tat-gold font-semibold">
                  AM
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">Founder</p>
                <h3 className="mt-1 font-display text-2xl md:text-3xl font-medium leading-tight">
                  Akash Mishra
                </h3>
                <p className="mt-4 text-tat-paper/75 text-base leading-relaxed max-w-2xl">
                  &ldquo;I started Trust and Trip in 2019 because every trip I&rsquo;d ever booked online
                  felt transactional. The agency model is older than the internet for a reason —
                  someone who knows the destination should be the one drafting your route. Six
                  years in, every itinerary still touches my desk before it ships. If something&rsquo;s
                  off, that&rsquo;s on me.&rdquo;
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <a
                    href="https://wa.me/918115999588?text=Hi%20Akash!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp Akash
                  </a>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-tat-paper/80 hover:text-tat-gold"
                  >
                    Read the long version <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 md:py-20 bg-tat-cream-warm/30">
        <div className="container-custom max-w-3xl">
          <span className="eyebrow">Honest answers</span>
          <h2 className="heading-section mt-2 mb-6 text-balance">
            What people actually ask{" "}
            <span className="italic text-tat-gold font-light">before they book.</span>
          </h2>
          <div className="divide-y divide-tat-charcoal/8 rounded-2xl bg-tat-paper border border-tat-charcoal/8">
            {FAQS.map((f, i) => (
              <details key={i} className="group p-5 md:p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-start justify-between gap-4 cursor-pointer">
                  <h3 className="font-display text-base md:text-lg font-medium text-tat-charcoal">{f.q}</h3>
                  <span className="shrink-0 mt-1 h-6 w-6 rounded-full bg-tat-gold/15 text-tat-gold flex items-center justify-center group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-tat-charcoal/70 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 md:py-20 bg-tat-paper">
        <div className="container-custom max-w-4xl">
          <div className="rounded-3xl bg-tat-charcoal text-tat-paper p-7 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">Ready to talk?</p>
              <p className="mt-2 font-display text-2xl md:text-3xl leading-tight">
                Brief a planner, or chat with Akash directly.
              </p>
              <p className="mt-2 text-sm text-tat-paper/70">
                A real reply within 9 minutes during business hours.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/customize-trip" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm">
                Start a brief <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/918115999588"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-paper/10 hover:bg-tat-paper/15 border border-tat-paper/20 font-semibold text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
