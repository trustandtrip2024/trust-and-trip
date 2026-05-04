export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import Image from "next/image";
import {
  Search as SearchIcon, MapPin, Package as PackageIcon, BookOpen,
  ArrowRight, Sparkles, MessageCircle, Compass,
} from "lucide-react";
import { sanityClient, urlFor } from "@/lib/sanity";
import SearchInputClient from "@/components/search/SearchInputClient";
import StickyOnScrollUp from "@/components/StickyOnScrollUp";

interface RawResult {
  type: "package" | "destination" | "post";
  title: string;
  slug: string;
  sub: string;
  image: any;
}

interface NormalizedResult {
  type: "package" | "destination" | "post";
  title: string;
  slug: string;
  sub: string;
  image: string | null;
  href: string;
}

const TYPE_META = {
  package:     { label: "Package",     icon: PackageIcon, color: "bg-tat-gold/15 text-tat-gold" },
  destination: { label: "Destination", icon: MapPin,      color: "bg-tat-info-bg text-tat-info-fg" },
  post:        { label: "Article",     icon: BookOpen,    color: "bg-purple-50 text-purple-600" },
};

const POPULAR_DESTINATIONS = [
  { emoji: "🌺", label: "Bali",        href: "/destinations/bali" },
  { emoji: "🌴", label: "Kerala",      href: "/destinations/kerala" },
  { emoji: "🏜️", label: "Rajasthan",   href: "/destinations/rajasthan" },
  { emoji: "🏝️", label: "Maldives",    href: "/destinations/maldives" },
  { emoji: "🛕", label: "Uttarakhand", href: "/destinations/uttarakhand" },
  { emoji: "🏔️", label: "Switzerland", href: "/destinations/switzerland" },
  { emoji: "🐘", label: "Thailand",    href: "/destinations/thailand" },
  { emoji: "⛰️", label: "Ladakh",      href: "/destinations/ladakh" },
];

interface Props {
  searchParams?: { q?: string; type?: string };
}

export const metadata = {
  title: "Search — Trust and Trip",
  description: "Find packages, destinations and journal articles across Trust and Trip.",
  robots: { index: false, follow: true },
};

