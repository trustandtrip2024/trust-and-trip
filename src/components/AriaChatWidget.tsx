"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, ChevronDown, Check, MessageCircle } from "lucide-react";
import { submitLead } from "@/lib/submit-lead";
import { captureIntent } from "@/lib/capture-intent";
import AriaFace from "@/components/AriaFace";

// Build a context-aware wa.me deep link. We feed the planner a one-line
// summary so they pick up the conversation instead of starting over.
function buildWaLink(messages: Message[], packageTitle?: string | null) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content?.trim();
  const parts = ["Hi Trust and Trip!"];
  if (packageTitle) parts.push(`I was looking at ${packageTitle}.`);
  if (lastUser) parts.push(`Aria chat: "${lastUser.slice(0, 200)}"`);
  parts.push("Can a planner take this from here?");
  const txt = parts.join(" ");
  return `https://wa.me/918115999588?text=${encodeURIComponent(txt)}`;
}

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "Char Dham yatra ex Lucknow",
  "Bali honeymoon under ₹1.2L",
  "Private Switzerland 7 nights",
  "Family Singapore in May",
];

const WELCOME = "Hi! I'm Aria — Akash's planning assistant 👋\n\nWe handle India + 30 countries across three tiers (Essentials, Signature, Private). Tell me destination, budget, and group — I'll line up two real options and loop in a planner. Pickup from your city if you're outside metros.";

// Quiz handoff: /quiz writes a summary to sessionStorage and dispatches
// `tt:aria-open` with the same payload. Aria opens, replaces the welcome
// with a quiz-aware greeting, and swaps the quick prompts for ones tuned
// to the user's answers.
const QUIZ_PRELOAD_KEY = "tt_aria_quiz_preload";

interface QuizPreload {
  travelType: string;
  vibe: string;
  duration: string;
  budget: string;
  topMatchTitle?: string;
  topMatchSlug?: string;
}

function isQuizPreload(x: unknown): x is QuizPreload {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.travelType === "string" && typeof o.vibe === "string" && typeof o.duration === "string" && typeof o.budget === "string";
}

function readQuizPreload(): QuizPreload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(QUIZ_PRELOAD_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isQuizPreload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function quizGreeting(p: QuizPreload): string {
  const dur = p.duration === "10+" ? "10+ days" : `${p.duration} days`;
  const bud = p.budget === "lt50k" ? "under ₹50k" : p.budget === "50-100k" ? "₹50k–₹1L" : "₹1L+";
  const match = p.topMatchTitle ? `\n\nYour top match was **${p.topMatchTitle}** — want me to customise it, compare it to the others, or suggest a sharper alternative?` : "";
  return `Welcome back from the quiz 👋\n\nI've got your shortlist — ${p.travelType.toLowerCase()} · ${p.vibe.toLowerCase()} · ${dur} · ${bud} per person.${match}`;
}

function quizPrompts(p: QuizPreload): string[] {
  const prompts = [];
  if (p.topMatchTitle) prompts.push(`Customise the ${p.topMatchTitle} itinerary`);
  prompts.push(`Compare my top 3 ${p.vibe.toLowerCase()} matches`);
  prompts.push(`Cheaper alternatives under my budget`);
  prompts.push(`Best months to travel ${p.vibe === "Beach" ? "to a beach" : p.vibe === "Mountain" ? "to mountains" : "for this trip"}`);
  return prompts;
}

// Package handoff — written by /packages/{slug} via PackageAriaPreload.
const PACKAGE_PRELOAD_KEY = "tt_aria_package_preload";

interface PackagePreload {
  slug: string;
  title: string;
  destinationName: string;
  price: number;
  duration: string;
  travelType: string;
  bestFor?: string;
}

function isPackagePreload(x: unknown): x is PackagePreload {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    typeof o.title === "string" &&
    typeof o.destinationName === "string" &&
    typeof o.price === "number" &&
    typeof o.duration === "string"
  );
}

