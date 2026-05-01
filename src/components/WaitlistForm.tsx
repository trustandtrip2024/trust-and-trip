"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { submitLead } from "@/lib/submit-lead";

type Status = "idle" | "loading" | "success" | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setError("Enter a valid email so we can ping you on launch day.");
      return;
    }
    setStatus("loading");
    setError(null);
    const res = await submitLead({
      name: "Waitlist signup",
      email: trimmed,
      phone: "",
      message: "Joined launch waitlist from /coming-soon",
      source: "newsletter",
    });
    if (res.ok) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
      setError(res.error ?? "Something went wrong. Try again in a moment.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-card border border-tat-teal/30 bg-tat-teal/8 p-4 text-tat-teal-deep">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">You&apos;re on the list.</p>
          <p className="mt-1 text-sm text-tat-charcoal/75">
            We&apos;ll send one note Monday morning — and a launch-week offer with it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          disabled={status === "loading"}
          className="flex-1 rounded-full border border-tat-charcoal/15 bg-tat-paper px-5 py-3 text-sm text-tat-charcoal shadow-soft outline-none transition placeholder:text-tat-charcoal/40 focus:border-tat-teal focus:ring-2 focus:ring-tat-teal/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary justify-center disabled:opacity-70"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              Notify me
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      {status === "error" && error && (
        <p className="mt-2 text-sm text-tat-danger-fg" role="alert">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-tat-charcoal/50">
        One email. No spam, ever. Unsubscribe in a click.
      </p>
    </form>
  );
}
