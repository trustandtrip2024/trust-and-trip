import LeadForm from "@/components/LeadForm";
import IntentAnchor from "@/components/IntentAnchor";
import JsonLd from "@/components/JsonLd";
import { Mail, MapPin, Phone, Clock, MessageCircle, Sparkles, Star, ShieldCheck, ChevronDown } from "lucide-react";

export const metadata = {
  title: "Contact — Trust and Trip",
  description: "Talk to our planners. Real humans, real replies, 8 AM to 10 PM IST.",
  alternates: { canonical: "https://trustandtrip.com/contact" },
};

const OFFICE_ADDRESS =
  "R-607, Amrapali Princely, Noida Sector 71, Gautambuddh Nagar 201301";
const PHONE_PRIMARY = "+91 8115 999 588";
const PHONE_SECONDARY = "+91 7275 999 588";
const EMAIL = "hello@trustandtrip.com";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How fast will I hear back?",
    a: "Most enquiries receive a reply within 2 hours during office hours (8 AM – 10 PM IST). On WhatsApp the average response time is under 9 minutes.",
  },
  {
    q: "What information should I include?",
    a: "Destination(s) you're considering, rough travel dates, group size and a budget range per person. Even a half-formed idea works — a planner shapes it from there.",
  },
  {
    q: "Do I have to pay anything to receive an itinerary?",
    a: "No. We send a free, fully-customised itinerary first. You only commit a 30% deposit (min ₹5,000) when you say yes. Free changes for 48 hours after delivery.",
  },
  {
    q: "Can the trip be customised?",
    a: "Every itinerary is built from a blank page for your group. We swap hotels, days, activities and pace until it fits — at no extra fee.",
  },
  {
    q: "Do you handle international trips?",
    a: "Yes — Bali, Maldives, Switzerland, Thailand, Vietnam, Sri Lanka, Singapore, Dubai, Europe and more. We also share visa checklists for each.",
  },
];

