export const revalidate = 60;
export const dynamicParams = true;

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBlogPostBySlug, getAllBlogSlugs, getBlogPosts } from "@/lib/sanity-queries";
import { blogPosts as staticPosts } from "@/lib/data";
import { Clock, ChevronRight, ArrowRight, Tag } from "lucide-react";
import CTASection from "@/components/CTASection";
import NewsletterInline from "@/components/NewsletterInline";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const sanitySlugss = await getAllBlogSlugs().catch(() => []);
  const staticSlugs = staticPosts.map((p) => p.slug);
  return [...new Set([...sanitySlugss, ...staticSlugs])].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug).catch(() => null)
    ?? staticPosts.find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — Trust and Trip`,
    description: post.excerpt,
    openGraph: {
      title: post.title, description: post.excerpt,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
      type: "article",
      authors: [post.author],
    },
    alternates: { canonical: `https://trustandtrip.com/blog/${params.slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const sanityPost = await getBlogPostBySlug(params.slug).catch(() => null);
  const post = sanityPost ?? staticPosts.find((p) => p.slug === params.slug);
  if (!post) return notFound();

  const allPosts = await getBlogPosts().catch(() => staticPosts as any[]);
  const related = allPosts
    .filter((p: any) => (p.slug?.current ?? p.slug) !== params.slug)
    .slice(0, 3);

  const slug = (post as any).slug?.current ?? (post as any).slug;
  const image = (post as any).image ?? "";

  return (
    <>
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-8 bg-tat-paper">
        <div className="container-custom max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-tat-charcoal/60 mb-6">
            <Link href="/" className="hover:text-tat-gold">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-tat-gold">Journal</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-tat-gold truncate">{post.category}</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-tat-gold font-medium">{post.category}</span>
          <h1 className="mt-3 font-display text-display-md font-medium leading-[1.05] text-balance">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-tat-charcoal/50">
            <span className="font-medium text-tat-charcoal">{post.author}</span>
            <span className="text-tat-charcoal/20">·</span>
            <span>{post.date}</span>
            <span className="text-tat-charcoal/20">·</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{post.readTime}</span>
          </div>

          {/* Tags */}
          {(post as any).tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(post as any).tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-tat-gold/10 text-tat-charcoal/70 border border-tat-gold/20">
                  <Tag className="h-2.5 w-2.5 text-tat-gold" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cover image */}
      {image && (
        <section className="pb-10">
          <div className="container-custom max-w-5xl">
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden">
              <Image src={image} alt={post.title} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
            </div>
          </div>
        </section>
      )}

      {/* Article content + sidebar */}
      <div className="pb-16">
        <div className="container-custom grid lg:grid-cols-[1fr_280px] gap-12 items-start max-w-5xl">
          {/* Content */}
          <article>
            <p className="font-display text-xl md:text-2xl italic font-light leading-snug text-tat-charcoal/70 mb-8 text-balance border-l-4 border-tat-gold pl-6">
              {post.excerpt}
            </p>

            <div className="space-y-5 text-tat-charcoal/80 leading-relaxed text-base">
              {post.content.split("\n\n").map((para: string, i: number) => {
                if (para.startsWith('"') && para.endsWith('"')) {
                  return (
                    <blockquote key={i} className="border-l-4 border-tat-gold pl-6 italic font-display text-xl text-tat-charcoal/80 my-6">
                      {para}
                    </blockquote>
                  );
                }
                return <p key={i}>{para}</p>;
              })}
            </div>

            <div className="mt-10 pt-8 border-t border-tat-charcoal/10 flex items-center justify-between flex-wrap gap-4">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-tat-charcoal hover:text-tat-gold transition-colors group">
                <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
                Back to Journal
              </Link>
              <Link href="/customize-trip" className="btn-gold !py-2.5 !px-5 !text-xs">
                Plan a trip inspired by this
              </Link>
            </div>
          </article>

          {/* Sticky sidebar */}
          <aside className="lg:sticky lg:top-28 space-y-5">
            {/* Newsletter */}
            <div className="bg-tat-charcoal text-tat-paper rounded-2xl p-6">
              <p className="eyebrow text-tat-gold mb-2">Newsletter</p>
              <h3 className="font-display text-lg font-medium mb-3 text-balance">Get stories like this in your inbox</h3>
              <form action="/api/newsletter" method="POST" className="space-y-2">
                <input type="email" name="email" required placeholder="your@email.com"
                  className="w-full bg-tat-paper/10 border border-tat-paper/20 text-tat-paper placeholder:text-tat-paper/40 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-tat-gold" />
                <button type="submit"
                  className="w-full bg-tat-gold text-tat-charcoal text-sm font-semibold py-2.5 rounded-xl hover:bg-tat-gold/90 transition-colors">
                  Subscribe — Free
                </button>
              </form>
            </div>

            {/* Related posts */}
            <div className="bg-tat-paper rounded-2xl p-5 border border-tat-charcoal/6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-tat-charcoal/40 font-medium mb-4">More from the journal</p>
              <div className="space-y-4">
                {related.slice(0, 3).map((p: any) => {
                  const pSlug = p.slug?.current ?? p.slug;
                  return (
                    <Link key={pSlug} href={`/blog/${pSlug}`} className="flex gap-3 group">
                      <div className="relative h-14 w-16 rounded-xl overflow-hidden shrink-0 bg-tat-cream">
                        {(p.image) && <Image src={p.image} alt={p.title} fill className="object-cover" sizes="64px" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-tat-charcoal group-hover:text-tat-gold transition-colors line-clamp-2 leading-tight">{p.title}</p>
                        <p className="text-[10px] text-tat-charcoal/40 mt-1">{p.readTime}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-tat-gold/10 border border-tat-gold/20 rounded-2xl p-5">
              <p className="font-display text-base font-medium text-balance mb-2">Ready to plan your next trip?</p>
              <p className="text-xs text-tat-charcoal/60 mb-3">Talk to a planner — free consultation.</p>
              <Link href="/customize-trip" className="block text-center bg-tat-charcoal text-tat-paper text-xs font-medium py-2.5 rounded-xl hover:bg-tat-gold hover:text-tat-charcoal transition-colors">
                Get Free Itinerary
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Related posts grid */}
      {related.length > 0 && (
        <section className="py-14 bg-tat-cream/40">
          <div className="container-custom">
            <h3 className="font-display text-2xl font-medium mb-8">Keep reading</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((p: any) => {
                const pSlug = p.slug?.current ?? p.slug;
                return (
                  <Link key={pSlug} href={`/blog/${pSlug}`} className="group">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-tat-cream">
                      {p.image && <Image src={p.image} alt={p.title} fill sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-tat-gold">{p.category}</span>
                    <h4 className="mt-1 font-display text-lg font-medium group-hover:text-tat-gold transition-colors leading-tight line-clamp-2">{p.title}</h4>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </>
  );
}
