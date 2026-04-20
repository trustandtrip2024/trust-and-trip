import Image from "next/image";
import Link from "next/link";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { stats, whyChooseUs } from "@/lib/data";
import {
  Compass, Handshake, HeartHandshake, Sparkles,
  Phone, Mail, MapPin, Clock, CreditCard,
} from "lucide-react";

export const metadata = {
  title: "About Us — Trust and Trip",
  description:
    "Trust and Trip Experiences Pvt. Ltd. — We design travel that listens. Transparent, reliable and trustworthy travel packages from Noida, India.",
  alternates: { canonical: "https://trustandtrip.com/about" },
};

const values = [
  {
    icon: Compass,
    title: "Originality",
    description:
      "Every itinerary is handcrafted. We don't resell tour templates — we design from scratch, built around your group, budget, and pace.",
  },
  {
    icon: Handshake,
    title: "Trust",
    description:
      "What we quote is what you pay. No hidden fees, no upsells at airports, no surprises. 100% price transparency — always.",
  },
  {
    icon: HeartHandshake,
    title: "Human Care",
    description:
      "Real planners, real replies, real-time support. We are reachable 8 AM to 10 PM, 6 days a week, wherever you are in the world.",
  },
  {
    icon: Sparkles,
    title: "Detail",
    description:
      "From a confirmed restaurant reservation to the best-view hotel room — we sweat every detail so you travel completely worry-free.",
  },
];

const services = [
  { label: "Domestic Tours", desc: "Handcrafted packages across India — mountains, beaches, heritage and wildlife." },
  { label: "International Tours", desc: "Bali, Maldives, Europe, Southeast Asia and beyond — curated for Indian travellers." },
  { label: "Honeymoon Packages", desc: "Romantic escapes designed for couples, with private experiences and surprise elements." },
  { label: "Family Trips", desc: "Kid-friendly itineraries with child-safe activities and flexible pacing." },
  { label: "Group Tours", desc: "Fixed departures and custom group itineraries for friends, corporates and communities." },
  { label: "Adventure Tours", desc: "Trekking, bike expeditions, rafting and high-altitude experiences." },
  { label: "Pilgrim Journeys", desc: "Char Dham Yatra, Kedarnath, Vaishno Devi and other sacred circuits." },
  { label: "Fixed Departures", desc: "Pre-scheduled group tours at competitive prices with guaranteed departures." },
];

const paymentMethods = ["Visa", "Mastercard", "UPI", "Google Pay", "PhonePe"];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About Trust and Trip",
        description: "Trust and Trip Experiences Pvt. Ltd. — transparent, reliable and trustworthy travel.",
        url: "https://trustandtrip.com/about",
      }} />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 bg-cream">
        <div className="container-custom grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <span className="eyebrow">About us</span>
            <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] text-balance">
              Travel with Trust —
              <span className="italic text-gold font-light"> Not issues.</span>
            </h1>
            <p className="mt-6 text-ink/70 text-lg leading-relaxed">
              Trust and Trip Experiences Pvt. Ltd. was founded in Noida with one mission: make
              travel genuinely worry-free for every kind of traveller — couples on their first
              honeymoon, families on a once-in-a-decade holiday, groups of friends chasing an
              adventure, and solo explorers finding themselves.
            </p>
            <p className="mt-4 text-ink/60 leading-relaxed">
              We are <strong>Transparent. Reliable. Trustworthy.</strong> These aren&apos;t just
              marketing words — they&apos;re the operating system of every trip we build. What we
              quote is what you pay. What we promise is what gets delivered.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 bg-gold/15 text-ink px-5 py-2.5 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4 text-gold" />
              10% Off on bookings 60+ days in advance
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=85&auto=format&fit=crop"
              alt="Trust and Trip — crafting journeys"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-cream font-display text-xl italic">
                &ldquo;Crafting Reliable Travel&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink text-cream py-14">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl md:text-6xl text-gold leading-none">{s.value}</div>
              <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-cream/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-20 md:py-24 bg-sand/30">
        <div className="container-custom">
          <div className="max-w-2xl mb-12">
            <span className="eyebrow">What we offer</span>
            <h2 className="heading-section mt-3 text-balance">
              Every kind of journey,
              <span className="italic text-gold font-light"> built for you.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-6 border border-ink/5 hover:shadow-soft transition-shadow">
                <h3 className="font-display text-lg font-medium mb-2">{s.label}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="max-w-2xl mb-12 md:mb-16">
            <span className="eyebrow">What we stand for</span>
            <h2 className="heading-section mt-3 text-balance">
              Four values, lived every day.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-cream rounded-3xl p-7 border border-ink/5 hover:shadow-soft transition-shadow"
              >
                <div className="h-12 w-12 rounded-full bg-gold/20 text-gold flex items-center justify-center mb-5">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-medium mb-2">{v.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 md:py-28 bg-sand/40">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <p className="font-display text-3xl md:text-5xl italic font-light leading-tight text-balance">
            &ldquo;The best trips aren&apos;t the ones you <span className="text-gold">plan</span>.{" "}
            <br className="hidden md:block" />
            They&apos;re the ones that are{" "}
            <span className="text-gold">planned for you</span>.&rdquo;
          </p>
          <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-ink/50">
            — A belief we live by, since day one
          </p>
        </div>
      </section>

      {/* Contact & Payment */}
      <section className="py-20 md:py-24">
        <div className="container-custom grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact details */}
          <div>
            <span className="eyebrow">Reach us</span>
            <h2 className="heading-section mt-3 text-balance mb-8">
              Real people,
              <span className="italic text-gold font-light"> real replies.</span>
            </h2>
            <div className="space-y-5">
              {[
                { icon: Phone, label: "Phone", value: "+91 8115 999 588 / +91 7275 999 588", href: "tel:+918115999588" },
                { icon: Mail, label: "Email", value: "hello@trustandtrip.com", href: "mailto:hello@trustandtrip.com" },
                { icon: MapPin, label: "Office", value: "R-607, Amrapali Princely, Noida Sector 71, Gautambuddh Nagar 201301", href: undefined },
                { icon: Clock, label: "Hours", value: "8:00 AM – 10:00 PM · Tuesday Closed", href: undefined },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-full bg-gold/20 text-gold flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-medium">{label}</p>
                    {href ? (
                      <a href={href} className="mt-1 font-display text-lg text-ink hover:text-gold transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 font-display text-lg text-ink">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & legal */}
          <div className="space-y-8">
            <div>
              <span className="eyebrow">We accept</span>
              <h3 className="font-display text-2xl font-medium mt-3 mb-5">Secure payments</h3>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map((m) => (
                  <span key={m} className="px-4 py-2 bg-cream rounded-xl border border-ink/10 text-sm font-medium text-ink/80">
                    {m}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink/50">All transactions are SSL-encrypted.</p>
            </div>
            <div>
              <span className="eyebrow">Legal</span>
              <h3 className="font-display text-2xl font-medium mt-3 mb-5">Company policies</h3>
              <div className="space-y-3">
                {[
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Terms & Conditions", href: "/terms-and-conditions" },
                  { label: "Cancellation & Refund Policy", href: "/cancellation-policy" },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between p-4 bg-cream rounded-xl border border-ink/8 hover:border-gold transition-colors group"
                  >
                    <span className="text-sm font-medium text-ink group-hover:text-gold transition-colors">{label}</span>
                    <span className="text-ink/30 group-hover:text-gold text-xs">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
