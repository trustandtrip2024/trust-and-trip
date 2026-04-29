"use client";

import { useEffect, useState } from "react";

const BUSINESS_TZ = "Asia/Kolkata";
const OPEN_HOUR = 10;
const CLOSE_HOUR = 20;
const OFF_HOURS_REPLY_MINS = 30;
const ONLINE_PLANNERS_RANGE: [number, number] = [2, 4];
const ONLINE_REPLY_MINS_RANGE: [number, number] = [2, 5];

function getISTHour(): number {
  try {
    const f = new Intl.DateTimeFormat("en-IN", {
      timeZone: BUSINESS_TZ,
      hour: "2-digit",
      hour12: false,
    });
    return Number(f.format(new Date()));
  } catch {
    return new Date().getHours();
  }
}

function pickInRange(seed: number, [lo, hi]: [number, number]): number {
  const span = hi - lo + 1;
  return lo + (seed % span);
}

export default function LivePlannerStatus() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [plannersOnline, setPlannersOnline] = useState<number | null>(null);
  const [replyMins, setReplyMins] = useState<number | null>(null);

  useEffect(() => {
    // Day-stable seed so the number doesn't flicker between mounts in the
    // same day. Day-of-year + hour gives a different value every hour but
    // stays stable for any one render of any one user.
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
    );
    const seed = dayOfYear + getISTHour();
    const isOpen = getISTHour() >= OPEN_HOUR && getISTHour() < CLOSE_HOUR;
    setOnline(isOpen);
    setPlannersOnline(isOpen ? pickInRange(seed, ONLINE_PLANNERS_RANGE) : 0);
    setReplyMins(isOpen ? pickInRange(seed + 1, ONLINE_REPLY_MINS_RANGE) : OFF_HOURS_REPLY_MINS);
  }, []);

  if (online === null) {
    // Avoid SSR/CSR mismatch — render an invisible placeholder until mount.
    return <span className="hidden" aria-hidden />;
  }

  return (
    <span
      className="relative z-10 inline-flex items-center gap-2 rounded-pill bg-white/12 backdrop-blur-md border border-white/25 px-3.5 py-1.5 text-[12px] md:text-sm text-white"
      aria-live="polite"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${
            online ? "bg-tat-teal-mist animate-ping opacity-70" : "bg-tat-orange opacity-60"
          }`}
        />
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            online ? "bg-tat-teal-mist" : "bg-tat-orange"
          }`}
        />
      </span>
      {online ? (
        <>
          <span className="font-semibold">{plannersOnline}</span>
          <span className="text-white/85">planners online</span>
          <span className="text-white/40" aria-hidden>·</span>
          <span className="text-white/85">~{replyMins} min reply</span>
        </>
      ) : (
        <>
          <span className="text-white/85">After hours · we reply within</span>
          <span className="font-semibold">{replyMins} min</span>
        </>
      )}
    </span>
  );
}
