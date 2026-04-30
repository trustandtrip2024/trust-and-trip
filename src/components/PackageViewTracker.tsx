"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";

function getSessionId(): string {
  const KEY = "tt_session_id";
  try {
    let sid = sessionStorage.getItem(KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

interface Props {
  slug: string;
}

// Fire-and-forget view tracker. Records once per (slug, session) per minute,
// and always pushes the slug onto the persisted recently-viewed list so the
// homepage can resurface it.
export default function PackageViewTracker({ slug }: Props) {
  const pushRecent = useWishlistStore((s) => s.pushRecent);

  useEffect(() => {
    if (!slug) return;
    pushRecent(slug);

    const sessionId = getSessionId();
    const dedupeKey = `tt_view:${slug}`;
    const last = sessionStorage.getItem(dedupeKey);
    const now = Date.now();
    if (last && now - parseInt(last, 10) < 60_000) return;
    sessionStorage.setItem(dedupeKey, String(now));
    fetch("/api/package-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, sessionId }),
      keepalive: true,
    }).catch(() => {});
  }, [slug, pushRecent]);

  return null;
}
