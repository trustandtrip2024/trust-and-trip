"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className={`h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-tat-charcoal/5 dark:hover:bg-white/10 transition-colors ${className}`}
    >
      {/* Both icons live in the DOM; the `.dark` class set on <html> by
          the pre-hydration theme script picks the correct one before paint.
          This avoids the Moon→Sun flicker that the previous mounted-flag
          pattern produced when the user had dark mode persisted. */}
      <Moon className="h-4 w-4 dark:hidden" aria-hidden />
      <Sun className="hidden dark:inline-block h-4 w-4 text-tat-gold" aria-hidden />
    </button>
  );
}
