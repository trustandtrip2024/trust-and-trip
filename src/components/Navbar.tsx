"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Phone, MapPin, Heart, Search, Mail, Instagram, MessageCircle,
  ChevronDown, User, LayoutDashboard, LogOut, Mountain, Globe2, Compass,
  Waves, TreePine, Star, Crown, Users, Backpack, Sunset, Church,
} from "lucide-react";
import clsx from "clsx";
import { useTripPlanner } from "@/context/TripPlannerContext";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useUserStore } from "@/store/useUserStore";
import { captureIntent } from "@/lib/capture-intent";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
const SearchModal = dynamic(() => import("./SearchModal"), { ssr: false });

// ── Dropdown data ──────────────────────────────────────────
const INDIA_DESTINATIONS = [
  { label: "Rajasthan", href: "/destinations/rajasthan", icon: "🏜️" },
  { label: "Kerala", href: "/destinations/kerala", icon: "🌴" },
  { label: "Goa", href: "/destinations/goa", icon: "🏖️" },
  { label: "Himachal Pradesh", href: "/destinations/himachal", icon: "🏔️" },
  { label: "Uttarakhand", href: "/destinations/uttarakhand", icon: "⛰️" },
  { label: "Kashmir", href: "/destinations/kashmir", icon: "❄️" },
  { label: "Andaman", href: "/destinations/andaman", icon: "🐠" },
  { label: "Coorg", href: "/destinations/coorg", icon: "☕" },
];

const INTL_DESTINATIONS = [
  { label: "Bali", href: "/destinations/bali", icon: "🌺" },
  { label: "Maldives", href: "/destinations/maldives", icon: "🏝️" },
  { label: "Thailand", href: "/destinations/thailand", icon: "🐘" },
  { label: "Dubai", href: "/destinations/dubai", icon: "🌆" },
  { label: "Singapore", href: "/destinations/singapore", icon: "🦁" },
  { label: "Europe", href: "/destinations/europe", icon: "🗼" },
  { label: "Sri Lanka", href: "/destinations/sri-lanka", icon: "🌿" },
  { label: "Vietnam", href: "/destinations/vietnam", icon: "🛶" },
];

const EXPERIENCES = [
  { label: "Honeymoon Escapes", href: "/experiences/honeymoon", icon: Heart, color: "text-rose-500" },
  { label: "Family Adventures", href: "/experiences/family", icon: Users, color: "text-sky-500" },
  { label: "Pilgrim Yatras", href: "/experiences/pilgrim", icon: Church, color: "text-amber-600" },
  { label: "Adventure Expeditions", href: "/experiences/adventure", icon: Backpack, color: "text-orange-500" },
  { label: "Luxury Escapes", href: "/experiences/luxury", icon: Crown, color: "text-yellow-600" },
  { label: "Wellness Retreats", href: "/experiences/wellness", icon: Sunset, color: "text-teal-500" },
  { label: "Solo Journeys", href: "/experiences/solo", icon: Compass, color: "text-purple-500" },
  { label: "Group Tours", href: "/experiences/group", icon: Star, color: "text-green-500" },
  { label: "Weekend Getaways", href: "/experiences/weekend", icon: TreePine, color: "text-emerald-600" },
  { label: "Cultural Immersions", href: "/experiences/cultural", icon: Globe2, color: "text-indigo-500" },
];

