"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Search, X } from "lucide-react";

interface Post {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
  tags: string[];
}

interface Props {
  posts: Post[];
  categories: string[];
  activeCategory: string;
  totalCount: number;
}

export default function BlogBrowser({
  posts, categories, activeCategory: initialCategory, totalCount,
}: Props) {
  const sp = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Hydrate the active category from the URL on the client. Server-side
  // we deliberately default to "All" so the page can be statically
  // pre-rendered (reading searchParams in the page would force dynamic
  // rendering and break ISR for the route).
  useEffect(() => {
    const cat = sp.get("category");
    if (cat) setActiveCategory(cat);
  }, [sp]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (!q) return true;
      const blob = `${p.title} ${p.excerpt} ${p.category} ${(p.tags ?? []).join(" ")} ${p.author}`.toLowerCase();
      return blob.includes(q);
    });
  }, [posts, query, activeCategory]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-16 lg:top-20 z-30 bg-tat-paper/95 dark:bg-tat-charcoal/95 backdrop-blur-md border-b border-tat-charcoal/10 dark:border-white/10">
        <div className="container-custom py-3 md:py-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tat-charcoal/45 pointer-events-none" aria-hidden />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search journals — try 'Bali', 'honeymoon', 'monsoon'…"
              className="w-full h-10 md:h-11 pl-10 pr-9 rounded-full bg-tat-cream-warm/40 dark:bg-white/5 ring-1 ring-tat-charcoal/10 dark:ring-white/10 text-[14px] text-tat-charcoal dark:text-tat-paper placeholder:text-tat-charcoal/40 focus:outline-none focus:ring-2 focus:ring-tat-gold"
              aria-label="Search articles"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded-full hover:bg-tat-charcoal/8"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5 text-tat-charcoal/55" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={[
                  "shrink-0 inline-flex items-center h-8 px-3 rounded-full text-[12px] font-semibold transition-colors whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-tat-charcoal text-white"
                    : "bg-tat-cream-warm/40 dark:bg-white/5 text-tat-charcoal/70 dark:text-tat-paper/70 ring-1 ring-tat-charcoal/10 dark:ring-white/10 hover:bg-tat-charcoal/8",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result counter */}
      <div className="container-custom pt-6 md:pt-8">
        <p className="text-[12px] text-tat-charcoal/55">
          Showing <strong className="font-semibold text-tat-charcoal">{filtered.length}</strong> of {totalCount} articles
          {(query || activeCategory !== "All") && <span> · filtered</span>}
        </p>
      </div>

      {filtered.length === 0 ? (
        <section className="py-20">
          <div className="container-custom text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-tat-gold/10 grid place-items-center">
              <Search className="h-6 w-6 text-tat-gold" />
            </div>
            <h3 className="mt-4 font-display text-xl text-tat-charcoal">No journals match those filters.</h3>
            <p className="mt-1 text-[13px] text-tat-charcoal/60">Try a broader keyword or clear the category.</p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => { setQuery(""); setActiveCategory("All"); }}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-tat-charcoal text-white text-[13px] font-semibold"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Featured */}
          {featured && (
            <section className="py-8 md:py-10">
              <div className="container-custom">
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group grid md:grid-cols-[1.2fr_1fr] rounded-3xl overflow-hidden border border-tat-charcoal/8 bg-tat-paper hover:shadow-soft-lg transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                    {featured.image ? (
                      <Image
                        src={featured.image}
                        alt={featured.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 55vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-tat-cream" />
                    )}
                    <span className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.25em] bg-tat-gold text-tat-charcoal px-3 py-1.5 rounded-full font-semibold">
                      Featured
                    </span>
                  </div>
                  <div className="p-7 md:p-10 flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-tat-gold font-medium">{featured.category}</span>
                    <h2 className="mt-3 font-display text-h2 font-medium leading-tight text-balance group-hover:text-tat-gold transition-colors">
                      {featured.title}
                    </h2>
                    <p className="mt-4 text-tat-charcoal/60 text-sm leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-tat-charcoal/8 text-xs text-tat-charcoal/50">
                      <AuthorChip name={featured.author} />
                      <span className="text-tat-charcoal/20">·</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.readTime}</span>
                      <span className="text-tat-charcoal/20">·</span>
                      <span>{featured.date}</span>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-tat-charcoal group-hover:text-tat-gold transition-colors">
                      Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <section className="pb-14 md:pb-20">
              <div className="container-custom grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {rest.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-tat-charcoal/6 hover:shadow-soft-lg hover:border-tat-charcoal/15 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-tat-cream">
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider bg-tat-charcoal/70 backdrop-blur-sm text-tat-paper px-2.5 py-1 rounded-full">
          {post.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-lg font-medium leading-tight text-balance group-hover:text-tat-gold transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-tat-charcoal/55 line-clamp-2 leading-relaxed flex-1">{post.excerpt}</p>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-tat-charcoal/6 text-[11px] text-tat-charcoal/50">
          <AuthorChip name={post.author} compact />
          <span className="text-tat-charcoal/20">·</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
        </div>
      </div>
    </Link>
  );
}

function AuthorChip({ name, compact }: { name: string; compact?: boolean }) {
  const initials = name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      <span className={`shrink-0 ${compact ? "h-5 w-5 text-[8px]" : "h-6 w-6 text-[9px]"} rounded-full bg-tat-gold/20 text-tat-gold grid place-items-center font-semibold`}>
        {initials || "TT"}
      </span>
      <span className="font-medium text-tat-charcoal truncate">{name}</span>
    </span>
  );
}
