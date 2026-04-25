export const revalidate = 60;

import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/sanity-queries";
import { blogPosts as staticPosts } from "@/lib/data";
import { ArrowRight, Clock } from "lucide-react";
import NewsletterInline from "@/components/NewsletterInline";

export const metadata = {
  title: "Journal — Trust and Trip",
  description: "Travel stories, destination guides, and perspectives from our planners.",
  alternates: { canonical: "https://trustandtrip.com/blog" },
};

function normalizePosts(posts: any[]) {
  return posts.map((p) => ({
    _id: p._id ?? p.slug,
    title: p.title,
    slug: p.slug?.current ?? p.slug,
    category: p.category,
    excerpt: p.excerpt,
    image: p.image ?? "",
    author: p.author ?? "Trust and Trip",
    date: p.date ?? "",
    readTime: p.readTime ?? "",
    featured: p.featured ?? false,
    tags: p.tags ?? [],
  }));
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const activeCategory = searchParams?.category ?? "All";

  // Fetch from Sanity, fallback to static
  const rawPosts = await getBlogPosts(activeCategory !== "All" ? activeCategory : undefined).catch(() => []);
  const posts = normalizePosts(rawPosts.length > 0 ? rawPosts : staticPosts);

  const ALL_CATEGORIES = ["All", ...Array.from(new Set([...rawPosts, ...staticPosts].map((p: any) => p.category)))];

  const [featured, ...rest] = posts;

  return (
    <>
      <section className="pt-28 md:pt-36 pb-10 bg-tat-paper border-b border-tat-charcoal/5">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="eyebrow">Our Journal</span>
              <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-3xl text-balance">
                Stories, guides,
                <span className="italic text-tat-gold font-light"> and the road less planned.</span>
              </h1>
            </div>
            <p className="text-tat-charcoal/50 text-sm max-w-xs leading-relaxed md:text-right">
              {posts.length} articles · Updated weekly
            </p>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 mt-8 overflow-x-auto no-scrollbar pb-1">
            {ALL_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                  activeCategory === cat
                    ? "bg-tat-charcoal text-tat-paper border-tat-charcoal"
                    : "bg-white border-tat-charcoal/10 text-tat-charcoal/60 hover:border-tat-charcoal/30 hover:text-tat-charcoal"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured post */}
      {featured && (
        <section className="py-10 md:py-12">
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
                <h2 className="mt-3 font-display text-2xl md:text-3xl font-medium leading-tight text-balance group-hover:text-tat-gold transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-4 text-tat-charcoal/60 text-sm leading-relaxed line-clamp-3">{featured.excerpt}</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-tat-charcoal/8 text-xs text-tat-charcoal/50">
                  <span>{featured.author}</span>
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

      {/* Post grid */}
      {rest.length > 0 && (
        <section className="pb-14 md:pb-20">
          <div className="container-custom grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {rest.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="pb-16 md:pb-20">
        <div className="container-custom max-w-2xl">
          <NewsletterInline />
        </div>
      </section>
    </>
  );
}

function PostCard({ post }: { post: ReturnType<typeof normalizePosts>[0] }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-tat-charcoal/6 hover:shadow-soft-lg transition-all duration-300"
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
        <h3 className="font-display text-lg font-medium leading-tight text-balance group-hover:text-tat-gold transition-colors line-clamp-2 flex-1">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-tat-charcoal/55 line-clamp-2 leading-relaxed">{post.excerpt}</p>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-tat-charcoal/6 text-[11px] text-tat-charcoal/40">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
          <span className="text-tat-charcoal/20">·</span>
          <span>{post.date}</span>
        </div>
      </div>
    </Link>
  );
}
