import LeadForm from "@/components/LeadForm";
import IntentAnchor from "@/components/IntentAnchor";
import { Mail, MapPin, Phone, Clock, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Contact — Trust and Trip",
  description: "Talk to our planners. Real humans, real replies, 24/7.",
};

export default function ContactPage() {
  return (
    <>
      <section className="pt-28 md:pt-36 pb-12 bg-cream">
        <div className="container-custom max-w-5xl">
          <span className="eyebrow">Get in touch</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] text-balance">
            Let's talk
            <span className="italic text-gold font-light"> itineraries.</span>
          </h1>
          <p className="mt-6 text-ink/60 max-w-xl leading-relaxed">
            Drop a line, a voice note, or a half-formed idea. Our planners will pick it up and
            turn it into something worth traveling for.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-custom grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16">
          {/* Info */}
          <div className="space-y-6">
            <InfoBlock
              icon={Phone}
              label="Call us"
              value="+91 8115 999 588 / +91 7275 999 588"
              href="tel:+918115999588"
            />
            <InfoBlock
              icon={MessageCircle}
              label="WhatsApp"
              value="+91 8115 999 588"
              href="https://wa.me/918115999588"
            />
            <InfoBlock
              icon={Mail}
              label="Email"
              value="hello@trustandtrip.com"
              href="mailto:hello@trustandtrip.com"
            />
            <InfoBlock
              icon={MapPin}
              label="Visit us"
              value="R-607, Amrapali Princely, Noida Sector 71, Gautambuddh Nagar 201301"
            />
            <InfoBlock
              icon={Clock}
              label="Office hours"
              value="8:00 AM – 10:00 PM (Tuesday Closed)"
            />

            <div className="bg-ink rounded-3xl p-8 text-cream mt-8">
              <p className="eyebrow text-gold mb-4">Why call us?</p>
              <p className="font-display text-2xl leading-tight mb-4">
                Because trip planning is a conversation — not a form.
              </p>
              <p className="text-cream/70 text-sm leading-relaxed">
                Some of the best trips in our history started with "I don't know where I
                want to go, but I know how I want to feel." We'll take it from there.
              </p>
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
    </>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="shrink-0 h-11 w-11 rounded-full bg-gold/20 text-gold flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-ink/50 font-medium">{label}</p>
        <p className="mt-1 font-display text-xl text-ink">{value}</p>
      </div>
    </div>
  );
  if (!href) return content;

  // Pick intent by protocol
  const intent: "call_click" | "whatsapp_click" | null = href.startsWith("tel:")
    ? "call_click"
    : href.startsWith("https://wa.me") || href.startsWith("http://wa.me")
      ? "whatsapp_click"
      : null;

  const className = "block group hover:bg-cream rounded-2xl p-2 -m-2 transition-colors";

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
