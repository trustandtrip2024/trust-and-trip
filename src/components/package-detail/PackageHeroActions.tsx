"use client";

import { useState } from "react";
import { Heart, Share2, Copy, Check, MessageCircle, Twitter } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";

interface Props {
  slug: string;
  title: string;
  price: number;
  destination: string;
}

/**
 * Floating hero action cluster for the package detail page.
 *
 * Two buttons — wishlist heart (toggles a persisted slug list in zustand)
 * and share (opens an inline menu with WhatsApp / Twitter / copy-link).
 * Mounted in the top-right of the hero gradient.
 */
export default function PackageHeroActions({ slug, title, price, destination }: Props) {
  const wishlisted = useWishlistStore((s) => s.isWishlisted(slug));
  const toggle = useWishlistStore((s) => s.toggleWishlist);

  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = `https://trustandtrip.com/packages/${slug}`;
  const text = `✈️ ${title}\nFrom ₹${price.toLocaleString("en-IN")}/person · Trust and Trip\n${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — silently ignore
    }
  };

  const tryNativeShare = async () => {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav && "share" in nav) {
      try {
        await (nav as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title,
          text: `Check out ${title} on Trust and Trip`,
          url,
        });
        return;
      } catch {
        // user cancelled — fall through to menu
      }
    }
    setShareOpen((v) => !v);
  };

  return (
    <div className="absolute top-20 md:top-24 right-4 md:right-8 z-20 flex items-center gap-2">
      <button
        type="button"
        onClick={() => toggle(slug)}
        aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={wishlisted}
        className={`grid place-items-center h-10 w-10 rounded-full backdrop-blur-md transition-all ring-1 ${
          wishlisted
            ? "bg-rose-500/90 text-white ring-white/30 hover:bg-rose-500"
            : "bg-tat-charcoal/35 text-tat-paper ring-white/15 hover:bg-tat-charcoal/55"
        }`}
      >
        <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} aria-hidden />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={tryNativeShare}
          aria-label="Share this package"
          aria-expanded={shareOpen}
          className="grid place-items-center h-10 w-10 rounded-full bg-tat-charcoal/35 text-tat-paper ring-1 ring-white/15 backdrop-blur-md hover:bg-tat-charcoal/55 transition-all"
        >
          <Share2 className="h-4 w-4" aria-hidden />
        </button>

        {shareOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShareOpen(false)}
              aria-hidden
            />
            <div className="absolute top-full mt-2 right-0 z-50 bg-white dark:bg-tat-charcoal rounded-2xl shadow-soft-lg ring-1 ring-tat-charcoal/8 dark:ring-white/10 p-3 min-w-[210px]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-tat-charcoal/40 dark:text-tat-paper/45 font-medium mb-2 px-1">
                Share
              </p>
              <div className="space-y-1.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium bg-[#25D366] text-white hover:bg-[#20ba5a] transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `${title} — from ₹${price.toLocaleString("en-IN")}/person via @trust_and_trip`
                  )}&url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  <Twitter className="h-3.5 w-3.5" />
                  Twitter / X
                </a>
                <button
                  type="button"
                  onClick={copy}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium bg-tat-charcoal/5 dark:bg-white/10 text-tat-charcoal/75 dark:text-tat-paper/85 hover:bg-tat-charcoal/10 dark:hover:bg-white/15 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy link · {destination}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