async function runSearch(q: string): Promise<{
  packages: NormalizedResult[];
  destinations: NormalizedResult[];
  posts: NormalizedResult[];
}> {
  const empty = { packages: [], destinations: [], posts: [] };
  if (!q || q.length < 2) return empty;

  const groq = `{
    "packages": *[_type == "package" && (
      title match $q || destination->name match $q || travelType match $q || category match $q
    )] | order(rating desc) [0...30] {
      "type": "package",
      "title": title,
      "slug": slug.current,
      "sub": destination->name + " · " + duration + " · ₹" + string(price),
      "image": image
    },
    "destinations": *[_type == "destination" && (
      name match $q || country match $q || region match $q
    )] | order(name asc) [0...20] {
      "type": "destination",
      "title": name,
      "slug": slug.current,
      "sub": country + " · From ₹" + string(priceFrom),
      "image": image
    },
    "posts": *[_type == "blogPost" && (
      title match $q || category match $q || excerpt match $q
    )] | order(date desc) [0...20] {
      "type": "post",
      "title": title,
      "slug": slug.current,
      "sub": category + " · " + readTime,
      "image": image.asset->url
    }
  }`;

  try {
    const data = await sanityClient.fetch<{
      packages: RawResult[];
      destinations: RawResult[];
      posts: RawResult[];
    }>(groq, { q: `${q}*` });

    const norm = (r: RawResult, hrefBase: string): NormalizedResult => ({
      type: r.type,
      title: r.title,
      slug: r.slug,
      sub: r.sub,
      image: r.image
        ? (typeof r.image === "string"
            ? r.image
            : urlFor(r.image).width(280).quality(70).url())
        : null,
      href: `${hrefBase}/${r.slug}`,
    });

    return {
      packages: data.packages.map((r) => norm(r, "/packages")),
      destinations: data.destinations.map((r) => norm(r, "/destinations")),
      posts: data.posts.map((r) => norm(r, "/blog")),
    };
  } catch {
    return empty;
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams?.q ?? "").trim();
  const type = (searchParams?.type ?? "all") as "all" | "package" | "destination" | "post";

  const grouped = await runSearch(q);
  const totalCount = grouped.packages.length + grouped.destinations.length + grouped.posts.length;

  const visiblePackages    = type === "all" || type === "package"     ? grouped.packages     : [];
  const visibleDestinations = type === "all" || type === "destination" ? grouped.destinations : [];
  const visiblePosts        = type === "all" || type === "post"        ? grouped.posts        : [];
  const visibleCount = visiblePackages.length + visibleDestinations.length + visiblePosts.length;

  const TYPE_TABS: { id: typeof type; label: string; count: number }[] = [
    { id: "all",         label: "All",          count: totalCount },
    { id: "package",     label: "Packages",     count: grouped.packages.length },
    { id: "destination", label: "Destinations", count: grouped.destinations.length },
    { id: "post",        label: "Articles",     count: grouped.posts.length },
  ];

  return (
    <>
      {/* Hero — search input lives here, full-width, mirrors site header
          width so the "search result page" feels canonical, not a modal. */}
      <section className="pt-24 md:pt-28 pb-6 md:pb-8 bg-tat-paper border-b border-tat-charcoal/8">
        <div className="container-custom max-w-3xl">
          <span className="eyebrow inline-flex items-center gap-1.5">
            <SearchIcon className="h-3 w-3 text-tat-gold" />
            Search
          </span>
          <h1 className="mt-2 font-display text-display-md font-medium leading-tight text-balance">
            {q ? (
              <>
                Results for{" "}
                <span className="italic font-display font-light text-tat-gold">
                  &ldquo;{q}&rdquo;
                </span>
              </>
            ) : (
              <>
                What are you looking{" "}
                <span className="italic font-display font-light text-tat-gold">
                  for?
                </span>
              </>
            )}
          </h1>
          <SearchInputClient initialQuery={q} />
          {q && (
            <p className="mt-3 text-[13px] text-tat-charcoal/55">
              {totalCount === 0
                ? "No matches found yet."
                : `${totalCount} result${totalCount === 1 ? "" : "s"} across packages, destinations and journal articles.`}
            </p>
          )}
        </div>
      </section>

      {/* Type filter chips */}
      {q && totalCount > 0 && (
        <StickyOnScrollUp className="bg-tat-paper/95 backdrop-blur-md border-b border-tat-charcoal/8">
          <div className="container-custom py-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
              {TYPE_TABS.map((t) => {
                const params = new URLSearchParams();
                params.set("q", q);
                if (t.id !== "all") params.set("type", t.id);
                const href = `/search?${params.toString()}`;
                return (
                  <Link
                    key={t.id}
                    href={href}
                    aria-current={type === t.id ? "page" : undefined}
                    className={[
                      "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-[12px] font-semibold transition-colors whitespace-nowrap",
                      type === t.id
                        ? "bg-tat-charcoal text-white"
                        : "bg-tat-cream-warm/40 text-tat-charcoal/70 ring-1 ring-tat-charcoal/10 hover:bg-tat-charcoal/8",
                    ].join(" ")}
                  >
                    {t.label}
                    <span className={[
                      "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold",
                      type === t.id
                        ? "bg-white/20 text-white"
                        : "bg-tat-charcoal/8 text-tat-charcoal/65",
                    ].join(" ")}>
                      {t.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </StickyOnScrollUp>
      )}

      {/* Body */}
      <main className="container-custom py-10 md:py-12 max-w-5xl">
        {/* No query — popular suggestions */}
        {!q && (
          <div className="space-y-10">
            <div>
              <h2 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-tat-charcoal/55 mb-4">
                Popular destinations
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {POPULAR_DESTINATIONS.map(({ emoji, label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-tat-paper border border-tat-charcoal/15 text-tat-charcoal text-[14px] font-medium hover:border-tat-gold hover:bg-tat-gold/5"
                  >
                    <span aria-hidden>{emoji}</span>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-tat-charcoal/55 mb-4">
                Browse by experience
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { label: "Honeymoon",  href: "/experiences/honeymoon" },
                  { label: "Family",     href: "/experiences/family" },
                  { label: "Solo",       href: "/experiences/solo" },
                  { label: "Adventure",  href: "/experiences/adventure" },
                  { label: "Wellness",   href: "/experiences/wellness" },
                  { label: "Pilgrim",    href: "/experiences/pilgrim" },
                  { label: "Luxury",     href: "/experiences/luxury" },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-tat-paper border border-tat-charcoal/15 text-tat-charcoal text-[14px] font-medium hover:border-tat-gold hover:bg-tat-gold/5"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty results state */}
        {q && totalCount === 0 && (
          <div className="text-center py-12 md:py-16">
            <div className="mx-auto h-16 w-16 rounded-full bg-tat-gold/10 grid place-items-center">
              <Compass className="h-7 w-7 text-tat-gold" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-medium text-tat-charcoal">
              Nothing matched &ldquo;{q}&rdquo; yet.
            </h2>
            <p className="mt-2 text-tat-charcoal/60 max-w-md mx-auto text-[14px]">
              Try a broader keyword (try a country instead of a city), browse our packages, or just ask a real planner.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/packages"
                className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-tat-charcoal text-white text-[13px] font-semibold"
              >
                Browse all packages
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href={`https://wa.me/918115999588?text=${encodeURIComponent(`Hi! I'm searching for "${q}" but couldn't find a match. Can you help?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-whatsapp hover:bg-whatsapp-deep text-white text-[13px] font-semibold transition-colors"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                Ask a planner
              </a>
            </div>

            <div className="mt-10 max-w-md mx-auto text-left">
              <p className="text-[11px] uppercase tracking-wider text-tat-charcoal/45 mb-3">Try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_DESTINATIONS.slice(0, 6).map(({ emoji, label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-tat-cream-warm/40 border border-tat-charcoal/10 text-tat-charcoal text-[13px] hover:border-tat-gold"
                  >
                    <span aria-hidden>{emoji}</span>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results — grouped by type */}
        {q && visibleCount > 0 && (
          <div className="space-y-12">
            {visiblePackages.length > 0 && (
              <Group title="Packages" icon={PackageIcon} count={visiblePackages.length}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {visiblePackages.map((r) => <ResultCard key={`${r.type}-${r.slug}`} r={r} />)}
                </div>
              </Group>
            )}
            {visibleDestinations.length > 0 && (
              <Group title="Destinations" icon={MapPin} count={visibleDestinations.length}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {visibleDestinations.map((r) => <ResultCard key={`${r.type}-${r.slug}`} r={r} />)}
                </div>
              </Group>
            )}
            {visiblePosts.length > 0 && (
              <Group title="Journal articles" icon={BookOpen} count={visiblePosts.length}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {visiblePosts.map((r) => <ResultCard key={`${r.type}-${r.slug}`} r={r} />)}
                </div>
              </Group>
            )}

            {/* Closing CTA — converts dead-end browsers */}
            <div className="rounded-3xl bg-gradient-to-br from-tat-cream-warm/60 via-tat-paper to-tat-cream-warm/30 ring-1 ring-tat-gold/25 p-6 md:p-8 mt-6">
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-tat-gold inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Don&rsquo;t see what you want?
              </p>
              <h3 className="mt-2 font-display text-[20px] md:text-[24px] font-medium text-tat-charcoal leading-tight text-balance">
                Tell a real planner what you&rsquo;re after.{" "}
                <span className="italic font-display font-light text-tat-gold">
                  Free quote in 24 hours.
                </span>
              </h3>
              <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                <Link
                  href="/customize-trip"
                  className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-tat-teal hover:bg-tat-teal-deep text-white text-[13px] font-semibold"
                >
                  Plan a custom trip
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`https://wa.me/918115999588?text=${encodeURIComponent(`Hi! I'm searching for "${q}" — can you help me find the right trip?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-whatsapp hover:bg-whatsapp-deep text-white text-[13px] font-semibold transition-colors"
                >
                  <MessageCircle className="h-4 w-4 fill-white" />
                  WhatsApp the team
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Group({
  title, icon: Icon, count, children,
}: {
  title: string;
  icon: typeof PackageIcon;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="font-display text-[22px] md:text-[26px] font-medium text-tat-charcoal inline-flex items-center gap-2.5">
          <Icon className="h-5 w-5 text-tat-gold" />
          {title}
          <span className="text-[12px] font-normal text-tat-charcoal/45 font-sans">
            ({count})
          </span>
        </h2>
      </div>
      {children}
    </section>
  );
}

function ResultCard({ r }: { r: NormalizedResult }) {
  const meta = TYPE_META[r.type];
  const Icon = meta.icon;
  return (
    <Link
      href={r.href}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-tat-charcoal/8 hover:border-tat-charcoal/20 hover:shadow-soft-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-tat-cream">
        {r.image ? (
          <Image
            src={r.image}
            alt={r.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full grid place-items-center">
            <Icon className="h-8 w-8 text-tat-charcoal/15" />
          </div>
        )}
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-[16px] md:text-[17px] font-medium text-tat-charcoal group-hover:text-tat-gold transition-colors leading-snug line-clamp-2">
          {r.title}
        </h3>
        <p className="mt-1.5 text-[12px] text-tat-charcoal/55 line-clamp-1">
          {r.sub}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-tat-gold group-hover:gap-1.5 transition-all">
          Open
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
