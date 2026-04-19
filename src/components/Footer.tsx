"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Facebook, Youtube, Send, MapPin, Mail, Phone } from "lucide-react";

const footerLinks = {
  Explore: [
    { label: "Destinations", href: "/destinations" },
    { label: "Packages", href: "/packages" },
    { label: "Experiences", href: "/experiences" },
    { label: "Offers", href: "/offers" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Journal", href: "/blog" },
    { label: "Customize a Trip", href: "/customize-trip" },
    { label: "Contact", href: "/contact" },
  ],
  Support: [
    { label: "Help Center", href: "/contact" },
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-ink text-cream pt-20 pb-8 md:pb-10 mt-16 md:mt-0 overflow-hidden">
      {/* Large word decoration */}
      <div
        aria-hidden
        className="absolute -bottom-16 md:-bottom-32 left-1/2 -translate-x-1/2 font-display text-[20vw] leading-none font-medium text-cream/[0.03] tracking-tighter pointer-events-none select-none whitespace-nowrap"
      >
        Trust & Trip
      </div>

      <div className="container-custom relative">
        {/* Top band — newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-10 pb-16 border-b border-cream/10"
        >
          <div>
            <span className="eyebrow text-gold">Let's stay in touch</span>
            <h3 className="mt-3 font-display text-3xl md:text-4xl font-medium text-cream leading-tight max-w-md text-balance">
              Monthly travel stories,
              <span className="italic text-gold font-light"> straight to your inbox.</span>
            </h3>
          </div>
          <div className="md:pt-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector<HTMLInputElement>("input[type=email]");
                if (input) {
                  alert(`Subscribed: ${input.value}`);
                  input.value = "";
                }
              }}
              className="flex items-center gap-2 bg-cream/5 border border-cream/10 rounded-full p-2 pl-6 focus-within:border-gold transition-colors"
            >
              <Mail className="h-4 w-4 text-cream/40 shrink-0" />
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 bg-transparent text-cream placeholder:text-cream/40 text-sm outline-none py-2.5"
              />
              <button
                type="submit"
                className="shrink-0 bg-gold text-ink rounded-full h-11 w-11 flex items-center justify-center hover:bg-cream transition-colors"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="text-xs text-cream/40 mt-3">
              No spam. Unsubscribe anytime. Read our{" "}
              <Link href="#" className="underline hover:text-gold">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </motion.div>

        {/* Main footer content */}
        <div className="grid md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] gap-10 md:gap-12 pt-14">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-full bg-gold text-ink flex items-center justify-center">
                <span className="font-display text-xl font-semibold">T</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-xl font-medium">
                  Trust<span className="text-gold">&</span>Trip
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-cream/40 mt-0.5">
                  Est. 2014
                </span>
              </div>
            </Link>
            <p className="text-sm text-cream/60 leading-relaxed max-w-sm">
              We design travel that listens. Handcrafted journeys for travelers who want
              to collect moments, not just destinations.
            </p>

            <div className="mt-6 space-y-2 text-sm text-cream/70">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <span>
                  42 Hill Road, Bandra West,
                  <br />
                  Mumbai 400050, India
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <a href="tel:+919999999999" className="hover:text-gold transition-colors">
                  +91 99999 99999
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <a href="mailto:hello@trustandtrip.com" className="hover:text-gold transition-colors">
                  hello@trustandtrip.com
                </a>
              </p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium mb-5">
                {heading}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/70 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-cream/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/50">
            © {new Date().getFullYear()} Trust and Trip. Crafted with intention.
          </p>
          <div className="flex items-center gap-2">
            {[
              { icon: Instagram, href: "#", label: "Instagram" },
              { icon: Facebook, href: "#", label: "Facebook" },
              { icon: Youtube, href: "#", label: "YouTube" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="h-10 w-10 rounded-full border border-cream/15 flex items-center justify-center hover:bg-gold hover:text-ink hover:border-gold transition-all"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
