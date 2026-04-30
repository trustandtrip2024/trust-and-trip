"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Send, Sparkles, ChevronDown, Check } from "lucide-react";
import { submitLead } from "@/lib/submit-lead";

const ARIA_PORTRAIT =
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=facearea&facepad=2.5&w=240&h=240&q=80";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "Best honeymoon under ₹60,000?",
  "Family trip to Bali 🌴",
  "Solo trip for December",
  "Maldives packages",
];

const WELCOME = "Hi! I'm Aria, your personal travel assistant 👋\n\nTell me where you'd love to go, your budget, and who you're traveling with — I'll find the perfect trip for you!";

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

// Photo-based avatar — face-cropped Unsplash portrait. The "AI" pill in
// the chat header makes the AI nature explicit so this isn't deceptive.
function AriaFace({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-block overflow-hidden rounded-full bg-tat-cream-warm ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={ARIA_PORTRAIT}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        quality={80}
        className="h-full w-full object-cover"
        priority={size >= 50}
      />
    </span>
  );
}

// Don't show Aria on conversion-critical surfaces — LPs already have a
// stream-AI widget + WA pill, dashboard has its own chat path.
const HIDDEN_ON = ["/lp/", "/invoice/", "/cart/resume", "/login", "/register", "/admin"];

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
  const [showLabel, setShowLabel] = useState(false);
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
      setOpen(true);
    }

    applyPreload();
    window.addEventListener("tt:aria-open", onAriaOpen);
    return () => window.removeEventListener("tt:aria-open", onAriaOpen);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show label bubble after 3s if chat not opened
  useEffect(() => {
    const t = setTimeout(() => { if (!open) setShowLabel(true); }, 3000);
    const t2 = setTimeout(() => setShowLabel(false), 9000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

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
        destination: packagePreload?.destinationName,
        travel_type: packagePreload?.travelType ?? quizPreload?.travelType,
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
                <p className="text-[11px] text-tat-paper/50">Travel assistant · Online now</p>
              </div>
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

      {/* FAB */}
      <div data-aria-widget className="fixed bottom-[4.5rem] md:bottom-6 left-4 md:left-6 z-50 flex items-center gap-2">

        {/* "Ask Aria" floating label */}
        <AnimatePresence>
          {showLabel && !open && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="bg-tat-charcoal text-tat-paper text-xs font-medium px-3 py-2 rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap pointer-events-none"
            >
              <Sparkles className="h-3 w-3 text-tat-gold" />
              Ask Aria ✨
              {/* Arrow */}
              <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-[6px] border-transparent border-l-ink" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar button */}
        <motion.button
          onClick={() => { setOpen((o) => !o); setShowLabel(false); }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, type: "spring", stiffness: 200, damping: 15 }}
          className="relative flex items-center justify-center"
          style={{ height: 58, width: 58 }}
          aria-label="Chat with Aria"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
        >
          {/* Pulse rings */}
          {!open && (
            <>
              <span className="absolute inset-0 rounded-full bg-tat-gold/20 animate-ping" style={{ animationDuration: "2.5s" }} />
              <span className="absolute inset-[-4px] rounded-full border border-tat-gold/25" />
            </>
          )}

          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="close"
                initial={{ scale: 0.7, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.7, opacity: 0, rotate: 90 }}
                className="h-[58px] w-[58px] rounded-full bg-tat-charcoal flex items-center justify-center shadow-lg"
              >
                <X className="h-5 w-5 text-tat-paper" />
              </motion.div>
            ) : (
              <motion.div key="face"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="h-[58px] w-[58px] rounded-full bg-tat-cream-warm overflow-hidden flex items-end justify-center shadow-[0_4px_20px_rgba(245,158,11,0.35)] border-2 border-tat-gold/60"
              >
                <AriaFace size={56} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Online dot */}
          {!open && (
            <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-tat-success-fg border-2 border-white shadow-sm" />
          )}

          {/* Unread badge */}
          {unread > 0 && !open && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-tat-orange text-white text-[10px] font-semibold flex items-center justify-center shadow"
            >
              {unread}
            </motion.span>
          )}
        </motion.button>
      </div>
    </>
  );
}