function readPackagePreload(): PackagePreload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PACKAGE_PRELOAD_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPackagePreload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function packageGreeting(p: PackagePreload): string {
  return `Looking at the **${p.title}** package? 👋\n\nQuick recap: ${p.destinationName} · ${p.duration} · ₹${p.price.toLocaleString("en-IN")} per person · ${p.travelType.toLowerCase()} traveller.\n\nWhat would help — a custom itinerary draft, comparison vs another option, or talking through dates and slots?`;
}

function packagePrompts(p: PackagePreload): string[] {
  return [
    `Customise this trip for our dates`,
    `Compare ${p.destinationName} packages`,
    `What's the best month for this trip?`,
    `Quote with flights from my city`,
  ];
}


// Don't show Aria on conversion-critical surfaces — LPs already have a
// stream-AI widget + WA pill, dashboard has its own chat path.
const HIDDEN_ON = ["/lp/", "/invoice/", "/cart/resume", "/login", "/register", "/admin"];

// Known destinations (canonical labels) used to extract a destination
// signal from the chat transcript when the user opened Aria from a
// surface without an explicit package or quiz preload (e.g. bottom-nav
// FAB on the homepage). Order matters slightly — multi-word names should
// come before substrings of themselves to avoid early bailouts.
const KNOWN_DESTINATIONS: { label: string; pattern: RegExp }[] = [
  { label: "Sri Lanka",     pattern: /\bsri[\s-]*lanka\b/i },
  { label: "Char Dham",     pattern: /\bchar[\s-]*dham\b/i },
  { label: "Vaishno Devi",  pattern: /\bvaishno\s*devi\b/i },
  { label: "Bali",          pattern: /\bbali\b/i },
  { label: "Maldives",      pattern: /\bmaldives?\b/i },
  { label: "Switzerland",   pattern: /\bswitzerland\b|\bswiss\b/i },
  { label: "Santorini",     pattern: /\bsantorini\b/i },
  { label: "Dubai",         pattern: /\bdubai\b/i },
  { label: "Kerala",        pattern: /\bkerala\b/i },
  { label: "Goa",           pattern: /\bgoa\b/i },
  { label: "Thailand",      pattern: /\bthailand\b|\bphuket\b|\bbangkok\b|\bkrabi\b/i },
  { label: "Singapore",     pattern: /\bsingapore\b/i },
  { label: "Japan",         pattern: /\bjapan\b|\btokyo\b|\bkyoto\b/i },
  { label: "Vietnam",       pattern: /\bvietnam\b|\bhanoi\b|\bda\s*nang\b/i },
  { label: "Nepal",         pattern: /\bnepal\b|\bkathmandu\b|\bpokhara\b/i },
  { label: "Bhutan",        pattern: /\bbhutan\b|\bparo\b|\bthimphu\b/i },
  { label: "Mauritius",     pattern: /\bmauritius\b/i },
  { label: "Turkey",        pattern: /\bturkey\b|\bistanbul\b|\bcappadocia\b/i },
  { label: "Australia",     pattern: /\baustralia\b|\bsydney\b/i },
  { label: "Malaysia",      pattern: /\bmalaysia\b|\bkuala\s*lumpur\b/i },
  { label: "Italy",         pattern: /\bitaly\b|\brome\b|\bvenice\b/i },
  { label: "France",        pattern: /\bfrance\b|\bparis\b/i },
  { label: "Greece",        pattern: /\bgreece\b|\bathens\b/i },
  { label: "Iceland",       pattern: /\biceland\b/i },
  { label: "Norway",        pattern: /\bnorway\b/i },
  { label: "Manali",        pattern: /\bmanali\b/i },
  { label: "Shimla",        pattern: /\bshimla\b/i },
  { label: "Coorg",         pattern: /\bcoorg\b/i },
  { label: "Rajasthan",     pattern: /\brajasthan\b|\bjaipur\b|\budaipur\b|\bjodhpur\b/i },
  { label: "Ladakh",        pattern: /\bladakh\b|\bleh\b/i },
  { label: "Andaman",       pattern: /\bandaman\b|\bport\s*blair\b/i },
  { label: "Varanasi",      pattern: /\bvaranasi\b|\bbanaras\b/i },
  { label: "Agra",          pattern: /\bagra\b|\btaj\s*mahal\b/i },
  { label: "Kashmir",       pattern: /\bkashmir\b|\bsrinagar\b/i },
  { label: "Spiti",         pattern: /\bspiti\b/i },
  { label: "Himachal",      pattern: /\bhimachal\b/i },
];

