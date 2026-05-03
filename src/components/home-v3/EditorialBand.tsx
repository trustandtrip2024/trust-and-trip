import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { blogPosts as staticBlogPosts } from "@/lib/data";
import { getBlogPosts } from "@/lib/sanity-queries";

// Sanity-driven now (was static blogPosts). Falls back to the static list
// only if Sanity is empty so the band never renders broken. Cache-busted
// via the same _updatedAt suffix used elsewhere, so swapping a blog cover
// in Studio appears within the next ISR window.
export default async function EditorialBand() {
  const sanityPosts = await getBlogPosts().catch(() => []);
  const source = sanityPosts.length > 0 ? sanityPosts : staticBlogPosts;
  const posts = source.slice(0, 3);
  if (!posts.length) return null;

  return (
    <section
      id="journal"
      aria-labelledby="journal-title"
      className="py-12 md:py-16 bg-tat-paper dark:bg-tat-charcoal scroll-mt-28 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold inline-flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" />
              From the journal
            </p>
            <h2
              id="journal-title"
              className="mt-2 font-display font-normal text-[24px] md:text-[30px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Stories, guides, and{" "}
              <em className="not-italic font-display italic text-tat-gold">things worth knowing.</em>
            </h2>
            <p className="mt-3 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70 max-w-2xl">
              Long-form pieces our planners actually send to travelers. Visa rules, opening dates, packing lists, and the trips behind them.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            All journal posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-4 md:gap-5">
          <FeaturePost post={posts[0]} />
          {posts.slice(1).map((p) => (
            <SecondaryPost key={p.slug} post={p} />
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            All journal posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

type Post = (typeof staticBlogPosts)[number] & { excerpt?: string };

function FeaturePost({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      prefetch={false}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-white/[0.03] ring-1 ring-tat-charcoal/10 dark:ring-white/10 shadow-soft hover:shadow-soft-lg transition-shadow duration-300"
    >
      <div className="relative aspect-[16/10] lg:aspect-[16/11]">
        <Image
          src={post.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          quality={65}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/70 via-tat-charcoal/10 to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full bg-tat-gold text-tat-charcoal text-[10px] font-bold uppercase tracking-wider">
          {post.category}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-5 md:p-6">
        <h3 className="font-display font-medium text-[22px] md:text-[26px] leading-tight text-tat-charcoal dark:text-tat-paper line-clamp-3 group-hover:text-tat-gold transition-colors">
          {post.title}
        </h3>
        <p className="text-[14px] leading-relaxed text-tat-charcoal/70 dark:text-tat-paper/70 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-3 border-t border-tat-charcoal/10 dark:border-white/10 text-[11px] uppercase tracking-wider text-tat-charcoal/55 dark:text-tat-paper/55">
          <span>{post.author}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readTime}
          </span>
          <span aria-hidden className="ml-auto">→</span>
        </div>
      </div>
    </Link>
  );
}

function SecondaryPost({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      prefetch={false}
      className="group flex flex-col overflow-hidden rounded-2xl bg-tat-cream-warm/40 dark:bg-white/[0.03] ring-1 ring-tat-charcoal/8 dark:ring-white/10 hover:ring-tat-gold/30 transition-all"
    >
      <div className="relative aspect-[16/10]">
        <Image
          src={post.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 28vw"
          quality={55}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        <span className="absolute top-2.5 left-2.5 inline-flex items-center px-2 py-0.5 rounded-full bg-white/95 text-tat-charcoal text-[10px] font-bold uppercase tracking-wider">
          {post.category}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-4 md:p-5">
        <h3 className="font-display font-medium text-[16px] md:text-[18px] leading-snug text-tat-charcoal dark:text-tat-paper line-clamp-3 group-hover:text-tat-gold transition-colors">
          {post.title}
        </h3>
        <p className="mt-auto pt-2 text-[11px] uppercase tracking-wider text-tat-charcoal/50 dark:text-tat-paper/50 inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {post.readTime}
        </p>
      </div>
    </Link>
  );
}