const simpleLinks = [
  { href: "/offers", label: "Offers" },
  { href: "/plan", label: "Plan a Trip" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
];

// ── Dropdown panel component ──────────────────────────────
function DestinationsDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-full left-0 pt-2 z-50 w-[520px]">
      <div className="bg-white border border-ink/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-ink/6">
          {/* India */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-3.5 w-3.5 text-gold" />
              <p className="text-xs font-semibold text-ink uppercase tracking-wider">Explore India</p>
            </div>
            <div className="space-y-0.5">
              {INDIA_DESTINATIONS.map((d) => (
                <Link key={d.href} href={d.href} onClick={onClose}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-ink/70 hover:bg-sand/50 hover:text-ink transition-colors group">
                  <span className="text-base">{d.icon}</span>
                  {d.label}
                </Link>
              ))}
            </div>
            <Link href="/destinations" onClick={onClose}
              className="mt-3 flex items-center gap-1 text-xs text-gold hover:underline pt-2 border-t border-ink/5">
              View all India destinations →
            </Link>
          </div>

          {/* International */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe2 className="h-3.5 w-3.5 text-gold" />
              <p className="text-xs font-semibold text-ink uppercase tracking-wider">International</p>
            </div>
            <div className="space-y-0.5">
              {INTL_DESTINATIONS.map((d) => (
                <Link key={d.href} href={d.href} onClick={onClose}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-ink/70 hover:bg-sand/50 hover:text-ink transition-colors">
                  <span className="text-base">{d.icon}</span>
                  {d.label}
                </Link>
              ))}
            </div>
            <Link href="/destinations?type=international" onClick={onClose}
              className="mt-3 flex items-center gap-1 text-xs text-gold hover:underline pt-2 border-t border-ink/5">
              View all international →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperiencesDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-full left-0 pt-2 z-50 w-72">
      <div className="bg-white border border-ink/10 rounded-2xl shadow-2xl p-3">
        {EXPERIENCES.map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href} onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink/70 hover:bg-sand/50 hover:text-ink transition-colors group">
            <Icon className={`h-4 w-4 shrink-0 ${color}`} />
            {label}
          </Link>
        ))}
        <div className="border-t border-ink/6 mt-1 pt-1">
          <Link href="/experiences" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gold hover:bg-gold/8 transition-colors">
            <Compass className="h-4 w-4 shrink-0 text-gold" />
            All Experiences →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main Navbar ────────────────────────────────────────────
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string>("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string>("");
  const dropdownTimer = useRef<NodeJS.Timeout | null>(null);

  const { open: openPlanner } = useTripPlanner();
  const wishlistCount = useWishlistStore((s) => s.wishlist.length);
  const { user } = useUserStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openDropdown = (name: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setActiveDropdown(name);
  };
  const closeDropdown = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(""), 120);
  };

  return (
    <>
      {/* Top strip */}
      <div className="bg-ink text-cream text-xs py-2 md:py-2.5">
        <div className="container-custom flex items-center justify-between gap-4">
          <p className="md:hidden text-gold text-center w-full text-[11px] font-medium tracking-wide">
            🎉 10% Off on bookings 60+ days in advance ·{" "}
            <a href="tel:+918115999588" onClick={() => captureIntent("call_click", { note: "Navbar top strip (mobile)" })} className="text-cream/80 hover:text-gold">Call +91 8115 999 588</a>
          </p>
          <div className="hidden md:flex items-center gap-5 opacity-75">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-gold" />
              Curating journeys across 60+ destinations
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <a href="tel:+918115999588" onClick={() => captureIntent("call_click", { note: "Navbar top strip (desktop)" })} className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <Phone className="h-3 w-3" />+91 8115 999 588
            </a>
            <span className="opacity-40">|</span>
            <span className="text-gold">🎉 10% Off · book 60+ days ahead</span>
          </div>
        </div>
      </div>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={clsx(
          "sticky top-0 z-50 w-full transition-all duration-500",
          scrolled ? "bg-cream/92 backdrop-blur-xl border-b border-ink/10 shadow-soft" : "bg-transparent"
        )}
      >
        <div className="container-custom flex items-center justify-between h-16 md:h-20 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-ink flex items-center justify-center group-hover:bg-gold transition-colors duration-500">
                <span className="text-gold group-hover:text-ink text-lg font-display font-semibold transition-colors duration-500">T</span>
              </div>
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-gold" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg md:text-xl font-medium tracking-tight text-ink">
                Trust<span className="text-gold">&</span>Trip
              </span>
              <span className="text-[9px] uppercase tracking-[0.22em] text-ink/50 mt-0.5 hidden sm:block">
                Crafting Reliable Travel
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">

            {/* Destinations dropdown */}
            <div className="relative" onMouseEnter={() => openDropdown("destinations")} onMouseLeave={closeDropdown}>
              <button className={clsx(
                "flex items-center gap-1 px-4 py-2 text-sm transition-colors duration-200 rounded-lg group",
                activeDropdown === "destinations" ? "text-ink bg-ink/5" : "text-ink/70 hover:text-ink hover:bg-ink/4"
              )}>
                Destinations
                <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform duration-200", activeDropdown === "destinations" && "rotate-180")} />
              </button>
              <AnimatePresence>
                {activeDropdown === "destinations" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={() => openDropdown("destinations")}
                    onMouseLeave={closeDropdown}
                  >
                    <DestinationsDropdown onClose={() => setActiveDropdown("")} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Experiences dropdown */}
            <div className="relative" onMouseEnter={() => openDropdown("experiences")} onMouseLeave={closeDropdown}>
              <button className={clsx(
                "flex items-center gap-1 px-4 py-2 text-sm transition-colors duration-200 rounded-lg",
                activeDropdown === "experiences" ? "text-ink bg-ink/5" : "text-ink/70 hover:text-ink hover:bg-ink/4"
              )}>
                Experiences
                <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform duration-200", activeDropdown === "experiences" && "rotate-180")} />
              </button>
              <AnimatePresence>
                {activeDropdown === "experiences" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={() => openDropdown("experiences")}
                    onMouseLeave={closeDropdown}
                  >
                    <ExperiencesDropdown onClose={() => setActiveDropdown("")} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {simpleLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="relative px-4 py-2 text-sm text-ink/70 hover:text-ink transition-colors duration-200 rounded-lg hover:bg-ink/4 group">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full border border-ink/12 text-ink/50 hover:text-ink hover:border-ink/25 transition-all text-xs"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Search</span>
              <kbd className="hidden xl:inline text-[10px] border border-ink/15 rounded px-1 py-0.5 text-ink/30">⌘K</kbd>
            </button>

            <Link href="/wishlist" aria-label="Wishlist"
              className="relative hidden md:flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5 transition-colors">
              <Heart className="h-4 w-4 text-ink/60" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="h-9 w-9 rounded-full bg-gold/20 hover:bg-gold/30 flex items-center justify-center transition-colors text-xs font-semibold text-ink"
                >
                  {(user.user_metadata?.full_name || user.email || "U").slice(0, 2).toUpperCase()}
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-11 z-50 bg-white border border-ink/10 rounded-2xl shadow-xl w-52 py-2 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-ink/8 mb-1">
                        <p className="text-xs font-semibold text-ink truncate">{user.user_metadata?.full_name || "Traveller"}</p>
                        <p className="text-[10px] text-ink/45 truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink/70 hover:bg-sand/40 hover:text-ink transition-colors">
                        <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                      </Link>
                      <Link href="/dashboard/bookings" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink/70 hover:bg-sand/40 hover:text-ink transition-colors">
                        <MapPin className="h-3.5 w-3.5" /> My Bookings
                      </Link>
                      <Link href="/refer" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink/70 hover:bg-sand/40 hover:text-ink transition-colors">
                        <Star className="h-3.5 w-3.5" /> Refer & Earn
                      </Link>
                      <div className="border-t border-ink/6 mt-1 pt-1">
                        <button
                          onClick={async () => { await supabase.auth.signOut(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500/80 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="hidden md:flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-ink/15 text-xs font-medium text-ink/70 hover:border-ink/30 hover:text-ink transition-all">
                <User className="h-3.5 w-3.5" />
                Sign In
              </Link>
            )}

            <button
              onClick={() => openPlanner()}
              className="hidden md:inline-flex btn-primary !py-2.5 !px-5 !text-xs whitespace-nowrap"
            >
              Plan My Trip
            </button>

            {/* Mobile controls */}
            <a href="tel:+918115999588" onClick={() => captureIntent("call_click", { note: "Navbar mobile call icon" })} className="lg:hidden p-2 rounded-full hover:bg-gold/10 transition-colors" aria-label="Call">
              <Phone className="h-[18px] w-[18px] text-ink" />
            </a>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-ink/5 transition-colors" aria-label="Menu">
              <Menu className="h-5 w-5 text-ink" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile drawer ─────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-[60]" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-[88vw] max-w-sm bg-cream z-[70] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-ink/8">
                <span className="font-display text-xl font-medium text-ink">Trust<span className="text-gold">&</span>Trip</span>
                <button onClick={() => setMobileOpen(false)} className="h-9 w-9 rounded-full bg-ink/6 flex items-center justify-center">
                  <X className="h-4 w-4 text-ink" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-0.5">
                  {/* Destinations accordion */}
                  <div>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === "destinations" ? "" : "destinations")}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-ink/80 hover:bg-ink/5"
                    >
                      Destinations
                      <ChevronDown className={clsx("h-4 w-4 text-ink/40 transition-transform", mobileExpanded === "destinations" && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {mobileExpanded === "destinations" && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                          className="overflow-hidden pl-4">
                          <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-ink/40 font-semibold">India</p>
                          {INDIA_DESTINATIONS.map((d) => (
                            <Link key={d.href} href={d.href} onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-ink/70 hover:bg-ink/5 hover:text-ink">
                              <span>{d.icon}</span>{d.label}
                            </Link>
                          ))}
                          <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-ink/40 font-semibold">International</p>
                          {INTL_DESTINATIONS.map((d) => (
                            <Link key={d.href} href={d.href} onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-ink/70 hover:bg-ink/5 hover:text-ink">
                              <span>{d.icon}</span>{d.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Experiences accordion */}
                  <div>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === "experiences" ? "" : "experiences")}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-ink/80 hover:bg-ink/5"
                    >
                      Experiences
                      <ChevronDown className={clsx("h-4 w-4 text-ink/40 transition-transform", mobileExpanded === "experiences" && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {mobileExpanded === "experiences" && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                          className="overflow-hidden pl-4">
                          {EXPERIENCES.map(({ label, href, icon: Icon, color }) => (
                            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink/70 hover:bg-ink/5 hover:text-ink">
                              <Icon className={`h-4 w-4 shrink-0 ${color}`} />{label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {simpleLinks.map((link, i) => (
                    <motion.div key={link.href} initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 + 0.1 }}>
                      <Link href={link.href} onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-ink/80 hover:bg-ink/5 hover:text-ink">
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Auth link in mobile */}
                  {!user && (
                    <Link href="/login" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-base font-medium text-ink/80 hover:bg-ink/5">
                      <User className="h-4 w-4" /> Sign In / Register
                    </Link>
                  )}
                  {user && (
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-base font-medium text-ink/80 hover:bg-ink/5">
                      <LayoutDashboard className="h-4 w-4" /> My Dashboard
                    </Link>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <button onClick={() => { setMobileOpen(false); openPlanner(); }}
                    className="w-full btn-primary justify-center py-3.5">
                    Plan My Trip
                  </button>
                  <a
                    href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I'd%20love%20help%20planning%20my%20next%20trip."
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => {
                      setMobileOpen(false);
                      captureIntent("whatsapp_click", { note: "Navbar mobile menu — WhatsApp CTA" });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366]/10 text-[#1a9e4e] font-semibold text-sm border border-[#25D366]/20"
                  >
                    <MessageCircle className="h-4 w-4 fill-[#25D366] text-[#25D366]" />
                    Chat on WhatsApp
                  </a>
                </div>
              </nav>

              {/* Footer contact */}
              <div className="border-t border-ink/8 px-6 py-5 bg-ink/[0.02] space-y-3">
                <a href="tel:+918115999588" onClick={() => captureIntent("call_click", { note: "Navbar mobile menu footer call" })} className="flex items-center gap-3 group">
                  <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-ink/40 uppercase tracking-wider">Call us</p>
                    <p className="text-sm font-medium text-ink group-hover:text-gold transition-colors">+91 811 5999 588</p>
                  </div>
                </a>
                <a href="mailto:hello@trustandtrip.com" className="flex items-center gap-3 group">
                  <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <Mail className="h-3.5 w-3.5 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-ink/40 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium text-ink group-hover:text-gold transition-colors">hello@trustandtrip.com</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 pt-1">
                  <a href="https://instagram.com/trust_and_trip" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] text-ink/50 hover:text-gold transition-colors">
                    <Instagram className="h-3.5 w-3.5" />
                    @trust_and_trip
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