// Travel-type vocabulary mirrors Package.travelType + common synonyms.
const TRAVEL_TYPE_HINTS: { label: string; pattern: RegExp }[] = [
  { label: "Couple", pattern: /\bhoneymoon\b|\bcouple\b|\bromantic\b|\banniversary\b/i },
  { label: "Family", pattern: /\bfamily\b|\bkids?\b|\bchildren\b|\bparents?\b/i },
  { label: "Solo",   pattern: /\bsolo\b|\balone\b|\bmyself\b|\bjust\s+me\b/i },
  { label: "Group",  pattern: /\bgroup\b|\bfriends\b|\b\d{1,2}\s*pax\b|\b\d{1,2}\s*people\b/i },
];

// Loose budget extractor — returns a numeric INR figure when the user
// drops a phrase like "₹50000", "50k", "1 lakh", "1.5L". Used to enrich
// the lead `budget` field so the Bitrix UF_CRM_BUDGET column isn't empty.
function extractBudget(text: string): string | undefined {
  const t = text.toLowerCase();
  const lakh = t.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l\b)/);
  if (lakh) return String(Math.round(parseFloat(lakh[1]) * 100_000));
  const k = t.match(/(?:rs\.?\s*|₹\s*)?(\d{2,3})\s*k\b/);
  if (k) return String(parseInt(k[1], 10) * 1_000);
  const rupee = t.match(/(?:rs\.?\s*|₹\s*)(\d[\d,]{3,})/);
  if (rupee) return rupee[1].replace(/,/g, "");
  return undefined;
}

// Extract the most recently mentioned destination from the chat transcript.
// Walks user messages newest → oldest so a later "actually let's do Goa"
// wins over an earlier "tell me about Bali".
function extractDestinationFromMessages(messages: Message[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    for (const d of KNOWN_DESTINATIONS) {
      if (d.pattern.test(m.content)) return d.label;
    }
  }
  return undefined;
}

function extractTravelTypeFromMessages(messages: Message[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    for (const tt of TRAVEL_TYPE_HINTS) {
      if (tt.pattern.test(m.content)) return tt.label;
    }
  }
  return undefined;
}

function extractBudgetFromMessages(messages: Message[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    const b = extractBudget(m.content);
    if (b) return b;
  }
  return undefined;
}

// Convert the current pathname (e.g. /destinations/bali, /packages/bali-honeymoon)
// into a destination label by matching the first segment against KNOWN_DESTINATIONS.
function extractDestinationFromPath(pathname: string | null): string | undefined {
  if (!pathname) return undefined;
  for (const d of KNOWN_DESTINATIONS) {
    if (d.pattern.test(pathname)) return d.label;
  }
  return undefined;
}

// Detect a likely Indian/intl phone number in the user's message so we
// can auto-open the lead form with the phone prefilled. Avoids the
// scenario where the user types "call me on 98765 43210" but never
// notices the lead-capture pill.
function extractPhoneFromText(text: string): string | undefined {
  const m = text.match(/(\+?\d[\d\s-]{8,14}\d)/);
  if (!m) return undefined;
  // Strip spaces/hyphens for cleanliness, keep leading +.
  const cleaned = m[1].replace(/[\s-]/g, "");
  // Must have at least 10 digits to be a real phone — drops dates/years.
  return cleaned.replace(/\D/g, "").length >= 10 ? cleaned : undefined;
}

