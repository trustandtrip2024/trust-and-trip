/**
 * Visible-on-focus skip link. First focusable element on every page so
 * keyboard users can jump past the sticky header + sticky subnav stack.
 * No "use client" — pure anchor, server-rendered, no JS required.
 */
export default function SkipToMain() {
  return (
    <a
      href="#main"
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[100] focus-visible:inline-flex focus-visible:items-center focus-visible:gap-2 focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-pill focus-visible:bg-tat-charcoal focus-visible:text-tat-paper focus-visible:text-body-sm focus-visible:font-semibold focus-visible:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
    >
      Skip to content
    </a>
  );
}
