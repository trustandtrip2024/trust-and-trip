"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface Props {
  initialQuery?: string;
}

const RECENT_KEY = "tt_recent_searches";
const RECENT_CAP = 5;

function loadRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, RECENT_CAP) : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  if (typeof window === "undefined" || !q.trim()) return;
  try {
    const cur = loadRecents().filter((x) => x.toLowerCase() !== q.toLowerCase());
    const next = [q, ...cur].slice(0, RECENT_CAP);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

export default function SearchInputClient({ initialQuery = "" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [submitting, setSubmitting] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecents(loadRecents());
    if (initialQuery) pushRecent(initialQuery);
  }, [initialQuery]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    pushRecent(q);
    setSubmitting(true);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function pickRecent(q: string) {
    setValue(q);
    setSubmitting(true);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function clearRecents() {
    try { window.localStorage.removeItem(RECENT_KEY); } catch {}
    setRecents([]);
  }

  return (
    <div className="mt-5">
      <form onSubmit={submit}>
        <div className="flex items-center gap-3 h-12 md:h-14 px-4 md:px-5 rounded-pill bg-white border border-tat-charcoal/15 focus-within:border-tat-gold focus-within:ring-2 focus-within:ring-tat-gold/30 transition shadow-soft">
          {submitting ? (
            <Loader2 className="h-4 w-4 text-tat-charcoal/40 shrink-0 animate-spin" />
          ) : (
            <Search className="h-4 w-4 md:h-5 md:w-5 text-tat-charcoal/45 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search a country, region, package or article…"
            className="flex-1 text-[15px] md:text-[16px] text-tat-charcoal placeholder:text-tat-charcoal/40 outline-none bg-transparent"
            aria-label="Search"
          />
          {value && (
            <button
              type="button"
              onClick={() => { setValue(""); inputRef.current?.focus(); }}
              className="text-tat-charcoal/35 hover:text-tat-charcoal"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={!value.trim()}
            className="hidden md:inline-flex h-9 px-4 rounded-pill bg-tat-charcoal text-white text-[12px] font-semibold disabled:opacity-40 hover:bg-tat-charcoal/90"
          >
            Search
          </button>
        </div>
      </form>

      {!initialQuery && recents.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-tat-charcoal/45 font-semibold">
            Recent
          </span>
          {recents.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => pickRecent(r)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-tat-cream-warm/50 border border-tat-charcoal/10 text-[12px] text-tat-charcoal/75 hover:border-tat-gold hover:bg-tat-gold/5"
            >
              {r}
            </button>
          ))}
          <button
            type="button"
            onClick={clearRecents}
            className="inline-flex items-center gap-1 text-[11px] text-tat-charcoal/45 hover:text-tat-charcoal underline-offset-2 hover:underline"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
