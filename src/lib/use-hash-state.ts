"use client";

import { useCallback, useEffect, useState } from "react";

// Read current location.hash as URLSearchParams. Strips leading `#`.
function readHash(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  const raw = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(raw);
}

// Replace history entry instead of pushing — chip clicks shouldn't bloat
// the back stack. Deep-link + hashchange listener still work either way.
function writeHash(params: URLSearchParams) {
  if (typeof window === "undefined") return;
  const next = params.toString();
  const url = `${window.location.pathname}${window.location.search}${next ? `#${next}` : ""}`;
  window.history.replaceState(null, "", url);
}

/**
 * Two-way binding between a string state value and a single hash param.
 * Defaults are stripped from the hash on write so URLs stay clean.
 * Listens to `hashchange` so other shelves writing different keys don't
 * fight each other and back/forward across hashes still updates state.
 */
export function useHashState<T extends string>(
  key: string,
  initial: T
): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const params = readHash();
    const fromHash = params.get(key);
    if (fromHash) setValue(fromHash as T);

    const onChange = () => {
      const p = readHash();
      const v = p.get(key);
      setValue((v ?? initial) as T);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, [key, initial]);

  const update = useCallback(
    (v: T) => {
      setValue(v);
      const params = readHash();
      if (v === initial) params.delete(key);
      else params.set(key, v);
      writeHash(params);
    },
    [key, initial]
  );

  return [value, update];
}
