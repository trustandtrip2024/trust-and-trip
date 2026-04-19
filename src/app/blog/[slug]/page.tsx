import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/lib/data";
import { Clock, ChevronRight, ArrowRight } from "lucide-react";
import CTASection from "@/components/CTASection";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — Trust and Trip`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-8 bg-cream">
        <div className="container-custom max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-ink/60 mb-6">
            <Link href="/" className="hover:text-gold">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-gold">Journal</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gold">{post.category}</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold">
            {post.category}
          </span>
          <h1 className="mt-4 font-display text-display-md font-medium leading-[1.05] text-balance">
            {post.title}
          </h1>
          <div className="mt-6 flex items-center gap-4 text-sm text-ink/60">
            <span>{post.author}</span>
            <span className="text-ink/20">·</span>
            <span>{post.date}</span>
            <span className="text-ink/20">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* Hero image */}
      <section className="pb-12">
        <div className="container-custom max-w-5xl">
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="pb-16">
        <div className="container-custom max-w-2xl">
          <p className="font-display text-2xl md:text-3xl italic font-light leading-snug text-ink/80 mb-10 text-balance">
            {post.excerpt}
          </p>

          <div className="prose-travel space-y-6 text-lg leading-relaxed">
            <p>{post.content}</p>
            <p>
              Travel, at its best, is a practice of attention. It's waking up before your hotel
              offers breakfast because the light at dawn is different than the light at nine. It's
              letting your plan unravel because the person at the bakery mentioned a village you'd
              never heard of.
            </p>
            <p>
              We write this journal because we believe stories shape trips as much as maps do. The
              more deeply you know a place before you arrive, the more generously it reveals itself.
            </p>
            <blockquote className="border-l-4 border-gold pl-6 italic font-display text-2xl text-ink my-8">
              "A good journey is one you can't quite describe when you return — only feel."
            </blockquote>
            <p>
              If this piece nudges you toward a place you've been dreaming about, we'd love to help
              you get there — in the right way, for you.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-ink/10 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-ink hover:text-gold transition-colors group"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              Back to Journal
            </Link>
            <Link
              href="/customize-trip"
              className="btn-gold !py-2.5 !px-5 !text-xs"
            >
              Plan a trip inspired by this
            </Link>
          </div>
        </div>
      </article>

      {/* Related */}
      <section className="py-16 md:py-20 bg-sand/40">
        <div className="container-custom">
          <h3 className="font-display text-3xl md:text-4xl font-medium mb-10 text-balance">
            Keep reading
          </h3>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-4">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold">
                  {p.category}
                </span>
                <h4 className="mt-2 font-display text-xl font-medium group-hover:text-gold transition-colors leading-tight text-balance">
                  {p.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
