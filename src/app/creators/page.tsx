import Link from "next/link";
import {
  Sparkles, Wallet, BarChart3, ArrowRight, IndianRupee, Heart,
  ShieldCheck, Megaphone, Users, Zap,
} from "lucide-react";

export const metadata = {
  title: "Creator Program — Earn 5% on every trip you refer | Trust and Trip",
  description: "Travel creators: turn your audience into bookings. Earn 5% commission on every confirmed trip via your unique referral link, with full transparency in your dashboard.",
  alternates: { canonical: "https://trustandtrip.com/creators" },
};

const PERKS = [
  { icon: IndianRupee, title: "5% commission per booking", body: "Real cash, not credits. Paid out on confirmed trips, not clicks." },
  { icon: BarChart3, title: "Transparent dashboard", body: "Every click, lead, conversion and payout visible — no black box." },
  { icon: Megaphone, title: "Instagram automation kit", body: "We trigger DM + comment automations from your reels and posts to capture leads." },
  { icon: Heart, title: "We do the heavy lifting", body: "You share the link. Our planners handle every customer end-to-end." },
];

const STEPS = [
  { num: "01", title: "Apply", body: "Tell us about your audience and what you create. Approval in 48 hours." },
  { num: "02", title: "Get your link", body: "We assign a unique tracking code (CRTR-XXXX) + custom landing assets." },
  { num: "03", title: "Share", body: "Drop link in bio, story, post. Triggers DM/comment automation we set up." },
  { num: "04", title: "Earn", body: "Lead converts → 5% of total trip cost lands in your dashboard." },
];

const FAQ = [
  { q: "When do I get paid?", a: "Earnings move from pending → payable once the customer's trip is confirmed (deposit verified). We pay out monthly via UPI or bank transfer." },
  { q: "How is commission calculated?", a: "5% of the total package cost (price per person × travellers). On a ₹50,000/person trip with 2 travellers, you earn ₹5,000." },
  { q: "What happens if a booking is cancelled?", a: "If cancelled before travel, the commission is reversed. If completed, it's locked in for payout." },
  { q: "Do I need to do hard selling?", a: "Never. Just share authentic experiences and the link. We handle every conversation, customisation and booking." },
  { q: "What about taxes?", a: "Earnings above ₹40k/year are TDS-deductible. We share Form 16A annually." },
];

export default function CreatorsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 bg-gradient-to-br from-tat-charcoal via-tat-charcoal to-tat-charcoal/95 text-tat-paper overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-tat-gold/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-tat-orange/10 blur-3xl pointer-events-none" />

        <div className="container-custom relative">
          <p className="text-[10px] uppercase tracking-[0.28em] text-tat-gold/80 mb-4 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Trust and Trip — Creator Program
          </p>
          <h1 className="font-display font-medium leading-[0.96] text-balance max-w-4xl"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}>
            Turn your travel audience
            <br />
            into{" "}
            <span className="italic text-tat-gold font-light">earnings.</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-tat-paper/70 max-w-xl leading-relaxed">
            We partner with travel creators across India to design real journeys for real audiences. You share, we
            craft. Every confirmed booking earns you 5% — paid out monthly, tracked transparently.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/creators/apply" className="btn-gold group">
              Apply to join
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/918115999588?text=Hi!%20I%27d%20like%20to%20join%20the%20Trust%20and%20Trip%20Creator%20Program."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-tat-paper/85 hover:text-tat-gold transition-colors border border-tat-paper/20 hover:border-tat-gold/40 px-5 py-2.5 rounded-full"
            >
              Talk to us first
            </a>
          </div>

          {/* Trust pills */}
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-tat-paper/55">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-tat-success-fg" /> Transparent dashboard</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-tat-success-fg" /> Instagram automation kit</span>
            <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-tat-success-fg" /> Monthly UPI / bank payouts</span>
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-tat-success-fg" /> 10K+ travellers served</span>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-20 md:py-28 bg-tat-paper">
        <div className="container-custom">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow">What you get</p>
            <h2 className="heading-section mt-2 text-balance">
              A real partnership,
              <span className="italic text-tat-gold font-light"> not just a link.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {PERKS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl border border-tat-charcoal/8 p-6 md:p-7 hover:shadow-soft transition-shadow">
                <div className="h-12 w-12 rounded-2xl bg-tat-gold/15 text-tat-gold flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-medium text-tat-charcoal mb-2">{title}</h3>
                <p className="text-sm text-tat-charcoal/65 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 bg-tat-cream/25">
        <div className="container-custom">
          <div className="max-w-2xl mb-12 md:mb-16">
            <p className="eyebrow">How it works</p>
            <h2 className="heading-section mt-2 text-balance">
              Four steps. One signup.
              <span className="italic text-tat-gold font-light"> Zero hard sell.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {STEPS.map(({ num, title, body }) => (
              <div key={num} className="bg-white rounded-2xl border border-tat-charcoal/8 p-6">
                <p className="font-display text-2xl text-tat-gold/60 font-light">{num}</p>
                <h3 className="font-display text-lg font-medium text-tat-charcoal mt-2 mb-2">{title}</h3>
                <p className="text-xs text-tat-charcoal/60 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample earnings */}
      <section className="py-20 md:py-28 bg-tat-paper">
        <div className="container-custom max-w-3xl">
          <p className="eyebrow">Earnings calculator</p>
          <h2 className="heading-section mt-2 mb-10 text-balance">
            What you actually take home.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { trip: "Bali honeymoon", price: "₹70k × 2", earn: "₹7,000" },
              { trip: "Kerala family", price: "₹45k × 4", earn: "₹9,000" },
              { trip: "Maldives luxe", price: "₹1.5L × 2", earn: "₹15,000" },
            ].map((s) => (
              <div key={s.trip} className="bg-tat-gold/8 border border-tat-gold/20 rounded-2xl p-5">
                <p className="text-[11px] uppercase tracking-widest text-tat-charcoal/50">{s.trip}</p>
                <p className="font-display text-base font-medium text-tat-charcoal mt-1">{s.price}</p>
                <p className="font-display text-2xl text-tat-gold mt-3">{s.earn}</p>
                <p className="text-[11px] text-tat-charcoal/45 mt-0.5">your share (5%)</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-tat-charcoal/55">
            One booking a week from your audience = ~₹40,000 / month. Most of our top creators do 3-5.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-tat-cream/25">
        <div className="container-custom max-w-3xl">
          <p className="eyebrow">FAQ</p>
          <h2 className="heading-section mt-2 mb-10 text-balance">
            Things creators ask us first.
          </h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="bg-white rounded-2xl border border-tat-charcoal/8 p-5 group">
                <summary className="font-medium text-tat-charcoal cursor-pointer flex items-center justify-between">
                  {q}
                  <ArrowRight className="h-4 w-4 text-tat-charcoal/40 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-tat-charcoal/65 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-tat-charcoal text-tat-paper">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <h2 className="font-display font-medium leading-[1.05] text-balance" style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
            Ready when you are.
          </h2>
          <p className="mt-5 text-tat-paper/65">
            48-hour approval. Onboarding call. Your link goes live the same day.
          </p>
          <Link href="/creators/apply" className="btn-gold mt-8 group inline-flex">
            Apply to join
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </>
  );
}
