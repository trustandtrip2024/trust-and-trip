"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitCompareArrows, Star, Clock, MapPin, Check, ArrowRight, MessageCircle } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";

const WA = "918115999588";

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useWishlistStore();
  const [open, setOpen] = useState(false);

  if (compareList.length === 0) return null;

  return (
    <>
      {/* Sticky bar */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-16 md:bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div className="bg-ink text-cream rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 pointer-events-auto max-w-xl w-full">
          {/* Thumbnails */}
          <div className="flex gap-2 flex-1 min-w-0">
            {compareList.map((p) => (
              <div key={p.slug} className="relative group shrink-0">
                <div className="relative h-10 w-14 rounded-lg overflow-hidden">
                  <Image src={p.image} alt={p.title} fill className="object-cover" sizes="56px" />
                </div>
                <button
                  onClick={() => removeFromCompare(p.slug)}
                  className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
            {Array.from({ length: 3 - compareList.length }).map((_, i) => (
              <div key={i} className="h-10 w-14 rounded-lg border border-cream/20 border-dashed" />
            ))}
          </div>

          <span className="text-xs text-cream/60 shrink-0">
            {compareList.length}/3
          </span>

          <button
            onClick={() => setOpen(true)}
            className="shrink-0 flex items-center gap-1.5 bg-gold text-ink px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors"
          >
            <GitCompareArrows className="h-4 w-4" />
            Compare
          </button>

          <button onClick={clearCompare} className="shrink-0 text-cream/40 hover:text-cream transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Compare Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-ink/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-screen flex items-start justify-center p-4 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-cream rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-ink/8">
                  <div>
                    <h2 className="font-display text-2xl font-medium">Compare Packages</h2>
                    <p className="text-sm text-ink/50 mt-0.5">Side-by-side breakdown</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="h-9 w-9 rounded-full bg-ink/8 hover:bg-ink/15 flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Comparison table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* Package images + names */}
                    <thead>
                      <tr>
                        <th className="w-36 px-6 py-5 text-left text-[11px] uppercase tracking-[0.2em] text-ink/40 font-medium align-top">
                          Package
                        </th>
                        {compareList.map((p) => (
                          <th key={p.slug} className="px-4 py-5 align-top text-left min-w-[200px]">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                              <Image src={p.image} alt={p.title} fill className="object-cover" sizes="200px" />
                            </div>
                            <p className="font-display text-base font-medium leading-tight text-balance">{p.title}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-ink/5">
                      <CompareRow
                        label="Price"
                        values={compareList.map((p) => (
                          <span className="font-display text-lg font-medium">
                            ₹{p.price.toLocaleString("en-IN")}
                            <span className="text-xs text-ink/50 font-sans font-normal ml-1">/person</span>
                          </span>
                        ))}
                        highlight={compareList.map((p) => p.price === Math.min(...compareList.map((x) => x.price)))}
                        highlightLabel="Best price"
                      />
                      <CompareRow
                        label="Duration"
                        icon={<Clock className="h-3.5 w-3.5" />}
                        values={compareList.map((p) => p.duration)}
                      />
                      <CompareRow
                        label="Destination"
                        icon={<MapPin className="h-3.5 w-3.5" />}
                        values={compareList.map((p) => p.destinationName ?? "—")}
                      />
                      <CompareRow
                        label="Travel Type"
                        values={compareList.map((p) => p.travelType ?? "—")}
                      />
                      <CompareRow
                        label="Rating"
                        icon={<Star className="h-3.5 w-3.5 fill-gold text-gold" />}
                        values={compareList.map((p) =>
                          p.rating ? `${p.rating} / 5 · ${p.reviews} reviews` : "—"
                        )}
                        highlight={compareList.map((p) => !!p.rating && p.rating === Math.max(...compareList.map((x) => x.rating ?? 0)))}
                        highlightLabel="Top rated"
                      />
                      <CompareRow
                        label="Highlights"
                        values={compareList.map((p) =>
                          p.highlights?.length ? (
                            <ul className="space-y-1">
                              {p.highlights.slice(0, 4).map((h, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-ink/70">
                                  <Check className="h-3 w-3 text-gold shrink-0 mt-0.5" />
                                  {h}
                                </li>
                              ))}
                            </ul>
                          ) : "—"
                        )}
                      />

                      {/* CTAs */}
                      <tr>
                        <td className="px-6 py-5 text-[11px] uppercase tracking-[0.2em] text-ink/40 font-medium align-top" />
                        {compareList.map((p) => (
                          <td key={p.slug} className="px-4 py-5 align-top">
                            <div className="space-y-2">
                              <Link
                                href={`/packages/${p.slug}`}
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-center gap-1.5 w-full bg-ink text-cream py-2.5 rounded-xl text-sm font-medium hover:bg-gold hover:text-ink transition-colors"
                              >
                                View Details
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                              <a
                                href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hi Trust and Trip! 🙏\n\nI'd like to book the *${p.title}* package (₹${p.price.toLocaleString("en-IN")}/person · ${p.duration}).`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 w-full bg-[#25D366] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#20ba5a] transition-colors"
                              >
                                <MessageCircle className="h-3.5 w-3.5 fill-white" />
                                Book Now
                              </a>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CompareRow({
  label,
  icon,
  values,
  highlight,
  highlightLabel,
}: {
  label: string;
  icon?: React.ReactNode;
  values: (React.ReactNode | string)[];
  highlight?: boolean[];
  highlightLabel?: string;
}) {
  return (
    <tr>
      <td className="px-6 py-4 align-top">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-ink/40 font-medium">
          {icon}
          {label}
        </div>
      </td>
      {values.map((v, i) => (
        <td key={i} className={`px-4 py-4 align-top text-sm ${highlight?.[i] ? "bg-gold/8" : ""}`}>
          {highlight?.[i] && (
            <span className="inline-block text-[10px] bg-gold text-ink px-2 py-0.5 rounded-full font-medium mb-1.5">
              {highlightLabel}
            </span>
          )}
          <div className="text-ink/80">{v}</div>
        </td>
      ))}
    </tr>
  );
}