export default function ContactPage() {
  const contactLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact — Trust and Trip",
    url: "https://trustandtrip.com/contact",
    mainEntity: {
      "@type": "TravelAgency",
      name: "Trust and Trip",
      url: "https://trustandtrip.com",
      email: EMAIL,
      telephone: PHONE_PRIMARY,
      address: {
        "@type": "PostalAddress",
        streetAddress: "R-607, Amrapali Princely, Sector 71",
        addressLocality: "Noida",
        addressRegion: "Uttar Pradesh",
        postalCode: "201301",
        addressCountry: "IN",
      },
      contactPoint: [
        { "@type": "ContactPoint", telephone: PHONE_PRIMARY,   contactType: "customer service", areaServed: "IN", availableLanguage: ["English", "Hindi"] },
        { "@type": "ContactPoint", telephone: PHONE_SECONDARY, contactType: "customer service", areaServed: "IN", availableLanguage: ["English", "Hindi"] },
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "08:00",
          closes: "22:00",
        },
      ],
    },
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

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(OFFICE_ADDRESS)}&output=embed`;

  return (
    <>
      <JsonLd data={contactLd} />
      <JsonLd data={faqLd} />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-8 bg-tat-paper">
        <div className="container-custom max-w-5xl">
          <span className="eyebrow">Get in touch</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] text-balance">
            Let&rsquo;s talk
            <span className="italic text-tat-gold font-light"> itineraries.</span>
          </h1>
          <p className="mt-4 text-tat-charcoal/60 max-w-xl leading-relaxed">
            Drop a line, a voice note, or a half-formed idea. Our planners will pick it up
            and turn it into something worth traveling for.
          </p>
        </div>
      </section>

      {/* Trust ribbon */}
      <section aria-label="Why reach out" className="border-y border-tat-charcoal/8 bg-tat-paper">
        <div className="container-custom py-4 md:py-5">
          <ul role="list" className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 text-[12px] md:text-[13px]">
            <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70">
              <Star className="h-4 w-4 fill-tat-gold text-tat-gold" />
              <span><strong className="font-semibold text-tat-charcoal">4.9</strong> · 200+ Google reviews</span>
            </li>
            <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70">
              <Sparkles className="h-4 w-4 text-tat-gold" />
              <span>Avg. response under <strong className="font-semibold text-tat-charcoal">9 minutes</strong></span>
            </li>
            <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70">
              <ShieldCheck className="h-4 w-4 text-tat-gold" />
              <span><strong className="font-semibold text-tat-charcoal">₹0</strong> to start · pay only when sure</span>
            </li>
            <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70">
              <Clock className="h-4 w-4 text-tat-gold" />
              <span>Open <strong className="font-semibold text-tat-charcoal">8 AM – 10 PM</strong> IST · Tuesday closed</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Quick action grid — biggest possible CTAs above the fold so the
          impatient user converts in one tap. Mirrors the destination
          detail mobile-CTA pattern. */}
      <section className="py-8 md:py-10">
        <div className="container-custom max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <QuickAction
              href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip%21%20I%27d%20like%20to%20plan%20a%20trip."
              intent="whatsapp_click"
              icon={MessageCircle}
              accent="bg-whatsapp text-white"
              label="WhatsApp"
              sub="Avg reply 9 min"
            />
            <QuickAction
              href="tel:+918115999588"
              intent="call_click"
              icon={Phone}
              accent="bg-tat-teal text-white"
              label="Call"
              sub={PHONE_PRIMARY}
            />
            <QuickAction
              href={`mailto:${EMAIL}`}
              icon={Mail}
              accent="bg-tat-gold/15 text-tat-gold"
              label="Email"
              sub={EMAIL}
            />
            <QuickAction
              href="#message"
              icon={Sparkles}
              accent="bg-tat-charcoal text-white"
              label="Send message"
              sub="Reply within 2 h"
            />
          </div>
        </div>
      </section>

      {/* Form + info */}
      <section className="pb-16 md:pb-20" id="message">
        <div className="container-custom grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16">
          {/* Info */}
          <div className="space-y-6">
            <InfoBlock
              icon={Phone}
              label="Call us"
              value={`${PHONE_PRIMARY} / ${PHONE_SECONDARY}`}
              href="tel:+918115999588"
            />
            <InfoBlock
              icon={MessageCircle}
              label="WhatsApp"
              value={PHONE_PRIMARY}
              href="https://wa.me/918115999588"
            />
            <InfoBlock
              icon={Mail}
              label="Email"
              value={EMAIL}
              href={`mailto:${EMAIL}`}
            />
            <InfoBlock
              icon={MapPin}
              label="Visit us"
              value={OFFICE_ADDRESS}
            />
            <InfoBlock
              icon={Clock}
              label="Office hours"
              value="8:00 AM – 10:00 PM (Tuesday closed)"
            />

            <div className="bg-tat-charcoal rounded-3xl p-7 md:p-8 text-tat-paper mt-4">
              <p className="eyebrow text-tat-gold mb-3">Why call us?</p>
              <p className="font-display text-xl md:text-2xl leading-tight mb-3">
                Because trip planning is a conversation — not a form.
              </p>
              <p className="text-tat-paper/70 text-sm leading-relaxed">
                Some of the best trips in our history started with &ldquo;I don&rsquo;t know
                where I want to go, but I know how I want to feel.&rdquo; We&rsquo;ll take it
                from there.
              </p>
            </div>

            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-tat-charcoal/8 bg-tat-cream">
              <iframe
                title="Trust and Trip office location"
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>

          {/* Form */}
          <LeadForm
            title="Send us a message"
            subtitle="Fill in a few details. We'll be in touch within 2 hours."
            ctaLabel="Send Message"
            source="contact_form"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-16 bg-tat-cream-warm/30">
        <div className="container-custom max-w-3xl">
          <span className="eyebrow">Common questions</span>
          <h2 className="heading-section mt-2 mb-6 text-balance">
            Before you message,{" "}
            <span className="italic text-tat-gold font-light">a few quick answers.</span>
          </h2>
          <div className="rounded-2xl bg-white ring-1 ring-tat-charcoal/8 divide-y divide-tat-charcoal/8 overflow-hidden">
            {FAQS.map((f, i) => (
              <details key={i} className="group">
                <summary className="cursor-pointer select-none list-none px-5 md:px-6 py-4 md:py-5 flex items-start justify-between gap-4 hover:bg-tat-cream-warm/40">
                  <h3 className="font-display text-[15px] md:text-[17px] font-medium text-tat-charcoal leading-snug">
                    {f.q}
                  </h3>
                  <ChevronDown className="h-4 w-4 text-tat-charcoal/55 transition-transform shrink-0 mt-1 group-open:rotate-180" />
                </summary>
                <div className="px-5 md:px-6 pb-5 text-[13px] md:text-[14px] leading-relaxed text-tat-charcoal/70">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function QuickAction({
  href, intent, icon: Icon, accent, label, sub,
}: {
  href: string;
  intent?: "call_click" | "whatsapp_click";
  icon: typeof Mail;
  accent: string;
  label: string;
  sub: string;
}) {
  const inner = (
    <>
      <span className={`inline-flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full ${accent}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[14px] md:text-[15px] font-display font-medium text-tat-charcoal leading-tight">
          {label}
        </p>
        <p className="text-[11px] md:text-[12px] text-tat-charcoal/55 mt-0.5 truncate">
          {sub}
        </p>
      </div>
    </>
  );
  const className = "flex items-center gap-3 rounded-2xl bg-tat-paper border border-tat-charcoal/8 hover:border-tat-gold/40 hover:bg-white p-3 md:p-4 transition-colors";

  if (intent) {
    return (
      <IntentAnchor href={href} intent={intent} metadata={{ note: `Contact quick action — ${label}` }} className={className}>
        {inner}
      </IntentAnchor>
    );
  }
  return <a href={href} className={className}>{inner}</a>;
}

function InfoBlock({
  icon: Icon, label, value, href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="shrink-0 h-11 w-11 rounded-full bg-tat-gold/20 text-tat-gold flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-tat-charcoal/50 font-medium">{label}</p>
        <p className="mt-1 font-display text-lg md:text-xl text-tat-charcoal">{value}</p>
      </div>
    </div>
  );
  if (!href) return content;

  const intent: "call_click" | "whatsapp_click" | null = href.startsWith("tel:")
    ? "call_click"
    : href.startsWith("https://wa.me") || href.startsWith("http://wa.me")
      ? "whatsapp_click"
      : null;

  const className = "block group hover:bg-tat-paper rounded-2xl p-2 -m-2 transition-colors";

  if (intent) {
    return (
      <IntentAnchor href={href} intent={intent} metadata={{ note: `Contact page — ${label}` }} className={className}>
        {content}
      </IntentAnchor>
    );
  }
  return (
    <a href={href} className={className}>
      {content}
    </a>
  );
}
