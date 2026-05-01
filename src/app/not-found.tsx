import NotFoundSuggestions from "@/components/NotFoundSuggestions";

// Path-based suggestion logic moved to a client component. Reading
// `headers()` here would force every route in the app into dynamic
// rendering (Next 14 treats not-found.tsx as part of the route segment
// for static-generation analysis), and that kills the edge cache that
// Meta-ad cold-clicks rely on.

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-tat-paper px-4">
      <div className="text-center max-w-2xl py-20">
        <p className="font-display font-medium leading-none select-none text-tat-gold/15"
          style={{ fontSize: "clamp(6rem, 22vw, 16rem)" }}>
          404
        </p>

        <h1 className="font-display text-h2 font-medium text-tat-charcoal -mt-4 text-balance">
          This page took a detour.
        </h1>
        <p className="mt-4 text-tat-charcoal/65 leading-relaxed max-w-md mx-auto">
          Some of the best trips begin with a wrong turn — but this isn&apos;t
          one of them. Let&apos;s get you somewhere worth going.
        </p>

        <NotFoundSuggestions />
      </div>
    </div>
  );
}
