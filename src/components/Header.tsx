"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Menu, X, Phone, Heart, BookOpen, MoreVertical,
  Info, User, LogOut, Sparkles, ChevronRight, ChevronDown, Mail, Instagram,
  MessageCircle,
} from "lucide-react";
import clsx from "clsx";
import { useTripPlanner } from "@/context/TripPlannerContext";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useUserStore } from "@/store/useUserStore";
import { captureIntent } from "@/lib/capture-intent";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "./ThemeToggle";
import CurrencySwitcher from "./CurrencySwitcher";
import GoogleReviewsBadge from "./GoogleReviewsBadge";

// FlashDealRotator is SSR-safe (renders DEALS[0] server-side; setInterval
// only spins up in useEffect on client), so we render it normally to avoid
// a blank-text gap on every reload.
import FlashDealRotator from "./FlashDealRotator";

// ── Top-bar nav (max 4) ───────────────────────────────────
type DropdownLink = { label: string; href: string; emoji?: string };
type TopLink = { href: string; label: string; dropdown?: { groups: { title: string; items: DropdownLink[] }[]; cta?: DropdownLink } };

const DEST_INDIA: DropdownLink[] = [
  { label: "Bali",        href: "/destinations/bali",        emoji: "🌺" },
  { label: "Kerala",      href: "/destinations/kerala",      emoji: "🌴" },
  { label: "Goa",         href: "/destinations/goa",         emoji: "🏖️" },
  { label: "Rajasthan",   href: "/destinations/rajasthan",   emoji: "🏜️" },
  { label: "Manali",      href: "/destinations/manali",      emoji: "🏔️" },
  { label: "Ladakh",      href: "/destinations/ladakh",      emoji: "⛰️" },
  { label: "Andaman",     href: "/destinations/andaman",     emoji: "🐠" },
  { label: "Uttarakhand", href: "/destinations/uttarakhand", emoji: "🛕" },
];
const DEST_INTL: DropdownLink[] = [
  { label: "Maldives",    href: "/destinations/maldives",    emoji: "🏝️" },
  { label: "Switzerland", href: "/destinations/switzerland", emoji: "🏔️" },
  { label: "Thailand",    href: "/destinations/thailand",    emoji: "🐘" },
  { label: "Dubai",       href: "/destinations/dubai",       emoji: "🌆" },
  { label: "Singapore",   href: "/destinations/singapore",   emoji: "🦁" },
  { label: "Japan",       href: "/destinations/japan",       emoji: "🗾" },
  { label: "Sri Lanka",   href: "/destinations/sri-lanka",   emoji: "🌿" },
  { label: "Vietnam",     href: "/destinations/vietnam",     emoji: "🛶" },
];
const EXP_LIST: DropdownLink[] = [
  { label: "Honeymoon",  href: "/experiences/honeymoon",  emoji: "💑" },
  { label: "Family",     href: "/experiences/family",     emoji: "👨‍👩‍👧‍👦" },
  { label: "Solo",       href: "/experiences/solo",       emoji: "🧭" },
  { label: "Group",      href: "/experiences/group",      emoji: "🎉" },
  { label: "Adventure",  href: "/experiences/adventure",  emoji: "🎒" },
  { label: "Wellness",   href: "/experiences/wellness",   emoji: "🌿" },
  { label: "Pilgrim",    href: "/experiences/pilgrim",    emoji: "🛕" },
  { label: "Luxury",     href: "/experiences/luxury",     emoji: "👑" },
];
const TIER_LIST: DropdownLink[] = [
  { label: "Essentials · Pocket-friendly", href: "/essentials", emoji: "💼" },
  { label: "Signature · Most trips",       href: "/signature",  emoji: "🧭" },
  { label: "Private · Bespoke luxury",     href: "/private",    emoji: "👑" },
];
const OFFER_LIST: DropdownLink[] = [
  { label: "Flash Deals",         href: "/offers?kind=flash",       emoji: "⚡" },
  { label: "Early-Bird",          href: "/offers?kind=early-bird",  emoji: "🌅" },
  { label: "Last-Minute",         href: "/offers?kind=last-minute", emoji: "⏳" },
  { label: "Honeymoon Specials",  href: "/offers?theme=honeymoon",  emoji: "💑" },
  { label: "Yatra Specials",      href: "/offers?theme=yatra",      emoji: "🛕" },
  { label: "Group Bonanza",       href: "/offers?theme=group",      emoji: "🎉" },
];

