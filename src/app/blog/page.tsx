export const revalidate = 60;

import { getBlogPosts } from "@/lib/sanity-queries";
import { blogPosts as staticPosts } from "@/lib/data";
import NewsletterInline from "@/components/NewsletterInline";
import JsonLd from "@/components/JsonLd";
import BlogBrowser from "@/components/blog/BlogBrowser";

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

  const rawPosts = await getBlogPosts().catch(() => []);
  const posts = normalizePosts(rawPosts.length > 0 ? rawPosts : staticPosts);

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];

  // Blog index ItemList — surfaces the article catalogue to search engines
  // independent of the active category filter. Caps at 50 entries.
  const listLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Trust and Trip — Journal",
    url: "https://trustandtrip.com/blog",
    blogPost: posts.slice(0, 50).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `https://trustandtrip.com/blog/${p.slug}`,
      ...(p.image ? { image: p.image } : {}),
      datePublished: p.date,
      author: { "@type": "Person", name: p.author },
    })),
  };

  return (
    <>
      <JsonLd data={listLd} />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-8 bg-tat-paper border-b border-tat-charcoal/5">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="eyebrow">Our Journal</span>
              <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-3xl text-balance">
                Stories, guides,
                <span className="italic text-tat-gold font-light"> and the road less planned.</span>
              </h1>
              <p className="mt-3 text-tat-charcoal/55 text-sm md:text-base max-w-xl leading-relaxed">
                Real planner notes, destination deep-dives, and the small details that make a trip click.
              </p>
            </div>
            <p className="text-tat-charcoal/50 text-sm leading-relaxed md:text-right shrink-0">
              {posts.length} articles · Updated weekly
            </p>
          </div>
        </div>
      </section>

      <BlogBrowser
        posts={posts}
        categories={categories}
        activeCategory={activeCategory}
        totalCount={posts.length}
      />

      {/* Newsletter */}
      <section className="pb-16 md:pb-20">
        <div className="container-custom max-w-2xl">
          <NewsletterInline />
        </div>
      </section>
    </>
  );
}
