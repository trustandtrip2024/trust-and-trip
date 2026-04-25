import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Flame, Tag, Zap } from "lucide-react";
import { getOfferPackages } from "@/lib/sanity-queries";

function getEndDate(slug: string, days: number): string {
  const base = new Date();
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  base.setDate(base.getDate() + days + (hash % 5));
  return base.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const OFFER_META = [
  { tag: "Summer Sale", discount: 22, days: 3, hot: true },
  { tag: "Honeymoon Special", discount: 18, days: 7, hot: false },
  { tag: "Early Bird", discount: 25, days: 14, hot: false },
  { tag: "Flash Deal", discount: 12, days: 1, hot: true },
  { tag: "Group Bonanza", discount: 20, days: 5, hot: false },
  { tag: "Premium Escape", discount: 15, days: 10, hot: false },
  { tag: "Last Minute", discount: 22, days: 2, hot: true },
  { tag: "Seasonal Pick", discount: 16, days: 8, hot: false },
];

export default async function DashboardOffersPage() {
  const packages = await getOfferPackages();

  const offers = packages.map((p, i) => {
    const meta = OFFER_META[i % OFFER_META.length];
    return {
      ...p,
      discount: meta.discount,
      tag: meta.tag,
      hot: meta.hot,
      endsLabel: getEndDate(p.slug, meta.days),
      originalPrice: Math.round(p.price / (1 - meta.discount / 100)),
    };
  });

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-tat-charcoal/40 mb-1">Dashboard</p>
        <h1 className="font-display text-2xl font-medium text-tat-charcoal">Offers for You</h1>
        <p className="text-sm text-tat-charcoal/50 mt-1">Curated deals — updated daily just for members.</p>
      </div>

      {/* Banner */}
      <div className="bg-tat-gold/10 border border-tat-gold/20 rounded-2xl px-5 py-4 flex items-center gap-3 mb-6">
        <Zap className="h-5 w-5 text-tat-gold shrink-0" />
        <p className="text-sm text-tat-charcoal/80">
          <span className="font-semibold text-tat-charcoal">Members get priority access</span> — these rates are exclusive to logged-in users. Save up to 25% on select experiences.
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-10 text-center">
          <Tag className="h-10 w-10 text-tat-charcoal/20 mx-auto mb-3" />
          <p className="font-medium text-tat-charcoal">No offers available right now</p>
          <p className="text-sm text-tat-charcoal/45 mt-1">Check back soon for exclusive deals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <Link
              key={offer.slug}
              href={`/packages/${offer.slug}`}
              className="group bg-white rounded-2xl border border-tat-charcoal/8 hover:border-tat-charcoal/15 hover:shadow-soft overflow-hidden transition-all"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/50 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 bg-tat-gold text-tat-charcoal text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                    {offer.discount}% OFF
                  </span>
                  {offer.hot && (
                    <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                      <Flame className="h-2.5 w-2.5" />Hot
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] text-tat-paper/80 bg-tat-charcoal/50 backdrop-blur-sm px-2.5 py-1 rounded-full">{offer.tag}</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-display text-base font-medium text-tat-charcoal group-hover:text-tat-gold transition-colors line-clamp-2 mb-1.5">{offer.title}</h3>
                <div className="flex items-center gap-3 text-[11px] text-tat-charcoal/45 mb-3">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{offer.duration}</span>
                  <span className="flex items-center gap-1 text-red-500/70"><Clock className="h-3 w-3" />Ends {offer.endsLabel}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-tat-charcoal/35 line-through mb-0.5">₹{offer.originalPrice.toLocaleString("en-IN")}</p>
                    <p className="font-display text-lg text-tat-charcoal">₹{offer.price.toLocaleString("en-IN")}
                      <span className="text-xs text-tat-charcoal/45 font-sans ml-1">/ person</span>
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-tat-gold/10 group-hover:bg-tat-gold flex items-center justify-center transition-all">
                    <ArrowRight className="h-3.5 w-3.5 text-tat-charcoal" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
