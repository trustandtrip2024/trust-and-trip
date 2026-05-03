"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const SearchModal = dynamic(() => import("./SearchModal"), { ssr: false });

export default function SearchProvider() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    // Click affordances anywhere in the app dispatch this custom event so the
    // Sanity-backed modal is the single search surface (mirrors tt:aria-open).
    const openEvt = () => setOpen(true);
    window.addEventListener("keydown", handler);
    window.addEventListener("tt:search-open", openEvt);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("tt:search-open", openEvt);
    };
  }, []);

  return open ? <SearchModal onClose={() => setOpen(false)} /> : null;
}
