"use client";

import { useEffect } from "react";
import { pixel } from "@/components/MetaPixel";

interface Props {
  title: string;
  price: number;
  /** Package slug — sent to CAPI as content_id for Meta catalog matching. */
  slug?: string;
  /** Travel type or category for content_category. */
  category?: string;
}

export default function PackagePixelEvent({ title, price, slug, category }: Props) {
  useEffect(() => {
    // Single event_id — used for both browser Pixel and the server CAPI
    // mirror so Meta dedups them.
    const eventId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `vc_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    pixel.viewContent(title, price, eventId);

    // CAPI mirror — fire-and-forget.
    fetch("/api/capi/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "ViewContent",
        eventId,
        contentName: title,
        contentIds: slug ? [slug] : undefined,
        contentCategory: category,
        contentType: "product",
        value: price,
        pageUrl: window.location.href,
      }),
      keepalive: true,
    }).catch(() => void 0);
  }, [title, price, slug, category]);

  return null;
}
