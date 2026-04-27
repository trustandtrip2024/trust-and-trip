"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { submitLead } from "@/lib/submit-lead";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "Best honeymoon under ₹60,000?",
  "Family trip to Bali 🌴",
  "Solo trip for December",
  "Maldives packages",
];

const WELCOME = "Hi! I'm Aria, your personal travel assistant 👋\n\nTell me where you'd love to go, your budget, and who you're traveling with — I'll find the perfect trip for you!";

// Illustrated female face SVG avatar
function AriaFace({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      {/* Hair back */}
      <ellipse cx="32" cy="22" rx="20" ry="21" fill="#1a0a00" />
      {/* Neck */}
      <rect x="26" y="46" width="12" height="10" rx="4" fill="#f5c5a3" />
      {/* Face */}
      <ellipse cx="32" cy="34" rx="17" ry="19" fill="#f5c5a3" />
      {/* Hair top + sides */}
      <ellipse cx="32" cy="16" rx="18" ry="10" fill="#1a0a00" />
      <ellipse cx="13" cy="30" rx="5" ry="12" fill="#1a0a00" />
      <ellipse cx="51" cy="30" rx="5" ry="12" fill="#1a0a00" />
      {/* Hair highlight */}
      <ellipse cx="24" cy="14" rx="6" ry="3" fill="#3d1f00" opacity="0.6" />
      {/* Eyebrows */}
      <path d="M22 27 Q25.5 24.5 29 26" stroke="#5c2e00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M35 26 Q38.5 24.5 42 27" stroke="#5c2e00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Eyes white */}
      <ellipse cx="26" cy="31" rx="4.5" ry="4" fill="white" />
      <ellipse cx="38" cy="31" rx="4.5" ry="4" fill="white" />
      {/* Iris */}
      <circle cx="26.5" cy="31.5" r="2.8" fill="#3d1f00" />
      <circle cx="38.5" cy="31.5" r="2.8" fill="#3d1f00" />
      {/* Pupil shine */}
      <circle cx="27.5" cy="30.5" r="1" fill="white" />
      <circle cx="39.5" cy="30.5" r="1" fill="white" />
      {/* Nose */}
      <path d="M32 33 Q30 37 29 38 Q32 39.5 35 38 Q34 37 32 33Z" fill="#e8a882" opacity="0.7" />
      {/* Smile */}
      <path d="M25 42 Q32 47 39 42" stroke="#c4775a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Lips */}
      <path d="M26 42.5 Q32 45.5 38 42.5" stroke="#d4826a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <ellipse cx="20" cy="39" rx="5" ry="3.5" fill="#f4a0a0" opacity="0.35" />
      <ellipse cx="44" cy="39" rx="5" ry="3.5" fill="#f4a0a0" opacity="0.35" />
      {/* Earrings */}
      <circle cx="14.5" cy="35" r="2" fill="#F59E0B" opacity="0.9" />
      <circle cx="49.5" cy="35" r="2" fill="#F59E0B" opacity="0.9" />
    </svg>
  );
}

export default function AriaChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showLabel, setShowLabel] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

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
        body: JSON.stringify({ messages: updated.map((m) => ({ role: m.role, content: m.content })) }),
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
                <div className="h-10 w-10 rounded-full bg-[#f5c5a3] overflow-hidden flex items-end justify-center border-2 border-tat-gold/40">
                  <AriaFace size={38} />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-tat-charcoal" />
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
                    <div className="h-7 w-7 rounded-full bg-[#f5c5a3] overflow-hidden flex items-end justify-center shrink-0 border border-tat-gold/30">
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
                  <div className="h-7 w-7 rounded-full bg-[#f5c5a3] overflow-hidden flex items-end justify-center shrink-0 border border-tat-gold/30">
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

            {/* Quick prompts */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap bg-gray-50">
                {QUICK_PROMPTS.map((q) => (
                  <button key={q} onClick={() => send(q)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-tat-charcoal/10 text-tat-charcoal/60 hover:border-tat-gold hover:text-tat-charcoal transition-all whitespace-nowrap">
                    {q}
                  </button>
                ))}
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
                className="h-[58px] w-[58px] rounded-full bg-[#f5c5a3] overflow-hidden flex items-end justify-center shadow-[0_4px_20px_rgba(245,158,11,0.35)] border-2 border-tat-gold/60"
              >
                <AriaFace size={56} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Online dot */}
          {!open && (
            <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-white shadow-sm" />
          )}

          {/* Unread badge */}
          {unread > 0 && !open && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center shadow"
            >
              {unread}
            </motion.span>
          )}
        </motion.button>
      </div>
    </>
  );
}
