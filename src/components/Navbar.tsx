"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, MapPin } from "lucide-react";
import clsx from "clsx";
import { useTripPlanner } from "@/context/TripPlannerContext";

const navLinks = [
  { href: "/destinations", label: "Destinations" },
  { href: "/packages", label: "Packages" },
  { href: "/experiences", label: "Experiences" },
  { href: "/customize-trip", label: "Customize" },
  { href: "/offers", label: "Offers" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open: openPlanner } = useTripPlanner();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top announcement strip — mobile: compact single line, md+: full */}
      <div className="bg-ink text-cream text-xs py-2 md:py-2.5">
        <div className="container-custom flex items-center justify-between gap-4">
          {/* Mobile: single promo line */}
          <p className="md:hidden text-gold text-center w-full text-[11px] font-medium tracking-wide">
            🎉 10% Off on bookings 60+ days in advance ·{" "}
            <a href="tel:+918115999588" className="text-cream/80 hover:text-gold">Call +91 8115 999 588</a>
          </p>
          {/* Desktop: full strip */}
          <div className="hidden md:flex items-center gap-6 opacity-80">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-gold" />
              Curating journeys across 60+ destinations
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <a href="tel:+918115999588" className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <Phone className="h-3 w-3" />
              +91 8115 999 588
            </a>
            <span className="opacity-60">|</span>
            <span className="text-gold">🎉 10% Off on bookings 60+ days in advance</span>
          </div>
        </div>
      </div>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={clsx(
          "sticky top-0 z-50 w-full transition-all duration-500",
          scrolled
            ? "bg-cream/90 backdrop-blur-xl border-b border-ink/10 shadow-soft"
            : "bg-transparent"
        )}
      >
        <div className="container-custom flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-ink flex items-center justify-center group-hover:bg-gold transition-colors duration-500">
                <span className="text-gold group-hover:text-ink text-lg font-display font-semibold transition-colors duration-500">
                  T
                </span>
              </div>
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-gold" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg md:text-xl font-medium tracking-tight text-ink">
                Trust<span className="text-gold">&</span>Trip
              </span>
              <span className="text-[9px] uppercase tracking-[0.22em] text-ink/50 mt-0.5">
                Crafting Reliable Travel
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm text-ink/70 hover:text-ink transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-4 right-4 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openPlanner()}
              className="hidden md:inline-flex btn-primary !py-2.5 !px-5 !text-xs"
            >
              Plan My Trip
            </button>

            {/* Mobile: call button */}
            <a
              href="tel:+918115999588"
              className="lg:hidden p-2 rounded-full hover:bg-gold/10 transition-colors"
              aria-label="Call us"
            >
              <Phone className="h-[18px] w-[18px] text-ink" />
            </a>

            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-full hover:bg-ink/5 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-ink" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[60]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-cream z-[70] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-ink/10">
                <span className="font-display text-2xl">
                  Trust<span className="text-gold">&</span>Trip
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full hover:bg-ink/5"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-ink" />
                </button>
              </div>
              <nav className="p-6 flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="py-4 text-2xl font-display text-ink border-b border-ink/5 block hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <button
                  onClick={() => { setMobileOpen(false); openPlanner(); }}
                  className="btn-primary mt-8 justify-center"
                >
                  Plan My Trip
                </button>

                <div className="mt-8 pt-6 border-t border-ink/10 space-y-2 text-sm text-ink/60">
                  <a href="tel:+919999999999" className="flex items-center gap-2 hover:text-gold">
                    <Phone className="h-4 w-4" />
                    +91 99999 99999
                  </a>
                  <p>hello@trustandtrip.com</p>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