const TOP_LINKS: TopLink[] = [
  {
    href: "/destinations", label: "Destinations",
    dropdown: {
      groups: [
        { title: "India",         items: DEST_INDIA },
        { title: "International", items: DEST_INTL  },
      ],
      cta: { label: "View all 60+ destinations →", href: "/destinations" },
    },
  },
  {
    href: "/experiences", label: "Experiences",
    dropdown: {
      groups: [
        { title: "By tier", items: TIER_LIST },
        { title: "Browse by mood", items: EXP_LIST },
      ],
      cta: { label: "All experiences →", href: "/experiences" },
    },
  },
  {
    href: "/offers", label: "Offers",
    dropdown: {
      groups: [{ title: "Live deals", items: OFFER_LIST }],
      cta: { label: "All offers →", href: "/offers" },
    },
  },
  { href: "/plan", label: "Plan" },
];

// On tablet (≤1024) collapse all but the first 2
const TABLET_TOP_LINKS = TOP_LINKS.slice(0, 2);

// "More" dropdown — Journal, About, Currency, Wishlist, Search
type MoreItem = { href?: string; onClick?: () => void; label: string; icon: React.ComponentType<{ className?: string }>; render?: "currency" };

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { open: openPlanner } = useTripPlanner();
  const wishlistCount = useWishlistStore((s) => s.wishlist.length);
  const { user } = useUserStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-close drawer on route change so internal Link navigations don't
  // leave it open behind the new page. Belt-and-suspenders: each Link inside
  // the drawer also calls onNavigate, but pathname-based reset covers
  // browser back/forward and any future link that forgets to wire it up.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href + "/"));

  const moreItems: MoreItem[] = [
    { href: "/why-us",   label: "Why Trust and Trip", icon: Sparkles },
    { href: "/journal",  label: "Journal",  icon: BookOpen },
    { href: "/about",    label: "About",    icon: Info },
    { href: "/wishlist", label: `Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ""}`, icon: Heart },
    { render: "currency", label: "Currency", icon: Sparkles },
  ];

  const renderTopLink = (l: TopLink) => {
    // Plain link — no dropdown, no chevron, no menu trigger.
    if (!l.dropdown) {
      return (
        <Link
          key={l.href}
          href={l.href}
          aria-current={isActive(l.href) ? "page" : undefined}
          className={clsx(
            "shrink-0 whitespace-nowrap relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
            isActive(l.href) ? "text-tat-charcoal" : "text-tat-charcoal/70 hover:text-tat-charcoal"
          )}
        >
          {l.label}
          <span
            className={clsx(
              "absolute left-4 right-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-tat-teal transition-transform duration-300",
              isActive(l.href) ? "scale-x-100" : "scale-x-0"
            )}
          />
        </Link>
      );
    }

    // Dropdown link — Radix DropdownMenu so it opens on tap/click on every
    // device (including touch screens that have no hover state). Chevron
    // marker rotates 180° while the menu is open as a visual affordance.
    return (
      <DropdownMenu.Root key={l.href} modal={false}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-haspopup="menu"
            aria-current={isActive(l.href) ? "page" : undefined}
            className={clsx(
              "group/topnav shrink-0 inline-flex items-center gap-1 whitespace-nowrap relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
              isActive(l.href) ? "text-tat-charcoal" : "text-tat-charcoal/70 hover:text-tat-charcoal"
            )}
          >
            {l.label}
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/topnav:rotate-180 data-[state=open]:rotate-180"
              aria-hidden
            />
            <span
              className={clsx(
                "absolute left-4 right-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-tat-teal transition-transform duration-300",
                isActive(l.href) ? "scale-x-100" : "scale-x-0"
              )}
            />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="center"
            sideOffset={10}
            className="z-[60] bg-white rounded-card border border-tat-charcoal/10 shadow-rail p-4 min-w-[300px] data-[state=open]:animate-fade-in"
          >
            <div className={clsx("grid gap-4", l.dropdown.groups.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
              {l.dropdown.groups.map((g) => (
                <div key={g.title}>
                  <p className="tt-eyebrow !text-[10px] mb-2">{g.title}</p>
                  <ul className="space-y-0.5">
                    {g.items.map((it) => (
                      <li key={it.href}>
                        <DropdownMenu.Item asChild>
                          <Link
                            href={it.href}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-tat-charcoal/80 hover:bg-tat-cream-warm/40 hover:text-tat-charcoal outline-none data-[highlighted]:bg-tat-cream-warm/40 data-[highlighted]:text-tat-charcoal transition-colors duration-120"
                          >
                            {it.emoji && <span aria-hidden>{it.emoji}</span>}
                            <span>{it.label}</span>
                          </Link>
                        </DropdownMenu.Item>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {l.dropdown.cta && (
              <DropdownMenu.Item asChild>
                <Link
                  href={l.dropdown.cta.href}
                  className="mt-3 pt-3 border-t border-tat-charcoal/8 inline-flex items-center gap-1 text-xs font-semibold text-tat-teal hover:text-tat-teal-deep outline-none"
                >
                  {l.dropdown.cta.label}
                </Link>
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  };

  return (
    <>
      {/* Top strip — single rolling deal + phone. Earlier this row also
          carried a "Curating journeys across 60+ destinations" tagline,
          but that was passive chrome and added density without action. */}
      <div className="relative bg-tat-charcoal text-tat-paper text-xs py-1.5 md:py-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-tat-charcoal via-tat-charcoal to-tat-charcoal opacity-95 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/3 w-1/3 bg-gradient-to-r from-transparent via-tat-orange/15 to-transparent blur-2xl pointer-events-none" />
        <div className="relative container-custom flex items-center justify-between gap-4">
          <p className="lg:hidden text-center w-full text-[11px] font-semibold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="text-tat-orange"><FlashDealRotator /></span>
          </p>
          <div className="hidden lg:flex items-center gap-2 whitespace-nowrap">
            <span className="font-semibold tracking-wide text-tat-orange"><FlashDealRotator /></span>
          </div>
          <div className="hidden lg:flex items-center gap-3 whitespace-nowrap">
            <GoogleReviewsBadge variant="dark" />
            <a
              href="tel:+918115999588"
              onClick={() => captureIntent("call_click", { note: "Header top strip" })}
              className="flex items-center gap-1.5 hover:text-tat-gold transition-colors"
            >
              <Phone className="h-3 w-3" />+91 8115 999 588
            </a>
          </div>
        </div>
      </div>

      {/* Sticky header — no entrance animation; persistent chrome should not
          fade in on every reload (caused a visible flicker before paint). */}
      <header
        className={clsx(
          "sticky top-0 z-50 w-full transition-colors duration-300",
          // Mobile: always dark navbar (matches Yatra-style reference)
          "bg-tat-charcoal md:bg-transparent",
          scrolled &&
            "md:bg-tat-paper/85 md:backdrop-blur-2xl md:border-b md:border-tat-orange/15 md:shadow-[0_8px_32px_-12px_rgba(45,26,55,0.18)]"
        )}
      >
        <div className="container-custom flex flex-nowrap items-center justify-between h-16 md:h-20 gap-3 overflow-hidden">
          {/* Mobile hamburger — placed first so it sits at far left.
              Morphs Menu ↔ X based on drawerOpen so the trigger doubles as
              an in-flow close affordance (the in-drawer X still works too).
              A small orange dot appears when the user has wishlist items
              they haven't acted on, nudging them to revisit the menu. */}
          <button
            type="button"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
            className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors -ml-1"
          >
            <span className="relative inline-block h-5 w-5">
              <Menu
                className={clsx(
                  "absolute inset-0 h-5 w-5 text-tat-paper transition-all duration-200",
                  drawerOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
                )}
                aria-hidden
              />
              <X
                className={clsx(
                  "absolute inset-0 h-5 w-5 text-tat-paper transition-all duration-200",
                  drawerOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
                )}
                aria-hidden
              />
              {wishlistCount > 0 && !drawerOpen && (
                <span
                  className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-tat-orange ring-2 ring-tat-charcoal"
                  aria-hidden
                />
              )}
            </span>
          </button>

          {/* Logo — desktop / tablet (≥md) */}
          <Link href="/" className="hidden lg:flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-tat-teal flex items-center justify-center shadow-glow-ember ring-1 ring-tat-gold/30 transition-all duration-500 group-hover:scale-105 group-hover:ring-tat-gold/70 group-hover:shadow-glow-gold">
                <span className="text-white text-lg font-display font-semibold tracking-tight">T</span>
              </div>
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-tat-gold shadow-[0_0_10px_rgba(200,147,42,0.85)] ring-1 ring-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg md:text-xl font-semibold tracking-tight whitespace-nowrap">
                <span className="text-tat-charcoal">Trust</span>
                <span className="text-tat-gold italic">&amp;</span>
                <span className="text-tat-teal">Trip</span>
              </span>
              <span className="eyebrow-ember text-[8.5px] tracking-[0.28em] mt-1 hidden sm:block whitespace-nowrap text-tat-gold">
                Crafted with passion
              </span>
            </div>
          </Link>

          {/* Logo — mobile (compact, on dark) */}
          <Link href="/" className="lg:hidden flex items-center gap-2 shrink-0">
            <span className="relative h-8 w-8 rounded-md bg-tat-teal grid place-items-center font-display font-semibold text-tat-paper text-sm">
              T
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-tat-gold ring-1 ring-tat-charcoal" />
            </span>
            <span className="font-display text-base font-semibold tracking-tight text-tat-paper whitespace-nowrap">
              Trust<span className="text-tat-gold italic"> &amp; </span>Trip
            </span>
          </Link>

          {/* Desktop nav: ≥lg = 4 items, md = 2 items + kebab */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-1 flex-1 justify-center min-w-0"
            style={{ flexWrap: "nowrap" }}
          >
            <span className="hidden lg:inline-flex items-center gap-1">
              {TOP_LINKS.map(renderTopLink)}
            </span>
            <span className="inline-flex lg:hidden items-center gap-1">
              {TABLET_TOP_LINKS.map(renderTopLink)}
            </span>
          </nav>

          {/* Right cluster — kept tight: theme + More + primary CTA on
              desktop. Currency switcher used to live here as a visible
              chip but is now reachable inside the More menu, freeing
              ~80px of horizontal density. */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Single theme toggle; responsive Tailwind classes split the
                paint between the dark mobile header and the light desktop
                header without rendering the component twice in DOM. */}
            <ThemeToggle className="text-tat-paper hover:bg-white/10 lg:text-tat-charcoal/60 lg:hover:bg-tat-charcoal/5" />

            {/* More kebab — Radix DropdownMenu */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  aria-label="More options"
                  className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-tat-charcoal/8 transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-tat-charcoal/75" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-[60] min-w-[220px] rounded-2xl bg-white border border-tat-charcoal/10 shadow-soft-lg p-2"
                >
                  {moreItems.map((it) => {
                    if (it.render === "currency") {
                      return (
                        <div key="currency" className="flex items-center justify-between px-3 py-2.5 text-sm text-tat-charcoal/75">
                          <span className="inline-flex items-center gap-2.5">
                            <it.icon className="h-4 w-4 text-tat-orange" />
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
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-tat-charcoal/75 hover:bg-tat-cream/60 hover:text-tat-charcoal outline-none cursor-pointer data-[highlighted]:bg-tat-cream/60"
                        >
                          <it.icon className="h-4 w-4 text-tat-orange" />
                          {it.label}
                        </DropdownMenu.Item>
                      );
                    }
                    return (
                      <DropdownMenu.Item key={it.href} asChild>
                        <Link
                          href={it.href!}
                          aria-current={isActive(it.href!) ? "page" : undefined}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-tat-charcoal/75 hover:bg-tat-cream/60 hover:text-tat-charcoal outline-none data-[highlighted]:bg-tat-cream/60"
                        >
                          <it.icon className="h-4 w-4 text-tat-orange" />
                          {it.label}
                        </Link>
                      </DropdownMenu.Item>
                    );
                  })}

                  <DropdownMenu.Separator className="my-1.5 h-px bg-tat-charcoal/8" />
                  {user ? (
                    <>
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-tat-charcoal/75 hover:bg-tat-cream/60 hover:text-tat-charcoal outline-none data-[highlighted]:bg-tat-cream/60"
                        >
                          <User className="h-4 w-4 text-tat-orange" />
                          Dashboard
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={async () => { await supabase.auth.signOut(); }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-tat-danger-fg hover:bg-tat-danger-bg outline-none cursor-pointer data-[highlighted]:bg-tat-danger-bg"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </DropdownMenu.Item>
                    </>
                  ) : (
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/login"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-tat-charcoal/75 hover:bg-tat-cream/60 hover:text-tat-charcoal outline-none data-[highlighted]:bg-tat-cream/60"
                      >
                        <User className="h-4 w-4 text-tat-orange" />
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
              className="hidden lg:inline-flex btn-primary !py-2.5 !px-5 !text-xs whitespace-nowrap"
            >
              Plan My Trip
            </button>

            {/* Mobile cluster — phone pill + profile + hamburger */}
            <a
              href="tel:+918115999588"
              onClick={() => captureIntent("call_click", { note: "Header mobile call pill" })}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-tat-teal text-white text-[12px] font-semibold whitespace-nowrap shadow-[0_4px_12px_-4px_rgba(14,124,123,0.55)]"
              aria-label="Call Trust and Trip"
            >
              <span className="grid place-items-center h-5 w-5 rounded-full bg-white/20">
                <Phone className="h-3 w-3 fill-white text-white" />
              </span>
              {/* Hide digits on the very narrowest phones to keep the
                  header row from overflowing 375px viewports. */}
              <span className="hidden xs:inline sm:inline">8115 999 588</span>
              <span className="sm:hidden">Call</span>
            </a>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="lg:hidden inline-flex items-center gap-0.5 h-9 px-1.5 rounded-full text-tat-paper hover:bg-white/10 transition-colors"
              aria-label={user ? "My dashboard" : "Sign in"}
            >
              <span className="h-7 w-7 rounded-full border border-white/40 grid place-items-center">
                <User className="h-3.5 w-3.5" />
              </span>
              <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
            </Link>
            {/* Mobile drawer — controlled by hamburger button placed earlier */}
            <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-tat-charcoal/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
                <Dialog.Content
                  className="fixed right-0 top-0 bottom-0 z-[70] w-[88vw] max-w-sm bg-tat-paper flex flex-col overflow-hidden focus:outline-none data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right"
                >
                  <div className="flex items-center justify-between px-6 py-5 border-b border-tat-charcoal/8">
                    {user ? (
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="h-9 w-9 shrink-0 rounded-full bg-tat-teal text-tat-paper grid place-items-center font-display font-semibold text-sm">
                          {(user.email?.[0] ?? "T").toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <Dialog.Title className="text-[11px] uppercase tracking-[0.2em] text-tat-charcoal/55 font-semibold">
                            Welcome back
                          </Dialog.Title>
                          <p className="text-sm font-medium text-tat-charcoal truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Dialog.Title className="font-display text-xl font-semibold tracking-tight">
                        <span className="text-tat-charcoal">Trust</span>
                        <span className="text-tat-gold italic">&amp;</span>
                        <span className="text-tat-teal">Trip</span>
                      </Dialog.Title>
                    )}
                    <Dialog.Close asChild>
                      <button aria-label="Close menu" className="h-9 w-9 shrink-0 rounded-full bg-tat-charcoal/6 flex items-center justify-center">
                        <X className="h-4 w-4 text-tat-charcoal" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="space-y-0.5">
                      {/* Top-level nav: dropdown groups become tap-to-expand
                          accordions; flat links open directly. */}
                      {TOP_LINKS.map((l) => (
                        <MobileDrawerLink
                          key={l.href}
                          link={l}
                          isActive={isActive}
                          onNavigate={() => setDrawerOpen(false)}
                        />
                      ))}

                      {/* Secondary "more" links flat under the groups. */}
                      {moreItems
                        .filter((m) => m.href)
                        .map((m) => ({ href: m.href!, label: m.label.replace(/\s\(\d+\)$/, "") }))
                        .map((l) => (
                          <Link
                            key={l.href}
                            href={l.href}
                            aria-current={isActive(l.href) ? "page" : undefined}
                            onClick={() => setDrawerOpen(false)}
                            className={clsx(
                              "flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-colors",
                              isActive(l.href) ? "bg-tat-orange/10 text-tat-orange" : "text-tat-charcoal/80 hover:bg-tat-charcoal/5 hover:text-tat-charcoal"
                            )}
                          >
                            {l.label}
                            <ChevronRight className="h-4 w-4 opacity-40" />
                          </Link>
                      ))}

                      {!user ? (
                        <Link
                          href="/login"
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-base font-medium text-tat-charcoal/80 hover:bg-tat-charcoal/5"
                        >
                          <User className="h-4 w-4" /> Sign In / Register
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard"
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-base font-medium text-tat-charcoal/80 hover:bg-tat-charcoal/5"
                        >
                          <User className="h-4 w-4" /> My Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => { setDrawerOpen(false); openPlanner(); }}
                        className="w-full btn-primary justify-center py-3.5"
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
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-whatsapp/10 text-whatsapp-deep font-semibold text-sm border border-whatsapp/20"
                      >
                        <MessageCircle className="h-4 w-4 fill-whatsapp text-whatsapp" />
                        Chat on WhatsApp
                      </a>
                    </div>
                  </nav>

                  <div className="border-t border-tat-charcoal/8 px-6 py-5 bg-tat-charcoal/[0.02] space-y-3">
                    <a
                      href="tel:+918115999588"
                      onClick={() => captureIntent("call_click", { note: "Header drawer call" })}
                      className="flex items-center gap-3 group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-tat-orange/10 flex items-center justify-center shrink-0">
                        <Phone className="h-3.5 w-3.5 text-tat-orange" />
                      </div>
                      <div>
                        <p className="text-[10px] text-tat-charcoal/55 uppercase tracking-wider">Call</p>
                        <p className="text-sm font-medium text-tat-charcoal group-hover:text-tat-orange transition-colors">+91 811 5999 588</p>
                      </div>
                    </a>
                    <a href="mailto:hello@trustandtrip.com" className="flex items-center gap-3 group">
                      <div className="h-8 w-8 rounded-lg bg-tat-orange/10 flex items-center justify-center shrink-0">
                        <Mail className="h-3.5 w-3.5 text-tat-orange" />
                      </div>
                      <div>
                        <p className="text-[10px] text-tat-charcoal/55 uppercase tracking-wider">Email</p>
                        <p className="text-sm font-medium text-tat-charcoal group-hover:text-tat-orange transition-colors">hello@trustandtrip.com</p>
                      </div>
                    </a>
                    <div className="flex items-center justify-between pt-1">
                      <a
                        href="https://instagram.com/trust_and_trip"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-tat-charcoal/65 hover:text-tat-orange transition-colors"
                      >
                        <Instagram className="h-3.5 w-3.5" />
                        @trust_and_trip
                      </a>
                      <GoogleReviewsBadge variant="light" />
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>

      </header>
    </>
  );
}

// ─── Mobile drawer accordion item ────────────────────────────────────────
//
// Renders a single TOP_LINKS entry inside the mobile drawer. If the link
// has a nested dropdown (Destinations, Experiences, Offers) the row is a
// tap-to-expand accordion with a rotating chevron marker. If the link has
// no dropdown (Plan) it's a plain Link that closes the drawer on click.

function MobileDrawerLink({
  link, isActive, onNavigate,
}: {
  link: TopLink;
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!link.dropdown) {
    return (
      <Link
        href={link.href}
        aria-current={isActive(link.href) ? "page" : undefined}
        onClick={onNavigate}
        className={clsx(
          "flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-colors",
          isActive(link.href)
            ? "bg-tat-orange/10 text-tat-orange"
            : "text-tat-charcoal/80 hover:bg-tat-charcoal/5 hover:text-tat-charcoal"
        )}
      >
        {link.label}
        <ChevronRight className="h-4 w-4 opacity-40" />
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-colors",
          isActive(link.href)
            ? "bg-tat-orange/10 text-tat-orange"
            : "text-tat-charcoal/80 hover:bg-tat-charcoal/5 hover:text-tat-charcoal"
        )}
      >
        <span className="inline-flex items-center gap-2">
          {link.label}
          <span className="text-[10px] uppercase tracking-wider text-tat-charcoal/40">
            {link.dropdown.groups.reduce((n, g) => n + g.items.length, 0)}
          </span>
        </span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 opacity-60 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="mt-1 pl-4 pr-2 pb-2 space-y-3">
          {link.dropdown.groups.map((g) => (
            <div key={g.title}>
              <p className="px-2 mb-1 text-[10px] uppercase tracking-[0.2em] text-tat-charcoal/45 font-semibold">
                {g.title}
              </p>
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-tat-charcoal/75 hover:bg-tat-cream-warm/50 hover:text-tat-charcoal transition-colors"
                    >
                      {it.emoji && <span aria-hidden>{it.emoji}</span>}
                      <span>{it.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {link.dropdown.cta && (
            <Link
              href={link.dropdown.cta.href}
              onClick={onNavigate}
              className="block px-3 pt-2 mt-1 border-t border-tat-charcoal/8 text-xs font-semibold text-tat-teal hover:text-tat-teal-deep"
            >
              {link.dropdown.cta.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
