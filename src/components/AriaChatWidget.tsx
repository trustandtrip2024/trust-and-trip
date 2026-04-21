"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, Sparkles } from "lucide-react";
import { submitLead } from "@/lib/submit-lead";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "Best honeymoon under ₹60,000?",
  "Family trip to Bali 🌴",
  "Solo trip for December",
  "Maldives packages",
];

const WELCOME = "Hi! I'm Aria, your personal travel assistant 👋\n\nTell me where you'd love to go, your budget, and who you're traveling with — I'll find the perfect trip for you!";

export default function AriaChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

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

      // Auto-capture lead if assistant asks for contact info
      if (reply.content.toLowerCase().includes("name and phone")) {
        // Next user message likely has contact info — handled passively
      }
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
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[5.5rem] md:bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-ink/8 overflow-hidden flex flex-col"
            style={{ maxHeight: "min(520px, 70vh)" }}
          >
            {/* Header */}
            <div className="bg-ink px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-cream text-sm">Aria — Travel Assistant</p>
                <p className="text-[11px] text-cream/50">Powered by AI · Usually replies instantly</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-cream/40 hover:text-cream transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-ink flex items-center justify-center shrink-0 mr-2 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-gold" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-gold text-ink rounded-tr-sm"
                      : "bg-white text-ink border border-ink/6 rounded-tl-sm shadow-sm"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="h-7 w-7 rounded-full bg-ink flex items-center justify-center shrink-0 mr-2">
                    <Bot className="h-3.5 w-3.5 text-gold" />
                  </div>
                  <div className="bg-white border border-ink/6 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <Loader2 className="h-4 w-4 text-ink/40 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts — only on first message */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap bg-gray-50">
                {QUICK_PROMPTS.map((q) => (
                  <button key={q} onClick={() => send(q)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-ink/10 text-ink/60 hover:border-gold hover:text-ink transition-all whitespace-nowrap">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-2 bg-white border-t border-ink/6 shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-ink/10 px-3 focus-within:border-gold transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Ask about any destination…"
                  className="flex-1 bg-transparent text-sm py-3 outline-none text-ink placeholder:text-ink/35"
                />
                <button onClick={() => send(input)} disabled={!input.trim() || loading}
                  className="h-8 w-8 rounded-lg bg-gold flex items-center justify-center disabled:opacity-40 hover:bg-gold/80 transition-colors shrink-0">
                  <Send className="h-3.5 w-3.5 text-ink" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 200, damping: 15 }}
        className="fixed bottom-[4.5rem] md:bottom-6 left-4 md:left-6 z-50 h-13 w-13 rounded-full bg-ink text-cream shadow-soft-lg flex items-center justify-center hover:bg-gold hover:text-ink transition-all duration-300 group"
        style={{ height: 52, width: 52 }}
        aria-label="Chat with Aria"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </motion.button>
    </>
  );
}
