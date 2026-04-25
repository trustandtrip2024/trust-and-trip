"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import {
  Menu, X, Phone, MapPin, Heart, Search, BookOpen, MoreVertical,
  Info, User, LogOut, Sparkles, ChevronRight, Mail, Instagram,
  MessageCircle,
} from "lucide-react";
import clsx from "clsx";
import { useTripPlanner } from "@/context/TripPlannerContext";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useUserStore } from "@/store/useUserStore";
import { captureIntent } from "@/lib/capture-intent";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import ThemeToggle from "./ThemeToggle";
import CurrencySwitcher from "./CurrencySwitcher";

const SearchModal = dynamic(() => import("./SearchModal"), { ssr: false });

// ── Top-bar nav (max 4) ───────────────────────────────────
const TOP_LINKS = [
  { href: "/destinations", label: "Destinations" },
  { href: "/experiences",  label: "Experiences"  },
  { href: "/offers",       label: "Offers"       },
  { href: "/plan",         label: "Plan"         },
] as const;

// On tablet (≤1024) collapse all but the first 2
const TABLET_TOP_LINKS = TOP_LINKS.slice(0, 2);

// "More" dropdown — Journal, About, Currency, Wishlist, Search
type MoreItem = { href?: string; onClick?: () => void; label: string; icon: React.ComponentType<{ className?: string }>; render?: "currency" };

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { open: openPlanner } = useTripPlanner();
  const wishlistCount = useWishlistStore((s) => s.wishlist.length);
  const { user } = useUserStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href + "/"));

  const moreItems: MoreItem[] = [
    { href: "/journal",  label: "Journal",  icon: BookOpen },
    { href: "/about",    label: "About",    icon: Info },
    { href: "/wishlist", label: `Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ""}`, icon: Heart },
    { onClick: () => setSearchOpen(true), label: "Search", icon: Search },
    { render: "currency", label: "Currency", icon: Sparkles },
  ];

  const renderTopLink = (l: { href: string; label: string }) => (
    <Link
      key={l.href}
      href={l.href}
      aria-current={isActive(l.href) ? "page" : undefined}
      className={clsx(
        "shrink-0 whitespace-nowrap relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group",
        isActive(l.href)
          ? "text-ink"
          : "text-ink/70 hover:text-ink"
      )}
    >
      {l.label}
      <span
        className={clsx(
          "absolute left-4 right-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-gradient-passion transition-transform duration-300",
          isActive(l.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        )}
      />
    </Link>
  );

  return (
    <>
      {/* Top strip */}
      <div className="relative bg-ink text-cream text-xs py-2 md:py-2.5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-plum to-ink opacity-95 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/3 w-1/3 bg-gradient-to-r from-transparent via-ember/15 to-transparent blur-2xl pointer-events-none" />
        <div className="relative container-custom flex items-center justify-between gap-4">
          <p className="md:hidden text-center w-full text-[11px] font-semibold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="text-gradient-aurora">10% Off · book 60+ days ahead</span>
          </p>
          <div className="hidden md:flex items-center gap-5 opacity-90">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <MapPin className="h-3 w-3 text-ember" />
              Curating journeys across 60+ destinations
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5 whitespace-nowrap">
            <a
              href="tel:+918115999588"
              onClick={() => captureIntent("call_click", { note: "Header top strip" })}
              className="flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <Phone className="h-3 w-3" />+91 8115 999 588
            </a>
            <span className="opacity-40">|</span>
            <span className="font-semibold tracking-wide text-gradient-aurora">10% Off · book 60+ days ahead</span>
          </div>
        </div>
      </div>

      {/* Sticky header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={clsx(
          "sticky top-0 z-50 w-full transition-all duration-500",
          scrolled
            ? "bg-cream/85 backdrop-blur-2xl border-b border-ember/15 shadow-[0_8px_32px_-12px_rgba(45,26,55,0.18)]"
            : "bg-transparent"
        )}
      >
        <div
          className="container-custom flex items-center justify-between h-16 md:h-20 gap-3"
          style={{ flexWrap: "nowrap", whiteSpace: "nowrap" }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-ink flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-glow-ember ring-1 ring-ember/0 group-hover:ring-ember/40">
                <span className="text-gradient-aurora text-lg font-display font-semibold transition-colors duration-500">T</span>
              </div>
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-gradient-passion shadow-[0_0_10px_rgba(242,107,31,0.7)]" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg md:text-xl font-semibold tracking-tight text-ink whitespace-nowrap">
                Trust<span className="text-gradient-passion italic font-bold">&</span>Trip
              </span>
              <span className="eyebrow-ember text-[8.5px] tracking-[0.28em] mt-1 hidden sm:block whitespace-nowrap">
                Crafted with passion
              </span>
            </div>
          </Link>

          {/* Desktop nav: ≥lg = 4 items, md = 2 items + kebab */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-1 flex-1 justify-center min-w-0"
            style={{ flexWrap: "nowrap" }}
          >
            <span className="hidden lg:inline-flex items-center gap-1">
              {TOP_LINKS.map(renderTopLink)}
            </span>
            <span className="inline-flex lg:hidden items-center gap-1">
              {TABLET_TOP_LINKS.map(renderTopLink)}
            </span>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle className="hidden md:inline-flex" />

            {/* More kebab — Radix DropdownMenu */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  aria-label="More options"
                  className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/8 transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-ink/75" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-[60] min-w-[220px] rounded-2xl bg-white border border-ink/10 shadow-soft-lg p-2"
                >
                  {moreItems.map((it) => {
                    if (it.render === "currency") {
                      return (
                        <div key="currency" className="flex items-center justify-between px-3 py-2.5 text-sm text-ink/75">
                          <span className="inline-flex items-center gap-2.5">
                            <it.icon className="h-4 w-4 text-ember" />
                            {it.label}
                          </span>
                          <CurrencySwitcher />
                        </div>
                      );
                    }
                    if (it.onClick) {
                      return (
                        <DropdownMenu.Item
                          key={it.label}
                          onSelect={() => it.onClick?.()}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-ink/75 hover:bg-sand/60 hover:text-ink outline-none cursor-pointer data-[highlighted]:bg-sand/60"
                        >
                          <it.icon className="h-4 w-4 text-ember" />
                          {it.label}
                        </DropdownMenu.Item>
                      );
                    }
                    return (
                      <DropdownMenu.Item key={it.href} asChild>
                        <Link
                          href={it.href!}
                          aria-current={isActive(it.href!) ? "page" : undefined}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-ink/75 hover:bg-sand/60 hover:text-ink outline-none data-[highlighted]:bg-sand/60"
                        >
                          <it.icon className="h-4 w-4 text-ember" />
                          {it.label}
                        </Link>
                      </DropdownMenu.Item>
                    );
                  })}

                  <DropdownMenu.Separator className="my-1.5 h-px bg-ink/8" />
                  {user ? (
                    <>
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-ink/75 hover:bg-sand/60 hover:text-ink outline-none data-[highlighted]:bg-sand/60"
                        >
                          <User className="h-4 w-4 text-ember" />
                          Dashboard
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={async () => { await supabase.auth.signOut(); }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 outline-none cursor-pointer data-[highlighted]:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </DropdownMenu.Item>
                    </>
                  ) : (
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/login"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-ink/75 hover:bg-sand/60 hover:text-ink outline-none data-[highlighted]:bg-sand/60"
                      >
                        <User className="h-4 w-4 text-ember" />
                        Sign In
                      </Link>
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Plan My Trip CTA — desktop */}
            <button
              onClick={() => openPlanner()}
              className="hidden md:inline-flex btn-passion !py-2.5 !px-5 !text-xs whitespace-nowrap"
            >
              Plan My Trip
            </button>

            {/* Mobile controls */}
            <ThemeToggle className="md:hidden !h-9 !w-9" />
            <a
              href="tel:+918115999588"
              onClick={() => captureIntent("call_click", { note: "Header mobile call icon" })}
              className="md:hidden p-2 rounded-full hover:bg-ember/10 transition-colors"
              aria-label="Call"
            >
              <Phone className="h-[18px] w-[18px] text-ink" />
            </a>

            {/* Mobile hamburger — Radix Dialog */}
            <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
              <Dialog.Trigger asChild>
                <button
                  aria-label="Menu"
                  className="md:hidden p-2 rounded-full hover:bg-ink/5 transition-colors"
                >
                  <Menu className="h-5 w-5 text-ink" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
                <Dialog.Content
                  className="fixed right-0 top-0 bottom-0 z-[70] w-[88vw] max-w-sm bg-cream flex flex-col overflow-hidden focus:outline-none data-[state=open]:animate-slide-up"
                >
                  <div className="flex items-center justify-between px-6 py-5 border-b border-ink/8">
                    <Dialog.Title className="font-display text-xl font-semibold text-ink">
                      Trust<span className="text-gradient-passion italic font-bold">&</span>Trip
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button aria-label="Close menu" className="h-9 w-9 rounded-full bg-ink/6 flex items-center justify-center">
                        <X className="h-4 w-4 text-ink" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="space-y-0.5">
                      {[...TOP_LINKS, ...moreItems
                        .filter((m) => m.href)
                        .map((m) => ({ href: m.href!, label: m.label.replace(/\s\(\d+\)$/, "") }))
                      ].map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          aria-current={isActive(l.href) ? "page" : undefined}
                          onClick={() => setDrawerOpen(false)}
                          className={clsx(
                            "flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-colors",
                            isActive(l.href) ? "bg-ember/10 text-ember" : "text-ink/80 hover:bg-ink/5 hover:text-ink"
                          )}
                        >
                          {l.label}
                          <ChevronRight className="h-4 w-4 opacity-40" />
                        </Link>
                      ))}

                      <button
                        onClick={() => { setDrawerOpen(false); setSearchOpen(true); }}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-ink/80 hover:bg-ink/5 hover:text-ink"
                      >
                        Search
                        <Search className="h-4 w-4 opacity-50" />
                      </button>

                      {!user ? (
                        <Link
                          href="/login"
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-base font-medium text-ink/80 hover:bg-ink/5"
                        >
                          <User className="h-4 w-4" /> Sign In / Register
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard"
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-base font-medium text-ink/80 hover:bg-ink/5"
                        >
                          <User className="h-4 w-4" /> My Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => { setDrawerOpen(false); openPlanner(); }}
                        className="w-full btn-passion justify-center py-3.5"
                      >
                        Plan My Trip
                      </button>
                      <a
                        href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I'd%20love%20help%20planning%20my%20next%20trip."
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          setDrawerOpen(false);
                          captureIntent("whatsapp_click", { note: "Header drawer WhatsApp" });
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366]/10 text-[#1a9e4e] font-semibold text-sm border border-[#25D366]/20"
                      >
                        <MessageCircle className="h-4 w-4 fill-[#25D366] text-[#25D366]" />
                        Chat on WhatsApp
                      </a>
                    </div>
                  </nav>

                  <div className="border-t border-ink/8 px-6 py-5 bg-ink/[0.02] space-y-3">
                    <a
                      href="tel:+918115999588"
                      onClick={() => captureIntent("call_click", { note: "Header drawer call" })}
                      className="flex items-center gap-3 group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-ember/10 flex items-center justify-center shrink-0">
                        <Phone className="h-3.5 w-3.5 text-ember" />
                      </div>
                      <div>
                        <p className="text-[10px] text-ink/55 uppercase tracking-wider">Call</p>
                        <p className="text-sm font-medium text-ink group-hover:text-ember transition-colors">+91 811 5999 588</p>
                      </div>
                    </a>
                    <a href="mailto:hello@trustandtrip.com" className="flex items-center gap-3 group">
                      <div className="h-8 w-8 rounded-lg bg-ember/10 flex items-center justify-center shrink-0">
                        <Mail className="h-3.5 w-3.5 text-ember" />
                      </div>
                      <div>
                        <p className="text-[10px] text-ink/55 uppercase tracking-wider">Email</p>
                        <p className="text-sm font-medium text-ink group-hover:text-ember transition-colors">hello@trustandtrip.com</p>
                      </div>
                    </a>
                    <a
                      href="https://instagram.com/trust_and_trip"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-ink/65 hover:text-ember transition-colors pt-1"
                    >
                      <Instagram className="h-3.5 w-3.5" />
                      @trust_and_trip
                    </a>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </motion.header>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
