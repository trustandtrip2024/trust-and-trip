export const revalidate = 600;

import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight, Phone, MessageCircle, Heart, Leaf, ShieldCheck,
  Stethoscope, Mountain, Sun,
} from "lucide-react";
import { getPackages } from "@/lib/sanity-queries";
import PackageCard, { type PackageCardProps } from "@/components/PackageCard";
import PackageCardSkeleton from "@/components/PackageCardSkeleton";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import type { Package } from "@/lib/data";

export const metadata = {
  title: "Pilgrim Yatras — Char Dham, Vaishno Devi, Tirupati & More · Trust and Trip",
  description: "Founder-led pilgrim concierge with doctor-on-call coverage, elder-care pacing, and ground partners at every dham. 37 yatra packages from ₹6,650 — Char Dham, Do Dham, Kashi, Vaishno Devi, Tirupati, Panchkedar.",
  alternates: { canonical: "https://trustandtrip.com/pilgrim" },
  openGraph: {
    title: "Trust and Trip — Pilgrim Concierge",
    description: "Yatras with doctor on call, elder-friendly pacing, and ground partners at every dham. 37 packages from ₹6,650.",
  },
};

function toCardProps(p: Package): PackageCardProps {
  return {
    title: p.title,
    slug: p.slug,
    image: p.image,
    duration: p.duration,
    price: p.price,
    rating: p.rating,
    reviews: p.reviews,
    destinationName: p.destinationName,
    travelType: p.travelType,
    trending: p.trending,
    limitedSlots: p.limitedSlots,
    highlights: p.highlights,
    inclusions: p.inclusions,
    categories: p.categories,
  };
}

const PILGRIM_TITLE_RE = /\b(yatra|char\s*dham|do\s*dham|panchkedar|kedarnath|badrinath|gangotri|yamunotri|kashi|varanasi|vaishno|tirupati|amarnath|shirdi|jagannath|puri|rameshwaram|haridwar|rishikesh|ayodhya|prayagraj)\b/i;

function isPilgrim(p: Package): boolean {
  const cats = (p.categories ?? []).map((c) => c.toLowerCase());
  if (cats.includes("pilgrim") || cats.includes("spiritual")) return true;
  if (PILGRIM_TITLE_RE.test(p.title)) return true;
  return false;
}

const VALUE_PROPS = [
  {
    icon: Stethoscope,
    title: "Doctor on call",
    body: "Every elder yatra ships with a 24/7 doctor line — for altitude headaches, BP spikes, the small things that ruin a trip if ignored. Ground team trained on first-aid + evac SOPs at high-altitude dhams.",
  },
  {
    icon: Heart,
    title: "Elder-friendly pacing",
    body: "Helicopter options for Kedarnath and Yamunotri, palki and pony arrangements pre-booked, slow start days at altitude, and meals timed around darshan windows. We don't push 65-year-olds at trekker pace.",
  },
  {
    icon: ShieldCheck,
    title: "Ground partners at every dham",
    body: "Our own people at Haridwar, Rishikesh, Sonprayag, Guptkashi, Joshimath, Badrinath, Tirupati and Vaishno Devi base. They handle prasad, VIP darshan where available, and the parking/permit headaches you'd otherwise spend the morning on.",
  },
  {
    icon: Leaf,
    title: "From pocket-friendly to private",
    body: "Char Dham road yatras from ₹15,400 ex Lucknow, helicopter Char Dham from ₹2L, Panchkedar 14N15D for ₹29,870. Same standard of care across the price range — different inventory and intensity.",
  },
];

const ROUTES = [
  {
    name: "Char Dham Yatra",
    desc: "Yamunotri · Gangotri · Kedarnath · Badrinath. Road or helicopter. 8–11 nights typical.",
    href: "/packages?category=Pilgrim&search=Char+Dham",
    icon: Mountain,
  },
  {
    name: "Do Dham Yatra",
    desc: "Kedarnath + Badrinath in 6–7 nights. Best for first-timers or shorter windows.",
    href: "/packages/uttarakhand-dodham-road-6n7d",
    icon: Mountain,
  },
  {
    name: "Panchkedar",
    desc: "All five Kedars (Kedarnath, Madhyamaheshwar, Tungnath, Rudranath, Kalpeshwar). Trek + spiritual depth.",
    href: "/packages/panchkedar-itinerary-53",
    icon: Mountain,
  },
  {
    name: "Kashi · Prayagraj · Ayodhya",
    desc: "The classic North-Indian temple circuit. 5–6 nights. Ex Lucknow / Varanasi options.",
    href: "/packages/ayodhya-prayagraj-chitrakoot-varanasi-66",
    icon: Sun,
  },
  {
    name: "Vaishno Devi",
    desc: "Mata Vaishno Devi yatra from Katra. Helicopter and road combinations.",
    href: "/packages?search=Vaishno+Devi",
    icon: Sun,
  },
  {
    name: "Tirupati Balaji",
    desc: "Tirumala darshan with VIP arrangements where available. South India yatra circuits.",
    href: "/packages?search=Tirupati",
    icon: Sun,
  },
];