export default function AriaChatWidget() {
  const pathname = usePathname();
  const onHidden = !!pathname && HIDDEN_ON.some((p) => pathname.startsWith(p));

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [quizPreload, setQuizPreload] = useState<QuizPreload | null>(null);
  const [packagePreload, setPackagePreload] = useState<PackagePreload | null>(null);
  // Lead-capture state. Form opens once the conversation has 1+ user message
  // OR the assistant's last reply contains a hand-off cue ("name and phone").
  // After successful submit, leadDone stays true for the rest of the session
  // so the prompt doesn't re-appear and pester the user.
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

  // Quiz / package handoff. Quiz handoff fires `tt:aria-open` (so the
  // widget pops open after quiz results). Package handoff is silent —
  // sessionStorage is read on mount and any `send()` so chat is primed
  // when the user taps the FAB. Package preload takes precedence over
  // quiz preload when both exist (more recent intent).
  useEffect(() => {
    function applyPreload() {
      const pkg = readPackagePreload();
      if (pkg) setPackagePreload(pkg);
      const quiz = readQuizPreload();
      if (quiz) setQuizPreload(quiz);

      // Choose greeting: package wins if both, else quiz, else default.
      setMessages((prev) => {
        if (prev.length !== 1) return prev;
        if (pkg) return [{ role: "assistant", content: packageGreeting(pkg) }];
        if (quiz) return [{ role: "assistant", content: quizGreeting(quiz) }];
        return prev;
      });
    }

    function onAriaOpen() {
      applyPreload();
      // Optional one-shot text preload — any caller (destination card,
      // package card, etc.) can drop a question into sessionStorage and
      // dispatch tt:aria-open; the widget pre-fills the input with it.
      try {
        const text = window.sessionStorage.getItem("tt_aria_text_preload");
        if (text) {
          setInput(text);
          window.sessionStorage.removeItem("tt_aria_text_preload");
        }
      } catch {}
      setOpen(true);
    }

    applyPreload();
    window.addEventListener("tt:aria-open", onAriaOpen);
    return () => window.removeEventListener("tt:aria-open", onAriaOpen);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    // Surface the lead form proactively if the user just dropped a phone
    // number in chat — keeps Bitrix from missing high-intent moments where
    // the user types "call me on X" but never notices the sticky pill.
    if (!leadDone) {
      const detectedPhone = extractPhoneFromText(userMsg.content);
      if (detectedPhone) {
        setLeadPhone((prev) => prev || detectedPhone);
        setLeadOpen(true);
      }
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          // Server uses these to skip discovery questions Aria already has
          // answers for. Either may be null.
          quizContext: quizPreload,
          packageContext: packagePreload,
        }),
      });
      const data = await res.json();
      const reply: Message = { role: "assistant", content: data.message ?? "Sorry, I couldn't get a response. Please try again." };
      setMessages((prev) => [...prev, reply]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again or WhatsApp us directly!" }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Lead capture ────────────────────────────────────────────────────────
  // Format the running transcript as a readable bullet list so the planner
  // sees the conversation context inside Bitrix24 instead of having to
  // open the Aria thread separately. Trim each line to keep the message
  // payload reasonable.
  function formatTranscript(): string {
    const lines: string[] = [];
    if (packagePreload) {
      lines.push(`Viewing package: ${packagePreload.title} (${packagePreload.destinationName} · ${packagePreload.duration} · ₹${packagePreload.price.toLocaleString("en-IN")})`);
    }
    if (quizPreload) {
      lines.push(`Quiz: ${quizPreload.travelType} · ${quizPreload.vibe} · ${quizPreload.duration} · ${quizPreload.budget}${quizPreload.topMatchTitle ? ` · top match: ${quizPreload.topMatchTitle}` : ""}`);
    }
    lines.push("--- Aria conversation ---");
    for (const m of messages) {
      const who = m.role === "user" ? "User" : "Aria";
      const text = m.content.replace(/\s+/g, " ").trim().slice(0, 400);
      lines.push(`${who}: ${text}`);
    }
    return lines.join("\n");
  }

  const submitAriaLead = async () => {
    setLeadError(null);
    if (!leadName.trim() || !leadPhone.trim()) {
      setLeadError("Name and phone are required.");
      return;
    }
    if (!/^[+\d][\d\s-]{7,}$/.test(leadPhone.trim())) {
      setLeadError("Enter a valid phone number.");
      return;
    }
    // Pull as much structured context out of the chat as we can so the
    // Bitrix lead lands with destination/travel_type/budget filled in even
    // when the user opened Aria from the bottom-nav FAB (no preload).
    const inferredDestination =
      packagePreload?.destinationName
      || extractDestinationFromMessages(messages)
      || extractDestinationFromPath(pathname);
    const inferredTravelType =
      packagePreload?.travelType
      || quizPreload?.travelType
      || extractTravelTypeFromMessages(messages);
    const inferredBudget = extractBudgetFromMessages(messages);

    setLeadSubmitting(true);
    try {
      const result = await submitLead({
        name: leadName.trim(),
        phone: leadPhone.trim(),
        email: leadEmail.trim(),
        source: "aria_chat",
        message: formatTranscript(),
        package_title: packagePreload?.title,
        package_slug: packagePreload?.slug,
        destination: inferredDestination,
        travel_type: inferredTravelType,
        budget: inferredBudget,
      });
      if (!result.ok) {
        setLeadError(result.error ?? "Could not send. Try WhatsApp instead.");
        return;
      }
      setLeadDone(true);
      setLeadOpen(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Got it, ${leadName.trim().split(" ")[0]} 🎉 A planner will reach you on ${leadPhone.trim()} within 2 hours with a custom itinerary. Anything else you'd like me to note?`,
        },
      ]);
    } catch {
      setLeadError("Network error. Try WhatsApp instead.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  const userMsgCount = messages.filter((m) => m.role === "user").length;
  // Surface the lead-capture pill once the user has sent at least one message
  // or arrived via package/quiz preload (intent already implicit).
  const showLeadPrompt = !leadDone && (userMsgCount >= 1 || !!packagePreload);

  if (onHidden) return null;

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[5.5rem] md:bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-tat-charcoal/8 overflow-hidden flex flex-col"
            style={{ maxHeight: "min(520px, 72vh)" }}
          >
            {/* Header */}
            <div className="bg-tat-charcoal px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-full bg-tat-cream-warm overflow-hidden flex items-end justify-center border-2 border-tat-gold/40">
                  <AriaFace size={38} />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-tat-success-fg border-2 border-tat-charcoal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-tat-paper text-sm">Aria</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-tat-gold/20 text-tat-gold uppercase tracking-wider font-medium">AI</span>
                </div>
                <p className="text-[11px] text-tat-paper/50">AI · Akash's planning team takes over on WhatsApp</p>
              </div>
              <a
                href={buildWaLink(messages, packagePreload?.title)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => captureIntent("whatsapp_click", { note: "Aria chat header handoff" })}
                className="inline-flex items-center gap-1 px-2.5 h-7 rounded-full bg-whatsapp/15 text-whatsapp-deep text-[11px] font-semibold border border-whatsapp/30 hover:bg-whatsapp/25 transition-colors"
                aria-label="Continue on WhatsApp with a human planner"
              >
                <MessageCircle className="h-3 w-3 fill-whatsapp text-whatsapp" aria-hidden />
                Talk to human
              </a>
              <button onClick={() => setOpen(false)} className="text-tat-paper/40 hover:text-tat-paper transition-colors p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
                  {m.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-tat-cream-warm overflow-hidden flex items-end justify-center shrink-0 border border-tat-gold/30">
                      <AriaFace size={26} />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-tat-gold text-tat-charcoal rounded-br-sm"
                      : "bg-white text-tat-charcoal border border-tat-charcoal/6 rounded-bl-sm shadow-sm"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-end gap-2">
                  <div className="h-7 w-7 rounded-full bg-tat-cream-warm overflow-hidden flex items-end justify-center shrink-0 border border-tat-gold/30">
                    <AriaFace size={26} />
                  </div>
                  <div className="bg-white border border-tat-charcoal/6 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-tat-charcoal/30 block"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts — handoff-aware. Package wins over quiz wins
                over default starter prompts. */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap bg-gray-50">
                {(packagePreload ? packagePrompts(packagePreload)
                  : quizPreload ? quizPrompts(quizPreload)
                  : QUICK_PROMPTS).map((q) => (
                  <button key={q} onClick={() => send(q)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-tat-charcoal/10 text-tat-charcoal/60 hover:border-tat-gold hover:text-tat-charcoal transition-all whitespace-nowrap">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Lead capture — sticky pill that expands to a 3-field form once
                the user has signaled real intent. Submitting posts the full
                transcript + any package/quiz context to /api/leads, which
                handles Supabase + Bitrix24 + Resend + CAPI in one go. */}
            {showLeadPrompt && (
              <div className="px-3 pt-2 pb-1 bg-white border-t border-tat-charcoal/6 shrink-0">
                {!leadOpen ? (
                  <button
                    type="button"
                    onClick={() => setLeadOpen(true)}
                    className="w-full inline-flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-tat-gold/10 border border-tat-gold/40 text-tat-charcoal text-[13px] font-semibold hover:bg-tat-gold/15 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-tat-gold" />
                      Get a custom itinerary in 2 h
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-tat-charcoal/50 -rotate-90" />
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-tat-charcoal">
                        Share details — planner replies in 2 h
                      </p>
                      <button
                        type="button"
                        onClick={() => setLeadOpen(false)}
                        className="text-[11px] text-tat-charcoal/50 hover:text-tat-charcoal"
                      >
                        Hide
                      </button>
                    </div>
                    <input
                      type="text"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      className="w-full h-9 px-3 rounded-lg bg-gray-50 border border-tat-charcoal/10 text-sm text-tat-charcoal outline-none focus:border-tat-gold"
                    />
                    <input
                      type="tel"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="Phone (with country code)"
                      autoComplete="tel"
                      inputMode="tel"
                      className="w-full h-9 px-3 rounded-lg bg-gray-50 border border-tat-charcoal/10 text-sm text-tat-charcoal outline-none focus:border-tat-gold"
                    />
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="Email (optional)"
                      autoComplete="email"
                      inputMode="email"
                      className="w-full h-9 px-3 rounded-lg bg-gray-50 border border-tat-charcoal/10 text-sm text-tat-charcoal outline-none focus:border-tat-gold"
                    />
                    {leadError && (
                      <p className="text-[11px] text-tat-danger-fg">{leadError}</p>
                    )}
                    <button
                      type="button"
                      onClick={submitAriaLead}
                      disabled={leadSubmitting}
                      className="w-full h-9 rounded-lg bg-tat-teal hover:bg-tat-teal-deep text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 transition"
                    >
                      {leadSubmitting ? "Sending…" : "Send to a planner"}
                      {!leadSubmitting && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <p className="text-[10px] text-tat-charcoal/50">
                      Free until you&apos;re sure · No card needed
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-2 bg-white border-t border-tat-charcoal/6 shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-tat-charcoal/10 px-3 focus-within:border-tat-gold transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Ask about any destination…"
                  className="flex-1 bg-transparent text-sm py-3 outline-none text-tat-charcoal placeholder:text-tat-charcoal/35"
                />
                <button onClick={() => send(input)} disabled={!input.trim() || loading}
                  className="h-8 w-8 rounded-lg bg-tat-gold flex items-center justify-center disabled:opacity-40 hover:bg-tat-gold/80 transition-colors shrink-0">
                  <Send className="h-3.5 w-3.5 text-tat-charcoal" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
