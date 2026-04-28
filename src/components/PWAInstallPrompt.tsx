"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";

// PWA install prompt — fires only:
// • after the 3rd page-view in this browser (avoids first-time-visitor noise)
// • after 30s on the current page (intent signal — not a bouncer)
// • not in standalone mode (already installed)
// • not dismissed in the last 14 days
//
// `beforeinstallprompt` fires on Chrome / Edge / Samsung Internet — Safari
// uses its own "Add to Home Screen" UX which we can't intercept. iOS users
// see no banner, which is fine.

const VISIT_KEY = "tt_pwa_visits";
const DISMISS_KEY = "tt_pwa_dismissed_at";
const SHOW_AFTER_VISITS = 3;
const SHOW_AFTER_MS_ON_PAGE = 30_000;
const DISMISS_COOLDOWN_MS = 14 * 24 * 3600 * 1000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

// Don't pop up on conversion-critical surfaces.
const HIDDEN_ON = ["/lp/", "/invoice/", "/cart/resume", "/login", "/register"];

export default function PWAInstallPrompt() {
  const pathname = usePathname();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname && HIDDEN_ON.some((p) => pathname.startsWith(p))) return;

    // Bump visit counter once per page load.
    const visits = Number(window.localStorage.getItem(VISIT_KEY) ?? "0") + 1;
    window.localStorage.setItem(VISIT_KEY, String(visits));

    // Already installed?
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    // Recently dismissed?
    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? "0");
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);

      if (visits >= SHOW_AFTER_VISITS) {
        const t = setTimeout(() => setVisible(true), SHOW_AFTER_MS_ON_PAGE);
        return () => clearTimeout(t);
      }
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [pathname]);

  async function install() {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    setVisible(false);
    setEvent(null);
    if (choice.outcome === "accepted") {
      // Optional: ping CAPI Contact event so retargeting audiences can include installers.
      fetch("/api/capi/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "Contact",
          eventId:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `pwa_${Date.now()}`,
          contentName: "pwa_install",
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
        keepalive: true,
      }).catch(() => void 0);
    } else {
      stamp();
    }
  }

  function dismiss() {
    setVisible(false);
    stamp();
  }

  function stamp() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Trust and Trip"
      className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:w-[360px] z-40 animate-in slide-in-from-bottom-3 duration-300"
    >
      <div className="bg-white border border-tat-charcoal/10 rounded-card shadow-rail p-4 md:p-5 flex items-start gap-3">
        <div className="shrink-0 h-10 w-10 rounded-pill bg-tat-gold/15 text-tat-gold grid place-items-center">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-sm font-semibold text-tat-charcoal">
            Install Trust and Trip
          </p>
          <p className="text-meta text-tat-slate mt-0.5">
            Save itineraries offline, get planner replies as push notifications,
            and open faster than Safari.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={install}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-pill bg-tat-charcoal text-tat-paper text-[13px] font-medium hover:bg-tat-charcoal/90"
            >
              Install
            </button>
            <button
              onClick={dismiss}
              className="inline-flex items-center justify-center h-9 px-3 rounded-pill text-tat-slate text-[13px] hover:text-tat-charcoal hover:bg-tat-charcoal/5"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 h-7 w-7 rounded-full text-tat-slate/60 hover:text-tat-charcoal hover:bg-tat-charcoal/5 flex items-center justify-center"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
