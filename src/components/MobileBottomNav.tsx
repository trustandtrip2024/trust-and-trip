"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, MessageCircle, Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { analytics } from "@/lib/analytics";
import { captureIntent } from "@/lib/capture-intent";

import { useWishlistStore } from "@/store/useWishlistStore";
import AriaFace from "@/components/AriaFace";

const TIPS = [
  "Hi! I'm Aria — tap to chat ✨",
  "Need a quick honeymoon idea?",
  "Got 5 days off? I've got a list.",
  "Free itinerary in 24 h. Try me.",
];

const WHATSAPP = "https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I'd%20love%20help%20planning%20my%20next%20trip.";

const leftTabs = [
  { href: "/",             icon: Home,   label: "Home" },
  { href: "/destinations", icon: MapPin, label: "Explore" },
];

const rightTabs = [
  { href: "/wishlist", icon: Heart, label: "Saved" },
];

function Tab({ href, icon: Icon, label, active, badge }: {
  href: string; icon: React.ElementType; label: string; active: boolean; badge?: number;
}) {
  return (
    <Link href={href}
      className={clsx("flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-200 min-h-[56px] justify-center relative",
        active
          ? "text-tat-teal dark:text-tat-teal-mist"
          : "text-tat-charcoal/55 hover:text-tat-charcoal/80 dark:text-tat-paper/65 dark:hover:text-tat-paper")}>
      <div className={clsx("flex items-center justify-center rounded-xl w-10 h-7 transition-all duration-200 relative",
        active && "bg-tat-teal/12 dark:bg-tat-teal-mist/15")}>
        <Icon className={clsx("h-[18px] w-[18px] transition-transform duration-200", active && "scale-110")} />
        {!!badge && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-tat-orange text-white text-[9px] font-semibold flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className={clsx("text-[10px] uppercase tracking-[0.12em] font-medium leading-none",
        active
          ? "text-tat-teal dark:text-tat-teal-mist"
          : "text-tat-charcoal/55 dark:text-tat-paper/65")}>
        {label}
      </span>
    </Link>
  );
}

// Hide on dashboard/admin/auth views, paid-traffic landing pages, and any
// route where a single high-conversion CTA already owns the bottom of the
// screen. Package detail pages have their own pricing+book sticky bar so
// the generic nav must stand down to avoid stacking two bars.
const HIDDEN_ON = [
  "/dashboard",
  "/login",
  "/creators/dashboard",
  "/admin",
  "/lp/",
  "/invoice/",
  "/cart/resume",
  "/packages/", // detail pages only — bare /packages stays
];

export default function MobileBottomNav() {
  const path = usePathname();
  const wishlistCount = useWishlistStore((s) => s.wishlist.length);
  const isActive = (href: string) => path === href || (href !== "/" && path.startsWith(href));

  const [tipIndex, setTipIndex] = useState(0);
  const [tipShow, setTipShow] = useState(false);
  const [ariaOpened, setAriaOpened] = useState(false);

  // Cycle through Aria tips: appears 3.5 s after load, hides after 6 s,
  // re-appears every 25 s with the next tip until user opens Aria once.
  useEffect(() => {
    if (ariaOpened) return;
    const show = () => {
      setTipShow(true);
      setTimeout(() => setTipShow(false), 6000);
    };
    const t1 = setTimeout(show, 3500);
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
      show();
    }, 25000);
    return () => { clearTimeout(t1); clearInterval(interval); };
  }, [ariaOpened]);

  // Opening the chat is NOT an enquiry — it's just a UI affordance. The
  // real lead is created by AriaChatWidget when the user fills the
  // name + phone form. Firing captureIntent here pollutes Bitrix with
  // empty "Website Visitor" rows (one per FAB tap) and breaks dedup.
  const openAria = () => {
    setAriaOpened(true);
    setTipShow(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("tt:aria-open"));
    }
  };

  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="bg-white/95 dark:bg-tat-charcoal/95 backdrop-blur-md border-t border-tat-charcoal/8 dark:border-white/10 shadow-[0_-4px_24px_rgba(42,42,42,0.10)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.45)]">
        <div className="flex items-end justify-around h-16 px-1 max-w-lg mx-auto">
          {leftTabs.map((t) => (
            <Tab key={t.href} {...t} active={isActive(t.href)} />
          ))}

          {/* Center: Aria primary CTA */}
          <button
            type="button"
            onClick={openAria}
            aria-label="Chat with Aria, your AI travel assistant"
            className="relative flex flex-col items-center gap-1 flex-1 -mt-6 pb-0.5"
          >
            {/* Tooltip bubble */}
            <AnimatePresence>
              {tipShow && (
                <motion.span
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-tat-charcoal text-white text-[11px] font-medium whitespace-nowrap shadow-lg"
                >
                  <Sparkles className="h-3 w-3 text-tat-gold" aria-hidden />
                  {TIPS[tipIndex]}
                  <span
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-tat-charcoal rotate-45"
                  />
                </motion.span>
              )}
            </AnimatePresence>

            <motion.div
              animate={
                ariaOpened
                  ? { y: 0, rotate: 0 }
                  : { y: [0, -3, 0, -2, 0], rotate: [0, -2, 0, 2, 0] }
              }
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-16 w-16 rounded-full bg-tat-cream-warm shadow-[0_6px_24px_rgba(200,147,42,0.45)] ring-4 ring-white dark:ring-tat-charcoal overflow-hidden"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Pulsing gold halo */}
              {!ariaOpened && (
                <span
                  aria-hidden
                  className="absolute inset-[-6px] rounded-full bg-tat-gold/30 animate-ping"
                  style={{ animationDuration: "2.4s" }}
                />
              )}
              <span className="relative block h-full w-full">
                <AriaFace size={64} className="h-full w-full" />
              </span>
              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-tat-success-fg ring-2 ring-white" />
            </motion.div>
            <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-tat-charcoal dark:text-tat-paper leading-none mt-0.5">
              Aria
            </span>
          </button>

          {/* WhatsApp */}
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            onClick={() => {
              analytics.whatsappClick("mobile_bottom_nav");
              captureIntent("whatsapp_click", { note: "Mobile bottom nav — WhatsApp" });
            }}
            className="flex flex-col items-center gap-1 flex-1 py-2 min-h-[56px] justify-center text-tat-charcoal/55 hover:text-tat-charcoal/80 dark:text-tat-paper/65 dark:hover:text-tat-paper"
          >
            <div className="flex items-center justify-center rounded-xl w-10 h-7 bg-whatsapp/10 dark:bg-whatsapp/20">
              <MessageCircle className="h-[18px] w-[18px] text-whatsapp" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.12em] font-medium leading-none">
              Chat
            </span>
          </a>

          {rightTabs.map((t) => (
            <Tab key={t.href} {...t} active={isActive(t.href)}
              badge={t.href === "/wishlist" ? wishlistCount : undefined} />
          ))}
        </div>
      </div>
    </nav>
  );
}
