"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface Props {
  slug: string;
  fallbackWeek?: number;
}

// Polls /api/package-views every 30s. Renders nothing until first response —
// avoids "0 viewing now" flicker for cold packages.
export default function LiveViewerCount({ slug, fallbackWeek = 0 }: Props) {
  const [data, setData] = useState<{ live: number; week: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchCounts = async () => {
      try {
        const r = await fetch(`/api/package-views?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const j = await r.json();
        if (cancelled) return;
        setData({ live: j.live ?? 0, week: j.week ?? 0 });
      } catch {}
    };
    fetchCounts();
    const id = setInterval(fetchCounts, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [slug]);

  const live = data?.live ?? 0;
  const week = data?.week ?? fallbackWeek;

  return (
    <p className="mt-4 text-[11px] text-tat-slate flex items-center gap-2 flex-wrap">
      <Eye className="w-3.5 h-3.5 text-tat-orange" />
      {live > 0 ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>
            <span className="font-semibold text-tat-charcoal">{live}</span> viewing now
          </span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-tat-charcoal/55">
          <span className="h-1.5 w-1.5 rounded-full bg-tat-charcoal/30" />
          <span>Recently viewed</span>
        </span>
      )}
      <span className="text-tat-charcoal/30" aria-hidden>·</span>
      <span>
        <span className="font-semibold text-tat-charcoal">{week}</span> this week
      </span>
    </p>
  );
}
