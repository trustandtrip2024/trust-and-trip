"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-tat-charcoal/5 dark:hover:bg-white/10 transition-colors ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-tat-gold" />
      ) : (
        // Inherit currentColor so the icon stays visible whether the toggle
        // sits on a light header (charcoal text) or the dark mobile header
        // (paper text passed in via className).
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
