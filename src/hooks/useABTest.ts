"use client";

import { useEffect, useState } from "react";
import { bucketFor, trackExposure, type Experiment } from "@/lib/ab-test";

// Assigns the visitor to a variant on first render and tracks exposure once.
// Returns null until the cookie has been resolved on the client (prevents
// SSR/CSR text mismatch). Components should render a sensible fallback for
// the null phase or use the first variant as their initial value if the
// flicker is acceptable.

export function useABTest<V extends string>(exp: Experiment<V>): V | null {
  const [variant, setVariant] = useState<V | null>(null);

  useEffect(() => {
    const v = bucketFor(exp);
    setVariant(v);
    trackExposure(exp.key, v);
    // exp identity is stable per page lifetime — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return variant;
}
