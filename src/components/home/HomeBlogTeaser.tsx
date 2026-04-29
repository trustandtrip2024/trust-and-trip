import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { SanityBlogPost } from "@/lib/sanity-queries";

interface FallbackPost { title: string; slug: string; excerpt: string; image: string; readTime: string; category: string }

const FALLBACK: FallbackPost[] = [
  {
    title: "Bali in 7 days, without doing the same Bali everyone does",
    slug: "bali-7-days-uncrowded",
    excerpt:
      "Skip Kuta. Skip Seminyak after 7 PM. Here's the route the planner sent her own sister — Sidemen, Munduk, and the warung in Amed where the rice is best.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=70",
    readTime: "9 min read",
    category: "Destination guide",
  },
  {
    title: "Char Dham by helicopter: what nobody tells you before you go",
    slug: "char-dham-helicopter-honest",
    excerpt:
      "What the brochure leaves out — weight limits, weather holds, what to pack for ₹2 lakh seats and the four temples that ask different things from you.",
    image: "https://images.unsplash.com/photo-1591018533362-4c2dffb6c63b?w=1200&q=70",
    readTime: "11 min read",
    category: "Pilgrim",
  },
  {
    title: "Schengen visas in 2026 — the only checklist you need",
    slug: "schengen-visa-2026-checklist",
    excerpt:
      "Appointments, ITRs, cover letters, proof of funds. The real timeline, the real refusal reasons, and the one document most travel agents forget.",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=70",
    readTime: "7 min read",
    category: "Travel tips",
  },
];

interface Props {
  posts?: SanityBlogPost[];
}

export default function HomeBlogTeaser({ posts }: Props = {}) {
  const useStatic = !posts || posts.length === 0;

  return (
    <section id="guides" aria-labelledby="guides-title" className="py-16 md:py-24 bg-tat-cream-warm/40 dark:bg-tat-charcoal/95">
      <div className="container-custom">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8 md:mb-12">
          <SectionHeader
            eyebrow="From the journal"
            title="Travel guides"
            italicTail="written by people who've been there."
            lede="Honest, planner-written notes on destinations, visas and what's actually worth your time."
          />
          <Link
            href="/blog"
            className="hidden md:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold dark:text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            All guides
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Single horizontal rail at every breakpoint — replaces the
            md:grid-cols-3 layout so blog cards line up vertically with
            the other home rails (78/48/32/24). */}
        <div className="-mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
          <ul className="flex w-max gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0">
            {useStatic
              ? FALLBACK.map((p) => (
                  <li key={p.slug} className="shrink-0 snap-start w-[78%] sm:w-[48%] md:w-[32%] lg:w-[24%]">
                    <BlogCardStatic post={p} />
                  </li>
                ))
              : posts.slice(0, 6).map((p) => (
                  <li key={p.slug} className="shrink-0 snap-start w-[78%] sm:w-[48%] md:w-[32%] lg:w-[24%]">
                    <BlogCardSanity post={p} />
                  </li>
                ))}
          </ul>
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold dark:text-tat-gold hover:underline underline-offset-4"
          >
            All guides
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlogCardStatic({ post }: { post: FallbackPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="tt-card group block h-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2">
      <div className="relative aspect-[4/3] bg-tat-charcoal/15 overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          quality={70}
          className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
        <span className="absolute top-3 left-3 inline-flex items-center bg-white/95 text-tat-charcoal text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-pill">
          {post.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display font-normal text-h3 text-tat-charcoal dark:text-tat-paper leading-snug text-balance line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-3 text-body-sm text-tat-slate dark:text-tat-paper/75 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between text-meta text-tat-slate/80">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-tat-gold" />
            {post.readTime}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-tat-gold dark:text-tat-gold">
            Read
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function BlogCardSanity({ post }: { post: SanityBlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="tt-card group block h-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2">
      <div className="relative aspect-[4/3] bg-tat-charcoal/15 overflow-hidden">
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={70}
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        )}
        {post.category && (
          <span className="absolute top-3 left-3 inline-flex items-center bg-white/95 text-tat-charcoal text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-pill">
            {post.category}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display font-normal text-h3 text-tat-charcoal dark:text-tat-paper leading-snug text-balance line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-3 text-body-sm text-tat-slate dark:text-tat-paper/75 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between text-meta text-tat-slate/80">
          {post.readTime && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-tat-gold" />
              {post.readTime}
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-semibold text-tat-gold dark:text-tat-gold">
            Read
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
