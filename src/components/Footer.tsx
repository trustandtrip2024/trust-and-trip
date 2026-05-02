"use client";

import Link from "next/link";
import { useState } from "react";
import { captureIntent } from "@/lib/capture-intent";
import {
  Instagram, Facebook, Linkedin, Twitter, Youtube,
  MapPin, Mail, Phone, ArrowRight, Shield, Award,
  CheckCircle2, MessageCircle,
} from "lucide-react";

// SEO topic clusters — flat list at the top of the footer. Same job
// the old <SeoContent> dark slab used to do (duplicating the footer
// look right above it), folded into the footer itself so the page
// reads as one cohesive surface instead of two stacked dark blocks.
const SEO_TOPICS = [
  { label: "Honeymoon packages",    href: "/packages?style=Honeymoon" },
  { label: "Family holidays",       href: "/packages?style=Family" },
  { label: "Solo travel",           href: "/packages?style=Solo" },
  { label: "Group tours",           href: "/group-trips" },
  { label: "Pilgrim journeys",      href: "/pilgrim" },
  { label: "Char Dham Yatra",       href: "/char-dham-yatra-package" },
  { label: "Vaishno Devi",          href: "/packages?destination=vaishno-devi" },
  { label: "Tirupati Balaji",       href: "/packages?destination=tirupati" },
  { label: "Visa-free for Indians", href: "/packages?theme=visa-free" },
  { label: "Trips under ₹50,000",   href: "/essentials" },
  { label: "Bespoke luxury",        href: "/private" },
  { label: "Adventure trips",       href: "/packages?style=Adventure" },
  { label: "Wellness retreats",     href: "/packages?style=Wellness" },
  { label: "Beach holidays",        href: "/packages?theme=beach" },
  { label: "Mountain trips",        href: "/packages?theme=mountain" },
  { label: "Best in May",           href: "/packages?month=may" },
];

const EXPLORE = [
  { label: "All Destinations", href: "/destinations" },
  { label: "All Packages", href: "/packages" },
  { label: "Private (Bespoke Luxury)", href: "/private" },
  { label: "Signature (Most Trips)", href: "/signature" },
  { label: "Essentials (Pocket-Friendly)", href: "/essentials" },
  { label: "Group Trips", href: "/group-trips" },
  { label: "Pilgrim Concierge", href: "/pilgrim" },
  { label: "Experiences", href: "/experiences" },
  { label: "Offers & Deals", href: "/offers" },
  { label: "Plan a Trip (AI)", href: "/plan" },
  { label: "Refer & Earn", href: "/refer" },
  { label: "Creator Program", href: "/creators" },
];

const PILGRIM = [
  { label: "All Yatras (Pilgrim Concierge)", href: "/pilgrim" },
  { label: "Char Dham Yatra", href: "/char-dham-yatra-package" },
  { label: "Kedarnath Yatra", href: "/kedarnath-yatra-package" },
  { label: "Kedarnath Helicopter", href: "/kedarnath-helicopter-package" },
  { label: "Do Dham Yatra", href: "/packages/uttarakhand-dodham-road-6n7d" },
  { label: "Spiti Valley Tours", href: "/spiti-valley-tour-packages" },
  { label: "Zanskar Valley", href: "/zanskar-valley-tour-packages" },
  { label: "Chadar Trek", href: "/chadar-trek-package" },
];

const HONEYMOON = [
  { label: "Bali Honeymoon", href: "/honeymoon-packages-bali" },
  { label: "Maldives Honeymoon", href: "/honeymoon-packages-maldives" },
  { label: "Thailand Honeymoon", href: "/honeymoon-packages-thailand" },
  { label: "Kerala Honeymoon", href: "/packages?type=Couple&dest=kerala" },
  { label: "Vietnam Packages", href: "/vietnam-tour-packages-from-india" },
  { label: "Ha Long Bay", href: "/ha-long-bay-tour-package" },
  { label: "Budget International", href: "/budget-international-packages" },
];