const FAQS = [
  {
    q: "How is your pilgrim concierge different from a coach yatra?",
    a: "Coach yatras (Veena, IRCTC tour, etc.) run a fixed 35-seat bus on fixed dates with a fixed pace. Our yatras run your group only — your dates, your pace, your vehicle. Doctor on call. Pickup from your city for the ones tagged ex-Lucknow / ex-Haridwar / ex-Delhi. The trade-off: 10–15% more than the bus. The benefit: you're not waiting on 32 strangers at every photo stop.",
  },
  {
    q: "Do you handle helicopter Char Dham bookings?",
    a: "Yes — helicopter Char Dham (Phata to Kedarnath, Govindghat to Badrinath, Sahastradhara to Yamunotri) with operator partnerships. We book the slots, brief the elders on weight/luggage rules, and have a backup road plan if weather grounds the chopper. Helicopter Char Dham starts around ₹2 lakh per person.",
  },
  {
    q: "What if an elder traveller has a medical issue mid-yatra?",
    a: "WhatsApp Akash or your trip director. We have first-aid trained staff at the major bases (Sonprayag, Guptkashi, Joshimath) and a 24/7 doctor line for triage. For serious issues, evac protocols are documented per dham — we know the nearest hospital with high-altitude experience and the helipad timings.",
  },
  {
    q: "Can you arrange palki / pony / pithoo for the Kedarnath / Yamunotri trek?",
    a: "Yes — pre-booked, with weight limits checked against the elder's profile. We don't recommend palki for everyone (it can be uncomfortable on the descent); pony or pithoo is often steadier. The trip director walks you through options at the base.",
  },
  {
    q: "Is the pilgrim concierge only for Hindu yatras?",
    a: "We design Hindu, Sikh (Hemkund Sahib, Patna Sahib, Anandpur Sahib), and inter-faith circuits (Buddhist circuit, Jain Tirthas). Same elder-care SOPs apply across.",
  },
  {
    q: "What's the cheapest yatra you offer?",
    a: "Currently the Ayodhya · Prayagraj · Chitrakoot · Varanasi 5N6D circuit ex Lucknow at ~₹6,650. Char Dham road yatra ex Lucknow runs ~₹15,400. Both keep the doctor-on-call coverage even at the entry tier.",
  },
];

const STATS = [
  { k: "Yatra packages", v: "37" },
  { k: "Doctor coverage", v: "24/7" },
  { k: "Source cities", v: "Lucknow · Haridwar · Delhi" },
  { k: "Repeat families", v: "60%+" },
];

