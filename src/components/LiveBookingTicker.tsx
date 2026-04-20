"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bookings = [
  { name: "Ananya S.", from: "Pune", destination: "Bali Honeymoon", time: "2 hrs ago" },
  { name: "Rahul K.", from: "Delhi", destination: "Maldives Escape", time: "4 hrs ago" },
  { name: "Priya M.", from: "Mumbai", destination: "Manali Family Trip", time: "1 hr ago" },
  { name: "Vikram R.", from: "Bangalore", destination: "Dubai Explorer", time: "45 min ago" },
  { name: "Sneha P.", from: "Chennai", destination: "Thailand Adventure", time: "3 hrs ago" },
];

export default function LiveBookingTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % bookings.length), 4000);
    return () => clearInterval(t);
  }, [visible]);

  if (!visible) return null;

  const b = bookings[index];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.35 }}
        className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-2 text-cream"
      >
        {/* Live pulse */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        <span className="text-[11px] leading-none">
          <span className="font-semibold">{b.name}</span>
          <span className="text-cream/60"> from {b.from} booked </span>
          <span className="text-gold font-medium">{b.destination}</span>
        </span>
        <span className="text-[10px] text-cream/35 shrink-0 pl-1 border-l border-white/10">
          {b.time}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
