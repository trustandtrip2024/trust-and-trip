"use client";

import Link from "next/link";
import { useState } from "react";
import { captureIntent } from "@/lib/capture-intent";
import {
  Instagram, Facebook, Linkedin, Twitter, Youtube,
  MapPin, Mail, Phone, ArrowRight, Shield, Award,
  CheckCircle2,
} from "lucide-react";

const EXPLORE = [
  { label: "All Destinations", href: "/destinations" },
  { label: "All Packages", href: "/packages" },
  { label: "Experiences", href: "/experiences" },
  { label: "Offers & Deals", href: "/offers" },
  { label: "Plan a Trip (AI)", href: "/plan" },
  { label: "Refer & Earn", href: "/refer" },
  { label: "Creator Program", href: "/creators" },
];

const PILGRIM = [
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
  { label: "Contact Us", href: "/contact" },
  { label: "Our Journal", href: "/blog" },
  { label: "My Booking", href: "/my-booking" },
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
  { icon: Facebook, href: "https://facebook.com/trustandtrip/", label: "Facebook", color: "hover:bg-[#1877F2] hover:border-transparent" },
  { icon: Twitter, href: "https://x.com/trust_and_trip", label: "Twitter / X", color: "hover:bg-black hover:border-transparent" },
  { icon: Youtube, href: "https://youtube.com/@trustandtrip", label: "YouTube", color: "hover:bg-red-600 hover:border-transparent" },
  { icon: Linkedin, href: "https://linkedin.com/company/trust-and-trip/", label: "LinkedIn", color: "hover:bg-[#0A66C2] hover:border-transparent" },
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
    <footer className="bg-[#0b1c2c] text-tat-paper overflow-hidden relative">

      {/* ── Newsletter strip ───────────────────────────────────── */}
      <div className="border-b border-tat-paper/8">
        <div className="container-custom py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="eyebrow text-tat-gold mb-1">Travel updates</p>
              <h3 className="font-display text-xl md:text-2xl font-medium">
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
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-tat-paper/8 border border-tat-paper/15 text-tat-paper placeholder:text-tat-paper/30 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-tat-gold"
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

      {/* ── Main link grid ─────────────────────────────────────── */}
      <div className="container-custom pt-14 pb-10 border-b border-tat-paper/8">
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 md:gap-8">

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

            <p className="text-sm text-tat-paper/45 leading-relaxed mb-6 max-w-xs">
              Handcrafted journeys for families, couples, and groups — 23 destinations, 150+ packages, zero hidden costs.
            </p>

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

            <h4 className="text-[10px] uppercase tracking-[0.25em] text-tat-gold font-medium mt-8 mb-5">International</h4>
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
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-tat-gold font-medium mb-5">Pilgrim & Adventure</h4>
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

            {/* Hours */}
            <div className="mt-8 p-4 rounded-xl bg-tat-paper/5 border border-tat-paper/8">
              <p className="text-[10px] uppercase tracking-wider text-tat-gold font-medium mb-2">We're available</p>
              <p className="text-sm text-tat-paper/60 font-medium">Mon – Sun: 8 AM – 10 PM</p>
              <p className="text-xs text-tat-paper/35 mt-1">Call, WhatsApp, or email anytime.</p>
            </div>
          </div>
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
            <Shield className="h-4 w-4 text-tat-gold/60 shrink-0" />
            <span className="text-xs">SSL Secured Payments</span>
          </div>
          <div className="flex items-center gap-2.5 text-tat-paper/40">
            <CheckCircle2 className="h-4 w-4 text-tat-gold/60 shrink-0" />
            <span className="text-xs">Razorpay Payment Gateway</span>
          </div>
          <div className="flex items-center gap-2.5 text-tat-paper/40">
            <Shield className="h-4 w-4 text-tat-gold/60 shrink-0" />
            <span className="text-xs">100% Secure Booking</span>
          </div>
          <div className="flex items-center gap-2.5 text-tat-paper/40">
            <Award className="h-4 w-4 text-tat-gold/60 shrink-0" />
            <span className="text-xs">4.9★ on Google & TripAdvisor</span>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────── */}
      {/* pb-24 on mobile so content clears the fixed bottom nav bar */}
      <div className="container-custom pt-5 pb-24 lg:pb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-tat-paper/30">
            © {new Date().getFullYear()} Trust and Trip Pvt. Ltd. · All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-tat-paper/30">
            <Link href="/privacy-policy" className="hover:text-tat-gold transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-tat-gold transition-colors">Terms</Link>
            <Link href="/cancellation-policy" className="hover:text-tat-gold transition-colors">Cancellation</Link>
          </div>
        </div>
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
