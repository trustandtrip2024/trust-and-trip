"use client";

import { useState, useRef } from "react";
import { Loader2, Sparkles, MapPin, Clock as ClockIcon, MessageCircle } from "lucide-react";

// Streaming itinerary widget — calls /api/itinerary/stream and renders the
// progressive output. Shows tool-use phases ("Researching Bali packages…"),
// then live text drafting, then the parsed structured itinerary.
//
// Drop on any LP. Captures email + phone if user wants delivery, otherwise
// the draft just lives in the widget. Phone+email submission also creates a
// lead row + Bitrix Deal + CAPI Lead via /api/leads (which the parent LP
// form already does — this widget complements rather than replaces).

interface Day {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  stay: string;
  tip: string;
}

interface Itinerary {
  title: string;
  tagline: string;
  highlights: string[];
  bestTimeToVisit: string;
  estimatedCostRange: string;
  days: Day[];
  packingTips: string[];
  visaInfo: string;
}

interface MatchedPackage {
  slug: string;
  title: string;
  currentPrice: number;
  rating: number;
}

interface Props {
  /** Pre-fill destination — typically matches the LP. */
  destination: string;
  /** Default trip type for this LP. */
  travelType: "Couple" | "Family" | "Solo" | "Group" | "Pilgrim" | "Luxury" | "Adventure" | "Wellness";
  /** Default day count to seed the form. */
  defaultDays?: number;
  /** Optional headline above the widget. */
  headline?: string;
  /** Optional sub-line. */
  subline?: string;
  /** WhatsApp number for fallback CTA. */
  whatsappNumber?: string;
}

