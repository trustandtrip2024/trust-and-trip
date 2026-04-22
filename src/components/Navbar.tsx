"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, MapPin, Heart, Search, Mail, Instagram, MessageCircle, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useTripPlanner } from "@/context/TripPlannerContext";
import { useWishlistStore } from "@/store/useWishlistStore";
import dynamic from "next/dynamic";
const SearchModal = dynamic(() => import("./SearchModal"), { ssr: false });

const navLinks = [
  { href: "/destinations", label: "Destinations" },
  { href: "/packages", label: "Packages" },
  { href: "/experiences", label: "Experiences" },
  { href: "/plan", label: "Plan a Trip" },
  { href: "/offers", label: "Offers" },
  { href: "/refer", label: "Refer & Earn" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open: openPlanner } = useTripPlanner();
  const wishlistCount = useWishlistStore((s) => s.wishlist.length);
  const [searchOpen, setSearchOpen] = useState(false);

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
            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full border border-ink/12 text-ink/50 hover:text-ink hover:border-ink/25 transition-all text-xs"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="text-[10px] border border-ink/15 rounded px-1 py-0.5 text-ink/30">⌘K</kbd>
            </button>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden md:flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5 transition-colors"
            >
              <Heart className="h-4 w-4 text-ink/60" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
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
              className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-[60]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-[88vw] max-w-sm bg-cream z-[70] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-ink/8">
                <div>
                  <span className="font-display text-xl font-medium text-ink">
                    Trust<span className="text-gold">&</span>Trip
                  </span>
                  <p className="text-[10px] text-ink/40 tracking-wider uppercase mt-0.5">Crafting Reliable Travel</p>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="h-9 w-9 rounded-full bg-ink/6 flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4 text-ink" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-0.5">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.04 + 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-ink/80 hover:bg-ink/5 hover:text-ink active:bg-ink/8 transition-all group"
                      >
                        {link.label}
                        <ChevronRight className="h-4 w-4 text-ink/25 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Plan My Trip CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mt-5"
                >
                  <button
                    onClick={() => { setMobileOpen(false); openPlanner(); }}
                    className="w-full btn-primary justify-center py-3.5"
                  >
                    Plan My Trip
                  </button>
                </motion.div>

                {/* WhatsApp quick CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3"
                >
                  <a
                    href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I'd%20love%20help%20planning%20my%20next%20trip."
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366]/10 text-[#1a9e4e] font-semibold text-sm border border-[#25D366]/20"
                  >
                    <MessageCircle className="h-4 w-4 fill-[#25D366] text-[#25D366]" />
                    Chat on WhatsApp
                  </a>
                </motion.div>
              </nav>

              {/* Footer contact */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="border-t border-ink/8 px-6 py-5 bg-ink/[0.02] space-y-3"
              >
                <a
                  href="tel:+918115999588"
                  className="flex items-center gap-3 group"
                >
                  <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-ink/40 uppercase tracking-wider">Call us</p>
                    <p className="text-sm font-medium text-ink group-hover:text-gold transition-colors">+91 811 5999 588</p>
                  </div>
                </a>
                <a
                  href="tel:+917275999588"
                  className="flex items-center gap-3 group"
                >
                  <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-ink/40 uppercase tracking-wider">Alternate</p>
                    <p className="text-sm font-medium text-ink group-hover:text-gold transition-colors">+91 727 5999 588</p>
                  </div>
                </a>
                <a
                  href="mailto:hello@trustandtrip.com"
                  className="flex items-center gap-3 group"
                >
                  <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <Mail className="h-3.5 w-3.5 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-ink/40 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium text-ink group-hover:text-gold transition-colors">hello@trustandtrip.com</p>
                  </div>
                </a>

                {/* Social row */}
                <div className="flex items-center gap-3 pt-1">
                  <a href="https://instagram.com/trust_and_trip" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] text-ink/50 hover:text-gold transition-colors">
                    <Instagram className="h-3.5 w-3.5" />
                    @trust_and_trip
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
