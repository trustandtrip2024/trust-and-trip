"use client";

import { useEffect } from "react";

interface Props {
  slug: string;
  title: string;
  destinationName: string;
  price: number;
  duration: string;
  travelType: string;
  bestFor?: string;
}

const KEY = "tt_aria_package_preload";

/**
 * Mirror of the quiz->Aria handoff. Writes the active package's context
 * to sessionStorage so AriaChatWidget can greet the user with package-
 * aware copy and forward the same context to /api/chat as quizContext-
 * shaped data on every message. Returns null — pure side-effect mount.
 *
 * Cleared from sessionStorage when the user navigates back to a non-
 * package page (best-effort via beforeunload listener; sessionStorage
 * still persists across same-tab nav by design, so we re-write on every
 * package-detail mount to keep the latest one current).
 */
export default function PackageAriaPreload(props: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(
        KEY,
        JSON.stringify({
          slug: props.slug,
          title: props.title,
          destinationName: props.destinationName,
          price: props.price,
          duration: props.duration,
          travelType: props.travelType,
          bestFor: props.bestFor,
        }),
      );
    } catch {
      // sessionStorage may be blocked in private mode — silent fallback.
    }
  }, [props.slug, props.title, props.destinationName, props.price, props.duration, props.travelType, props.bestFor]);

  return null;
}
