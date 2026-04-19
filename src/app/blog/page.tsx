import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/lib/data";
import { ArrowUpRight, Clock } from "lucide-react";

export const metadata = {
  title: "Journal — Trust and Trip",
  description: "Travel stories, guides, and perspectives from our planners and travelers.",
};

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      <section className="pt-28 md:pt-36 pb-12 bg-cream">
        <div className="container-custom max-w-5xl">
          <span className="eyebrow">Our Journal</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-3xl text-balance">
            Stories, guides,
            <span className="italic text-gold font-light"> and the road less planned.</span>
          </h1>
          <p className="mt-6 text-ink/60 max-w-xl leading-relaxed">
            Perspectives from our planners, reflections from our travelers, and the odd
            love letter to a destination.
          </p>
        </div>
      </section>

      {/* Featured post */}
      <section className="pb-12">
        <div className="container-custom">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid md:grid-cols-2 gap-8 md:gap-12 items-center bg-cream rounded-3xl overflow-hidden border border-ink/5"
          >
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full order-2 md:order-1 overflow-hidden">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <div className="p-6 md:p-12 order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] bg-gold/20 text-gold px-3 py-1 rounded-full">
                  {featured.category}
                </span>
                <span className="text-xs text-ink/50">Featured</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-medium leading-tight mb-4 text-balance group-hover:text-gold transition-colors">
                {featured.title}
              </h2>
              <p className="text-ink/60 leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-ink/50">
                <span>
                  {featured.author} · {featured.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {featured.readTime}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 md:py-16">
        <div className="container-custom grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-5">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-cream/95 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4 text-ink" />
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold">
                {post.category}
              </span>
              <h3 className="mt-2 font-display text-xl md:text-2xl font-medium leading-tight text-balance group-hover:text-gold transition-colors">
                {post.title}
              </h3>
              <p className="mt-3 text-sm text-ink/60 leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-ink/50">
                <span>{post.author}</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
