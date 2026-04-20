"use client";

import Link from "next/link";
import { Instagram, Facebook, Linkedin, Twitter, MapPin, Mail, Phone } from "lucide-react";

const footerLinks = {
  Explore: [
    { label: "Destinations", href: "/destinations" },
    { label: "Packages", href: "/packages" },
    { label: "Experiences", href: "/experiences" },
    { label: "Offers", href: "/offers" },
    { label: "Customize a Trip", href: "/customize-trip" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Journal", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
  ],
};

const socials = [
  { icon: Instagram, href: "https://instagram.com/trust_and_trip", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/trustandtrip/", label: "Facebook" },
  { icon: Linkedin, href: "https://linkedin.com/company/trust-and-trip/", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/trust_and_trip", label: "Twitter / X" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-cream pt-12 pb-6 overflow-hidden relative">
      {/* Subtle wordmark */}
      <div
        aria-hidden
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 font-display text-[18vw] leading-none font-medium text-cream/[0.025] tracking-tighter pointer-events-none select-none whitespace-nowrap"
      >
        Trust & Trip
      </div>

      <div className="container-custom relative">
        {/* Main row — all parallel */}
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr] gap-8 md:gap-12 pb-10 border-b border-cream/10">

          {/* Brand + contact */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="h-9 w-9 rounded-full bg-gold text-ink flex items-center justify-center shrink-0">
                <span className="font-display text-lg font-semibold">T</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg font-medium">
                  Trust<span className="text-gold">&</span>Trip
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-cream/40 mt-0.5">
                  Crafting Reliable Travel
                </span>
              </div>
            </Link>

            <p className="text-sm text-cream/50 leading-relaxed mb-5 max-w-xs">
              Handcrafted journeys for families, couples and groups — designed around you.
            </p>

            <div className="space-y-2 text-sm text-cream/60">
              <a href="tel:+918115999588" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Phone className="h-3.5 w-3.5 text-gold shrink-0" />
                +91 8115 999 588
              </a>
              <a href="mailto:hello@trustandtrip.com" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Mail className="h-3.5 w-3.5 text-gold shrink-0" />
                hello@trustandtrip.com
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                <span className="text-cream/40 text-xs leading-relaxed">R-607, Amrapali Princely, Noida Sector 71, UP 201301</span>
              </p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-cream/60 hover:text-gold transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream/40 order-2 sm:order-1">
            © {new Date().getFullYear()} Trust and Trip. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full border border-cream/15 flex items-center justify-center hover:bg-gold hover:text-ink hover:border-gold transition-all"
              >
                <s.icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