async function PilgrimGrid() {
  const all = await getPackages();
  const pool = all.filter(isPilgrim).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const listLd = pool.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trust and Trip — Pilgrim Yatras",
    numberOfItems: pool.length,
    itemListElement: pool.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://trustandtrip.com/packages/${p.slug}`,
      name: p.title,
    })),
  } : null;

  if (pool.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container-custom max-w-2xl text-center">
          <p className="text-tat-charcoal/65 mb-4">
            Yatras for your dates fill fast. Tell us your group and start city — we&rsquo;ll line up
            options within the day.
          </p>
          <Link
            href="/customize-trip?category=Pilgrim"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-charcoal text-tat-paper font-semibold text-sm hover:bg-tat-charcoal/90"
          >
            Brief a planner <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {listLd && <JsonLd data={listLd} />}
      <section id="trips" className="py-12 md:py-16 scroll-mt-32">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
            <div>
              <span className="eyebrow">Yatra packages</span>
              <h2 className="heading-section mt-2 text-balance">
                {pool.length} yatras,
                <span className="italic text-tat-gold font-light"> dates flexible.</span>
              </h2>
            </div>
            <Link
              href="/packages?category=Pilgrim"
              className="text-sm font-semibold text-tat-charcoal/70 hover:text-tat-gold inline-flex items-center gap-1"
            >
              Filter pilgrim category in /packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {pool.slice(0, 24).map((p) => (
              <PackageCard key={p.slug} {...toCardProps(p)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function GridSkeleton() {
  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => <PackageCardSkeleton key={i} />)}
        </div>
      </div>
    </section>
  );
}

export default function PilgrimPage() {
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Pilgrim Yatras — Trust and Trip",
    description: "Founder-led pilgrim concierge with doctor on call, elder-care pacing, and ground partners at every dham.",
    url: "https://trustandtrip.com/pilgrim",
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

  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={faqLd} />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-14 md:pb-20 bg-tat-charcoal text-tat-paper overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-0 opacity-[0.18]"
          style={{
            background:
              "radial-gradient(ellipse at 25% 20%, rgba(212,175,55,0.5) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(228,140,80,0.35) 0%, transparent 60%)",
          }}
        />
        <div className="container-custom relative">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tat-gold/15 border border-tat-gold/30 text-tat-gold text-[11px] font-semibold uppercase tracking-[0.2em]">
            <Sun className="h-3 w-3" />
            Pilgrim Concierge
          </p>
          <h1 className="mt-4 font-display text-display-lg md:text-display-xl font-medium leading-[1.02] max-w-4xl text-balance">
            Yatras for elders,
            <span className="italic text-tat-gold font-light"> done with care.</span>
          </h1>
          <p className="mt-6 text-tat-paper/75 max-w-2xl leading-relaxed text-base md:text-lg">
            Char Dham, Do Dham, Vaishno Devi, Tirupati, Panchkedar. Founder-led trips with a
            doctor on call, elder-friendly pacing, and our own ground people at every dham —
            not a 35-seat coach trying to keep schedule.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/customize-trip?category=Pilgrim"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm hover:bg-tat-gold/90"
            >
              Brief a yatra <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/918115999588?text=Hi%20Akash!%20I%27d%20like%20to%20brief%20a%20yatra%20for%20my%20family."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-paper/10 hover:bg-tat-paper/15 text-tat-paper border border-tat-paper/20 font-semibold text-sm"
            >
              <Phone className="h-4 w-4" />
              WhatsApp Akash
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

      {/* Value props */}
      <section className="py-14 md:py-20 bg-tat-paper">
        <div className="container-custom">
          <span className="eyebrow">What pilgrim concierge means</span>
          <h2 className="heading-section mt-2 mb-10 max-w-3xl text-balance">
            Four things a coach yatra{" "}
            <span className="italic text-tat-gold font-light">cannot give you.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {VALUE_PROPS.map(({ icon: Icon, title, body }) => (
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

      {/* Routes index */}
      <section className="py-14 md:py-20 bg-tat-cream-warm/30">
        <div className="container-custom">
          <span className="eyebrow">Routes we run</span>
          <h2 className="heading-section mt-2 mb-3 max-w-3xl text-balance">
            From the Himalayas to{" "}
            <span className="italic text-tat-gold font-light">the southern dhams.</span>
          </h2>
          <p className="text-tat-charcoal/65 max-w-2xl mb-10 text-sm leading-relaxed">
            Each route runs at multiple intensities and budgets. Pick a starting point — the
            planner will customise dates, pace, and source city.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROUTES.map((r) => (
              <Link
                key={r.name}
                href={r.href}
                className="group rounded-2xl bg-tat-paper border border-tat-charcoal/8 p-5 hover:border-tat-gold/40 transition-all flex flex-col"
              >
                <div className="h-9 w-9 rounded-full bg-tat-gold/15 flex items-center justify-center mb-3">
                  <r.icon className="h-4 w-4 text-tat-gold" />
                </div>
                <h3 className="font-display text-lg font-medium text-tat-charcoal leading-snug">{r.name}</h3>
                <p className="mt-2 text-sm text-tat-charcoal/65 leading-relaxed flex-1">{r.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-tat-gold group-hover:gap-1.5 transition-all">
                  See packages <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Package grid */}
      <Suspense fallback={<GridSkeleton />}>
        <PilgrimGrid />
      </Suspense>

      {/* FAQs */}
      <section className="py-14 md:py-20 bg-tat-cream-warm/30">
        <div className="container-custom max-w-3xl">
          <span className="eyebrow">Common questions</span>
          <h2 className="heading-section mt-2 mb-6 text-balance">
            What families ask{" "}
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

          <div className="mt-10 rounded-2xl bg-tat-charcoal text-tat-paper p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-tat-gold font-semibold">Ready to brief a yatra?</p>
              <p className="font-display text-xl md:text-2xl mt-1">A planner replies within 9 minutes.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/customize-trip?category=Pilgrim" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm">
                Brief a yatra <ArrowRight className="h-4 w-4" />
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

      <CTASection />
    </>
  );
}
