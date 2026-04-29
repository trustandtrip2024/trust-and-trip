import Link from "next/link";
import { Calendar, Clock, MessageCircle } from "lucide-react";

interface Departure {
  date: string;
  batchLabel?: string;
  slotsLeft?: number;
  priceOverride?: number;
}

interface Props {
  departures: Departure[];
  packageTitle: string;
  packageSlug: string;
  basePrice: number;
  waNumber: string;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return { day: d.getDate(), month: MONTHS[d.getMonth()], year: d.getFullYear() };
}

function fmtINR(n: number) {
  return n.toLocaleString("en-IN");
}

export default function DeparturesGrid({ departures, packageTitle, packageSlug, basePrice, waNumber }: Props) {
  if (!departures || departures.length === 0) return null;

  // Future-only, sorted by date asc.
  const upcoming = departures
    .filter((d) => {
      const ts = new Date(d.date).getTime();
      return !Number.isNaN(ts) && ts >= Date.now() - 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (upcoming.length === 0) return null;

  return (
    <section id="departures" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <span className="eyebrow">Fixed departures</span>
      <h2 className="heading-section mt-2 mb-2 text-balance">
        Pick your
        <span className="italic text-tat-gold font-light"> batch.</span>
      </h2>
      <p className="text-tat-charcoal/65 mb-6 max-w-xl text-sm leading-relaxed">
        Pre-confirmed batches with flights, transfers, and hotel blocks ready
        to go. Slot counts update daily.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {upcoming.map((d, i) => {
          const date = fmtDate(d.date);
          const isObj = typeof date === "object";
          const price = d.priceOverride ?? basePrice;
          const low = typeof d.slotsLeft === "number" && d.slotsLeft > 0 && d.slotsLeft <= 4;
          const sold = typeof d.slotsLeft === "number" && d.slotsLeft <= 0;
          const waMsg = `Hi! I'd like to book the ${packageTitle} package for the ${isObj ? `${date.day} ${date.month} ${date.year}` : d.date} batch. Please confirm availability.`;

          return (
            <li
              key={`${d.date}-${i}`}
              className={`relative rounded-2xl border bg-white p-4 transition-shadow ${sold ? "border-tat-charcoal/10 opacity-60" : "border-tat-charcoal/12 hover:shadow-card"}`}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 grid place-items-center w-14 h-14 rounded-xl bg-tat-gold/10 ring-1 ring-tat-gold/30 text-tat-gold">
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-[0.18em] font-semibold leading-none">
                      {isObj ? date.month : ""}
                    </div>
                    <div className="text-[20px] font-bold leading-tight mt-0.5 text-tat-charcoal">
                      {isObj ? date.day : "—"}
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  {d.batchLabel && (
                    <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-tat-charcoal/60 mb-0.5">
                      {d.batchLabel}
                    </p>
                  )}
                  <p className="font-display text-h4 font-medium text-tat-charcoal leading-tight">
                    {isObj ? `${date.day} ${date.month} ${date.year}` : d.date}
                  </p>
                  <p className="mt-1.5 font-display text-h3 text-tat-charcoal">
                    ₹{fmtINR(price)}
                    <span className="text-body-sm text-tat-charcoal/55 font-normal"> / person</span>
                  </p>

                  {sold ? (
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-tat-charcoal/55">
                      <Clock className="h-3 w-3" /> Sold out
                    </span>
                  ) : low ? (
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-tat-orange">
                      <Clock className="h-3 w-3" /> Only {d.slotsLeft} slot{d.slotsLeft === 1 ? "" : "s"} left
                    </span>
                  ) : typeof d.slotsLeft === "number" ? (
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-tat-charcoal/55">
                      {d.slotsLeft} slots open
                    </span>
                  ) : null}
                </div>
              </div>

              {!sold && (
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/customize-trip?package=${packageSlug}&date=${encodeURIComponent(d.date)}`}
                    className="flex-1 inline-flex items-center justify-center h-9 px-3 rounded-pill bg-tat-charcoal text-tat-paper text-[12px] font-semibold hover:bg-tat-charcoal/90 transition"
                  >
                    Reserve
                  </Link>
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-pill bg-whatsapp text-white hover:bg-whatsapp-hover transition"
                    aria-label="Chat on WhatsApp about this batch"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-tat-charcoal/55">
        <Calendar className="h-3.5 w-3.5" />
        Custom dates available — message a planner to plan your own departure.
      </p>
    </section>
  );
}