const SUPPORT = [
  { label: "About Us", href: "/about" },
  { label: "Why Trust and Trip", href: "/why-us" },
  { label: "Contact Us", href: "/contact" },
  { label: "Our Journal", href: "/blog" },
  { label: "My Booking", href: "/my-booking" },
  { label: "Brand Book (PDF)", href: "/api/brand-book/pdf" },
  { label: "Cancellation Policy", href: "/cancellation-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

const DESTINATIONS = [
  { label: "🌴 Bali", href: "/destinations/bali" },
  { label: "🏝️ Maldives", href: "/destinations/maldives" },
  { label: "🕌 Dubai", href: "/destinations/dubai" },
  { label: "🌸 Japan", href: "/destinations/japan" },
  { label: "🗼 Paris", href: "/destinations/paris" },
  { label: "🏔️ Switzerland", href: "/destinations/switzerland" },
  { label: "🐘 Thailand", href: "/destinations/thailand" },
  { label: "🌿 Vietnam", href: "/destinations/vietnam" },
  { label: "🛕 Kerala", href: "/destinations/kerala" },
  { label: "🏖️ Goa", href: "/destinations/goa" },
  { label: "🏔️ Manali", href: "/destinations/manali" },
  { label: "🌌 Ladakh", href: "/destinations/ladakh" },
  { label: "🏜️ Rajasthan", href: "/destinations/rajasthan" },
  { label: "🙏 Uttarakhand", href: "/destinations/uttarakhand" },
  { label: "❄️ Spiti Valley", href: "/destinations/spiti-valley" },
  { label: "🧊 Zanskar Valley", href: "/destinations/zanskar-valley" },
];

const SOCIALS = [
  { icon: Instagram, href: "https://instagram.com/trust_and_trip", label: "Instagram", color: "hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:border-transparent" },
  { icon: Facebook, href: "https://facebook.com/trustandtrip/", label: "Facebook", color: "hover:bg-facebook hover:border-transparent" },
  { icon: Twitter, href: "https://x.com/trust_and_trip", label: "Twitter / X", color: "hover:bg-black hover:border-transparent" },
  { icon: Youtube, href: "https://youtube.com/@trustandtrip", label: "YouTube", color: "hover:bg-red-600 hover:border-transparent" },
  { icon: Linkedin, href: "https://linkedin.com/company/trust-and-trip/", label: "LinkedIn", color: "hover:bg-linkedin hover:border-transparent" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "loading" | "done">("idle");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubState("loading");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setSubState("done");
  };

  return (
    <footer
      className="bg-tat-charcoal text-tat-paper overflow-hidden relative"
      aria-labelledby="footer-seo-title"
    >

      {/* ── SEO content block (replaces old <SeoContent> slab) ──
          One editorial paragraph + topic chips. Indexable, semantic
          (H2 + descriptive copy + crawlable links), but visually folded
          into the footer so the page no longer reads as two stacked
          charcoal blocks. ─────────────────────────────────────────── */}
      <div className="border-b border-tat-paper/8">
        <div className="container-custom py-12 md:py-14">
          <p className="eyebrow text-tat-gold mb-2">Plan with us</p>
          <h2
            id="footer-seo-title"
            className="font-display font-normal text-[22px] md:text-[28px] leading-tight max-w-3xl"
          >
            Plan a holiday from India with{" "}
            <em className="not-italic font-display italic text-tat-gold">Trust and Trip.</em>
          </h2>
          <p className="mt-3 max-w-4xl text-[13px] md:text-[14px] leading-relaxed text-tat-paper/65">
            Trust and Trip is a Made-in-India travel agency that designs custom
            holiday packages for couples, families, solo travelers, groups, and
            pilgrim journeys. A real planner reads your brief and sends a full
            itinerary within 24 hours — destinations, hotels, day-by-day flow,
            line-item pricing — free until you decide to book. Since 2019 we&apos;ve
            handled 8,000+ trips across India and 60+ international destinations,
            with a 4.9★ rating on Google. We specialise in honeymoons to Bali,
            Maldives, Switzerland and Santorini; family trips in Kerala,
            Singapore, Dubai and Thailand; pilgrim yatras to Char Dham, Vaishno
            Devi, Tirupati and Amarnath with VIP darshan and helicopter
            transfers; and visa-free escapes for Indian passports to Thailand,
            Indonesia, Sri Lanka, Nepal, Bhutan and Mauritius. Every booking
            includes 24×7 emergency support, a doctor-on-call on Yatra trips,
            line-item billing (no inflated MRPs), and one named planner from
            quote to homecoming.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {SEO_TOPICS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                prefetch={false}
                className="text-xs text-tat-paper/55 hover:text-tat-gold border border-tat-paper/12 hover:border-tat-gold/40 px-3 py-1.5 rounded-full transition-all duration-200"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Newsletter strip ───────────────────────────────────── */}
      <div className="border-b border-tat-paper/8">
        <div className="container-custom py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="eyebrow text-tat-gold mb-1">Travel updates</p>
              <h3 className="font-display text-h3 font-medium">
                Get exclusive deals in your inbox.
              </h3>
              <p className="text-sm text-tat-paper/45 mt-1">Early-bird offers, new destinations, travel tips. No spam.</p>
            </div>
            {subState === "done" ? (
              <div className="flex items-center gap-2 text-sm text-tat-gold font-medium shrink-0">
                <CheckCircle2 className="h-5 w-5" /> You're on the list!
              </div>
            ) : (
              <form onSubmit={subscribe} className="flex gap-2 w-full md:w-auto md:min-w-[340px] shrink-0">
                <label htmlFor="footer-newsletter-email" className="sr-only">Email</label>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/30 text-white placeholder:text-white/70 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-tat-gold focus:ring-2 focus:ring-tat-gold/40"
                />
                <button
                  type="submit"
                  disabled={subState === "loading"}
                  className="bg-tat-gold text-tat-charcoal text-sm font-semibold px-5 py-3 rounded-xl hover:bg-tat-gold/90 transition-colors shrink-0"
                >
                  {subState === "loading" ? "…" : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Main link grid ─────────────────────────────────────────────
          Mobile uses a 2-col grid where the four content columns balance
          one-to-one (Explore | Pilgrim, International | Support). The brand
          column spans full width on mobile and one column on desktop.
          ─────────────────────────────────────────────────────────────── */}
      <div className="container-custom pt-14 pb-10 border-b border-tat-paper/8">
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-x-6 gap-y-10 md:gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="h-9 w-9 rounded-full bg-tat-gold text-tat-charcoal flex items-center justify-center shrink-0">
                <span className="font-display text-lg font-semibold">T</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg font-medium">Trust<span className="text-tat-gold">&</span>Trip</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-tat-paper/35 mt-0.5">Crafting Reliable Travel</span>
              </div>
            </Link>

            <p className="text-sm text-tat-paper/45 leading-relaxed mb-5 max-w-xs">
              Handcrafted journeys for couples, families, groups and pilgrims —
              60+ destinations, 250+ trips, 8,000+ travelers since 2019.
            </p>

            {/* Quick CTAs — WhatsApp + plan-my-trip. Customer experience
                upgrade vs static text-only contact: prominent buttons
                that match the rest of the site, clear next step. */}
            <div className="flex flex-col gap-2 mb-6 max-w-xs">
              <a
                href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I'd%20like%20help%20planning%20a%20trip."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => captureIntent("whatsapp_click", { note: "Footer WhatsApp" })}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-whatsapp text-white text-sm font-semibold hover:bg-whatsapp-hover transition-colors"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                Chat on WhatsApp
              </a>
              <Link
                href="/customize-trip"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-tat-gold text-tat-charcoal text-sm font-semibold hover:bg-tat-gold/90 transition-colors"
              >
                Plan my trip in 60 seconds
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Contact */}
            <div className="space-y-2.5 mb-7">
              <a href="tel:+918115999588" onClick={() => captureIntent("call_click", { note: "Footer contact call" })} className="flex items-center gap-2.5 text-sm text-tat-paper/55 hover:text-tat-gold transition-colors">
                <div className="h-7 w-7 rounded-lg bg-tat-paper/6 flex items-center justify-center shrink-0">
                  <Phone className="h-3.5 w-3.5 text-tat-gold" />
                </div>
                +91 8115 999 588
              </a>
              <a href="mailto:hello@trustandtrip.com" className="flex items-center gap-2.5 text-sm text-tat-paper/55 hover:text-tat-gold transition-colors">
                <div className="h-7 w-7 rounded-lg bg-tat-paper/6 flex items-center justify-center shrink-0">
                  <Mail className="h-3.5 w-3.5 text-tat-gold" />
                </div>
                hello@trustandtrip.com
              </a>
              <div className="flex items-start gap-2.5 text-sm text-tat-paper/40">
                <div className="h-7 w-7 rounded-lg bg-tat-paper/6 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-tat-gold" />
                </div>
                <span className="text-xs leading-relaxed">R-607, Amrapali Princely, Noida Sector 71, UP 201301</span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`h-9 w-9 rounded-full border border-tat-paper/15 flex items-center justify-center text-tat-paper/60 hover:text-white transition-all duration-200 ${s.color}`}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-tat-gold font-medium mb-5">Explore</h4>
            <ul className="space-y-3">
              {EXPLORE.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-tat-paper/50 hover:text-tat-gold transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* International / Honeymoon — split out of Explore so the
              mobile two-column grid doesn't end up with one giant column
              twice the height of its neighbour. */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-tat-gold font-medium mb-5">International</h4>
            <ul className="space-y-3">
              {HONEYMOON.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-tat-paper/50 hover:text-tat-gold transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pilgrim & Adventure */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-tat-gold font-medium mb-5">Pilgrim &amp; Adventure</h4>
            <ul className="space-y-3">
              {PILGRIM.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-tat-paper/50 hover:text-tat-gold transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-tat-gold font-medium mb-5">Support</h4>
            <ul className="space-y-3">
              {SUPPORT.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-tat-paper/50 hover:text-tat-gold transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hours block — moved out of the Support column so the four
            link columns stay equal-height on mobile. Sits full-width
            below the link grid. */}
        <div className="mt-10 max-w-md p-4 rounded-xl bg-tat-paper/5 border border-tat-paper/8">
          <p className="text-[10px] uppercase tracking-wider text-tat-gold font-medium mb-2">We&apos;re available</p>
          <p className="text-sm text-tat-paper/60 font-medium">Mon – Sun: 8 AM – 10 PM</p>
          <p className="text-xs text-tat-paper/35 mt-1">Call, WhatsApp, or email anytime.</p>
        </div>
      </div>

      {/* ── Popular destinations strip ─────────────────────────── */}
      <div className="container-custom py-7 border-b border-tat-paper/8">
        <p className="text-[10px] uppercase tracking-[0.25em] text-tat-paper/30 font-medium mb-4">Popular destinations</p>
        <div className="flex flex-wrap gap-2">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.label}
              href={d.href}
              className="text-xs text-tat-paper/45 hover:text-tat-gold border border-tat-paper/10 hover:border-tat-gold/30 px-3 py-1.5 rounded-full transition-all duration-200"
            >
              {d.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Trust badges ──────────────────────────────────────── */}
      <div className="container-custom py-7 border-b border-tat-paper/8">
        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          <div className="flex items-center gap-2.5 text-tat-paper/40">
            <Award className="h-4 w-4 text-tat-gold/60 shrink-0" />
            <span className="text-xs">IATA Accredited Agency</span>
          </div>
          <div className="flex items-center gap-2.5 text-tat-paper/40">
            <CheckCircle2 className="h-4 w-4 text-tat-gold/60 shrink-0" />
            <span className="text-xs">GSTIN registered</span>
          </div>
          <div className="flex items-center gap-2.5 text-tat-paper/40">
            <Shield className="h-4 w-4 text-tat-gold/60 shrink-0" />
            <span className="text-xs">SSL Secured Payments</span>
          </div>
          <div className="flex items-center gap-2.5 text-tat-paper/40">
            <CheckCircle2 className="h-4 w-4 text-tat-gold/60 shrink-0" />
            <span className="text-xs">Razorpay Payment Gateway</span>
          </div>
          <div className="flex items-center gap-2.5 text-tat-paper/40">
            <Award className="h-4 w-4 text-tat-gold/60 shrink-0" />
            <span className="text-xs">4.9★ on Google &amp; TripAdvisor</span>
          </div>
          <div className="flex items-center gap-2.5 text-tat-paper/40">
            <Shield className="h-4 w-4 text-tat-gold/60 shrink-0" />
            <span className="text-xs">Founder-led · Plans in 24hr</span>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────── */}
      {/* pb-24 on mobile so content clears the fixed bottom nav bar */}
      <div className="container-custom pt-5 pb-24 lg:pb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-tat-paper/30">
            © {new Date().getFullYear()} Trust and Trip Experiences Pvt. Ltd. · All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-tat-paper/30">
            <Link href="/privacy-policy" className="hover:text-tat-gold transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-tat-gold transition-colors">Terms</Link>
            <Link href="/cancellation-policy" className="hover:text-tat-gold transition-colors">Cancellation</Link>
          </div>
        </div>
        {(process.env.NEXT_PUBLIC_GSTIN || process.env.NEXT_PUBLIC_CIN) && (
          <p className="mt-2 text-[10px] text-tat-paper/25 leading-relaxed">
            {process.env.NEXT_PUBLIC_GSTIN && (
              <span>GSTIN: <span className="tabular-nums">{process.env.NEXT_PUBLIC_GSTIN}</span></span>
            )}
            {process.env.NEXT_PUBLIC_GSTIN && process.env.NEXT_PUBLIC_CIN && <span className="mx-2">·</span>}
            {process.env.NEXT_PUBLIC_CIN && (
              <span>CIN: <span className="tabular-nums">{process.env.NEXT_PUBLIC_CIN}</span></span>
            )}
          </p>
        )}
      </div>

      {/* Subtle wordmark */}
      <div
        aria-hidden
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-display text-[16vw] leading-none font-medium text-tat-paper/[0.02] tracking-tighter pointer-events-none select-none whitespace-nowrap"
      >
        Trust & Trip
      </div>
    </footer>
  );
}
