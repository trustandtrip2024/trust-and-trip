import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-cream">
      <div className="container-custom max-w-xl text-center py-20">
        <p className="font-display text-[10rem] md:text-[14rem] text-gold leading-none font-medium">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl md:text-4xl font-medium text-balance">
          This page has wandered off.
        </h1>
        <p className="mt-4 text-ink/60 leading-relaxed">
          Some of the best trips begin with a wrong turn. Let's get you back on the map.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/destinations" className="btn-outline">
            Explore Destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