export default function StreamItineraryWidget({
  destination,
  travelType,
  defaultDays = 5,
  headline = "Watch our planner build your draft, live.",
  subline = "Real Sanity data + real prices. Not a chatbot reading the brochure.",
  whatsappNumber = "918115999588",
}: Props) {
  const [days, setDays] = useState(defaultDays);
  const [budget, setBudget] = useState<string>("");
  const [interests, setInterests] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<string>("idle");
  const [statusLine, setStatusLine] = useState<string>("");
  const [draftText, setDraftText] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [matched, setMatched] = useState<MatchedPackage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setItinerary(null);
    setMatched([]);
    setDraftText("");
    setStatusLine("");

    if (days < 2 || days > 21) {
      setError("Days must be between 2 and 21.");
      return;
    }

    setRunning(true);
    setPhase("started");
    setStatusLine("Connecting to the planner…");

    // If user supplied contact info, fire-and-forget /api/leads in parallel
    // so Supabase + Bitrix + CAPI Lead all happen even if they never fill
    // the main page form. We don't await — engine streaming starts immediately.
    //
    // Dedup against the main page form: if the same phone+destination has
    // already submitted a Lead in the last 24h via this browser, skip the
    // duplicate fire. Without this, a user who fills the page form THEN
    // experiments with the widget triggers 2 Pixel Lead events on the same
    // visitor, inflating CAPI numbers and confusing the optimizer.
    const cleanPhoneForDedup = phone.replace(/\D/g, "");
    const dedupKey = `tt_lead:${destination.toLowerCase()}:${cleanPhoneForDedup || email.trim().toLowerCase()}`;
    let alreadySubmitted = false;
    if (typeof window !== "undefined" && (cleanPhoneForDedup || email.trim())) {
      const ts = window.localStorage.getItem(dedupKey);
      if (ts && Date.now() - Number(ts) < 24 * 3600 * 1000) {
        alreadySubmitted = true;
      }
    }

    if (!alreadySubmitted && (name.trim() || phone.trim() || email.trim())) {
      const cleanPhone = phone.replace(/\D/g, "");
      // Stamp now — if /api/leads fails, we'd rather under-fire than double-fire.
      if (typeof window !== "undefined" && (cleanPhone || email.trim())) {
        window.localStorage.setItem(dedupKey, String(Date.now()));
      }
      void fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Stream widget visitor",
          phone: cleanPhone,
          email: email.trim() || "",
          destination,
          travel_type: travelType,
          message: interests
            ? `Stream widget — interests: ${interests}, days: ${days}, budget: ${budget || "—"}`
            : `Stream widget — days: ${days}, budget: ${budget || "—"}`,
          budget: budget || undefined,
          source: "itinerary_generator",
          package_title: `${destination} ${travelType} via stream widget`,
          page_url: typeof window !== "undefined" ? window.location.href : undefined,
          utm_source:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("utm_source") ?? undefined
              : undefined,
          utm_medium:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("utm_medium") ?? undefined
              : undefined,
          utm_campaign:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("utm_campaign") ?? undefined
              : undefined,
          utm_content:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("utm_content") ?? undefined
              : undefined,
          utm_term:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("utm_term") ?? undefined
              : undefined,
        }),
      })
        .then(async (r) => {
          const j = await r.json().catch(() => ({}));
          // Fire Pixel Lead deduped against the server-side CAPI fire.
          if (j.eventId && typeof window !== "undefined") {
            const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
            if (fbq) {
              fbq("track", "Lead", { value: 0, currency: "INR" }, { eventID: j.eventId });
            }
          }
        })
        .catch(() => void 0);
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/itinerary/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          destination,
          days,
          travelType,
          budgetPerPerson: budget ? Number(budget.replace(/\D/g, "")) || undefined : undefined,
          interests: interests || undefined,
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "");
        setError(`Request failed: ${res.status} ${txt.slice(0, 200)}`);
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const events = buf.split("\n\n");
        buf = events.pop() ?? "";

        for (const ev of events) {
          if (!ev.startsWith("data: ")) continue;
          let data: { phase: string; [k: string]: unknown };
          try {
            data = JSON.parse(ev.slice(6));
          } catch {
            continue;
          }
          handle(data);
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message || "Stream failed.");
      }
    } finally {
      setRunning(false);
    }
  }

  function handle(e: { phase: string; [k: string]: unknown }) {
    setPhase(e.phase);
    switch (e.phase) {
      case "started":
        setStatusLine("Looking up live package data…");
        break;
      case "tool_use": {
        const t = String(e.tool ?? "");
        if (t === "getDestinationInfo") setStatusLine(`Reading destination notes for ${destination}…`);
        else if (t === "searchPackages") setStatusLine(`Searching real ${destination} packages…`);
        else if (t === "getPackageDetails") setStatusLine("Reading the strongest match in detail…");
        else if (t === "listAllDestinations") setStatusLine("Disambiguating destination…");
        else setStatusLine(`Calling ${t}…`);
        break;
      }
      case "tool_result":
        setStatusLine((s) => s + " ✓");
        break;
      case "drafting":
        setStatusLine("Drafting day-by-day plan…");
        break;
      case "delta":
        if (typeof e.text === "string") setDraftText((d) => d + e.text);
        break;
      case "done":
        setItinerary(e.itinerary as Itinerary);
        setMatched((e.matchedPackages as MatchedPackage[]) ?? []);
        setStatusLine("Draft ready.");
        break;
      case "error":
        setError(String(e.message ?? "unknown error"));
        break;
    }
  }

  function reset() {
    abortRef.current?.abort();
    setItinerary(null);
    setMatched([]);
    setDraftText("");
    setStatusLine("");
    setPhase("idle");
    setRunning(false);
    setError(null);
  }

  return (
    <section className="py-16 md:py-20 bg-tat-paper border-y border-tat-charcoal/8">
      <div className="container-custom max-w-5xl">
        <div className="max-w-2xl">
          <p className="tt-eyebrow flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> AI itinerary, live
          </p>
          <h2 className="mt-2 font-display text-display-md text-tat-charcoal leading-tight">
            {headline}
          </h2>
          <p className="mt-3 text-tat-charcoal/75 leading-relaxed">{subline}</p>
        </div>

        <div className="mt-8 grid lg:grid-cols-5 gap-6 md:gap-8">
          {/* Inputs */}
          <form onSubmit={start} className="lg:col-span-2 bg-white rounded-card border border-tat-charcoal/10 p-5 md:p-6 shadow-card">
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-pill bg-tat-cream-warm/40 border border-tat-charcoal/15 text-tat-charcoal/80">
                <MapPin className="h-4 w-4 text-tat-gold" />
                <span className="text-sm font-medium">{destination}</span>
                <span className="text-meta text-tat-slate ml-auto">{travelType}</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-pill bg-tat-cream-warm/40 border border-tat-charcoal/15">
                <ClockIcon className="h-4 w-4 text-tat-gold" />
                <input
                  type="number"
                  min={2}
                  max={21}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="bg-transparent flex-1 outline-none text-sm"
                />
                <span className="text-meta text-tat-slate">days</span>
              </div>
              <input
                type="text"
                placeholder="Budget per person (optional, e.g. 85000)"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                inputMode="numeric"
                className="w-full h-11 px-4 rounded-pill bg-tat-cream-warm/40 border border-tat-charcoal/15 text-tat-charcoal text-sm outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
              />
              <input
                type="text"
                placeholder="Interests (optional, e.g. snorkelling, food, photos)"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full h-11 px-4 rounded-pill bg-tat-cream-warm/40 border border-tat-charcoal/15 text-tat-charcoal text-sm outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
              />

              <details className="text-meta text-tat-slate select-none">
                <summary className="cursor-pointer hover:text-tat-charcoal">
                  Get the draft on email + WhatsApp (optional)
                </summary>
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-pill bg-white border border-tat-charcoal/15 text-tat-charcoal text-sm outline-none"
                  />
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="WhatsApp number (10 digits)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-pill bg-white border border-tat-charcoal/15 text-tat-charcoal text-sm outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-pill bg-white border border-tat-charcoal/15 text-tat-charcoal text-sm outline-none"
                  />
                </div>
              </details>
            </div>

            {error && <p className="mt-3 text-meta text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={running}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 h-12 px-5 rounded-pill bg-tat-orange text-white text-sm font-semibold hover:bg-tat-orange/90 transition disabled:opacity-60"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {statusLine || "Working…"}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Build my draft
                </>
              )}
            </button>
            {(itinerary || draftText || error) && !running && (
              <button
                type="button"
                onClick={reset}
                className="mt-3 w-full text-meta text-tat-slate hover:text-tat-charcoal underline-offset-2 hover:underline"
              >
                Start over
              </button>
            )}
          </form>

          {/* Output */}
          <div className="lg:col-span-3">
            {!itinerary && !draftText && !running && (
              <div className="h-full min-h-[320px] grid place-items-center bg-white rounded-card border border-dashed border-tat-charcoal/15 p-8 text-center">
                <div>
                  <Sparkles className="h-8 w-8 mx-auto text-tat-gold/60" />
                  <p className="mt-3 text-tat-charcoal font-display text-h3">Tap "Build my draft"</p>
                  <p className="mt-1 text-meta text-tat-slate max-w-xs mx-auto">
                    Stream a real {destination} {travelType.toLowerCase()} itinerary in under a minute.
                  </p>
                </div>
              </div>
            )}

            {(running || draftText) && !itinerary && (
              <div className="bg-white rounded-card border border-tat-charcoal/10 p-5 md:p-6 shadow-card">
                {statusLine && (
                  <p className="text-meta text-tat-slate flex items-center gap-2">
                    {running && <Loader2 className="h-3 w-3 animate-spin" />}
                    {statusLine}
                  </p>
                )}
                {draftText && (
                  <pre className="mt-4 text-[12.5px] leading-relaxed text-tat-charcoal/80 whitespace-pre-wrap font-mono max-h-[420px] overflow-auto">
                    {draftText}
                  </pre>
                )}
                {phase === "drafting" && !draftText && (
                  <p className="mt-3 text-meta text-tat-slate italic">Streaming day-by-day…</p>
                )}
              </div>
            )}

            {itinerary && (
              <article className="bg-white rounded-card border border-tat-charcoal/10 p-5 md:p-6 shadow-card">
                <p className="tt-eyebrow text-tat-teal">Draft ready</p>
                <h3 className="mt-2 font-display text-h2 text-tat-charcoal leading-tight text-balance">
                  {itinerary.title}
                </h3>
                <p className="mt-2 text-meta text-tat-slate italic">{itinerary.tagline}</p>

                <dl className="mt-5 grid grid-cols-2 gap-4 text-meta">
                  <div>
                    <dt className="text-tag uppercase text-tat-slate">Best time</dt>
                    <dd className="text-tat-charcoal">{itinerary.bestTimeToVisit}</dd>
                  </div>
                  <div>
                    <dt className="text-tag uppercase text-tat-slate">Estimated</dt>
                    <dd className="text-tat-charcoal">{itinerary.estimatedCostRange}</dd>
                  </div>
                </dl>

                <ol className="mt-5 space-y-4">
                  {itinerary.days.map((d) => (
                    <li
                      key={d.day}
                      className="border-l-2 border-tat-gold/70 pl-4"
                    >
                      <p className="text-tag uppercase text-tat-slate">Day {d.day}</p>
                      <p className="font-serif text-h4 text-tat-charcoal">{d.title}</p>
                      <p className="mt-1 text-meta text-tat-charcoal/80">
                        <strong>Morning. </strong>{d.morning}
                      </p>
                      <p className="text-meta text-tat-charcoal/80">
                        <strong>Afternoon. </strong>{d.afternoon}
                      </p>
                      <p className="text-meta text-tat-charcoal/80">
                        <strong>Evening. </strong>{d.evening}
                      </p>
                      <p className="text-meta text-tat-slate">
                        <strong>Stay. </strong>{d.stay}
                      </p>
                      {d.tip && (
                        <p className="mt-1 text-[12px] bg-amber-50 text-amber-900 px-2.5 py-1.5 rounded">
                          <strong>Tip. </strong>{d.tip}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>

                {matched.length > 0 && (
                  <section className="mt-6 border-t border-tat-charcoal/12 pt-5">
                    <p className="tt-eyebrow">Or pick a ready-made trip</p>
                    <ul className="mt-3 space-y-2">
                      {matched.map((p) => (
                        <li key={p.slug}>
                          <a
                            href={`/packages/${p.slug}`}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-card border border-tat-charcoal/10 hover:border-tat-orange/40 transition"
                          >
                            <span className="text-body-sm text-tat-charcoal truncate">{p.title}</span>
                            <span className="text-meta text-tat-slate shrink-0 tabular-nums">
                              ★ {p.rating.toFixed(1)} · ₹{p.currentPrice.toLocaleString("en-IN")}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`/api/wa/click?src=stream_widget_${destination.toLowerCase().replace(/\s+/g, "_")}&dest=${encodeURIComponent(destination)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-pill bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Refine with a planner on WhatsApp
                  </a>
                  <a
                    href={`tel:+${whatsappNumber}`}
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-pill border border-tat-charcoal/20 text-tat-charcoal text-sm font-medium hover:border-tat-charcoal/40 transition"
                  >
                    Call us
                  </a>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
