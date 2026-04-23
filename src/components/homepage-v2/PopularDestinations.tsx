"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plane, Mountain } from "lucide-react";
import DestinationTile from "../DestinationTile";
import type { Destination } from "@/lib/data";

interface Props {
  india: Destination[];
  international: Destination[];
}

export default function PopularDestinations({ india, international }: Props) {
  const [tab, setTab] = useState<"india" | "world">("india");
  const list = tab === "india" ? india : international;

  if (!india.length && !international.length) return null;

  return (
    <section className="py-20 md:py-28" aria-labelledby="popular-heading">
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 mb-8 md:mb-12 flex-wrap">
          <div>
            <p className="eyebrow">Popular right now</p>
            <h2 id="popular-heading" className="heading-section mt-2 max-w-lg text-balance">
              Destinations our travellers
              <span className="italic text-gold font-light"> keep coming back to.</span>
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-ink/5 rounded-full shrink-0">
            <button
              onClick={() => setTab("india")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                tab === "india"
                  ? "bg-white text-ink shadow-soft"
                  : "text-ink/55 hover:text-ink"
              }`}
            >
              <Mountain className="h-3.5 w-3.5" />
              India
            </button>
            <button
              onClick={() => setTab("world")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                tab === "world"
                  ? "bg-white text-ink shadow-soft"
                  : "text-ink/55 hover:text-ink"
              }`}
            >
              <Plane className="h-3.5 w-3.5" />
              International
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {list.slice(0, 6).map((d, i) => (
            <DestinationTile key={`${tab}-${d.slug}`} destination={d} index={i} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-gold transition-colors group"
          >
            Browse all 60+ destinations
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
