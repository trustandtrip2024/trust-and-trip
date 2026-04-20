import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ComparePackage {
  slug: string;
  title: string;
  image: string;
  price: number;
  duration: string;
  rating?: number;
  reviews?: number;
  destinationName?: string;
  travelType?: string;
  highlights?: string[];
  inclusions?: string[];
}

interface WishlistStore {
  // Wishlist — stored as slugs
  wishlist: string[];
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;

  // Compare — up to 3 full package objects
  compareList: ComparePackage[];
  toggleCompare: (pkg: ComparePackage) => void;
  removeFromCompare: (slug: string) => void;
  isInCompare: (slug: string) => boolean;
  clearCompare: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlist: [],
      toggleWishlist: (slug) =>
        set((s) => ({
          wishlist: s.wishlist.includes(slug)
            ? s.wishlist.filter((x) => x !== slug)
            : [...s.wishlist, slug],
        })),
      isWishlisted: (slug) => get().wishlist.includes(slug),

      compareList: [],
      toggleCompare: (pkg) => {
        const { compareList } = get();
        if (compareList.find((p) => p.slug === pkg.slug)) {
          set({ compareList: compareList.filter((p) => p.slug !== pkg.slug) });
        } else if (compareList.length < 3) {
          set({ compareList: [...compareList, pkg] });
        }
      },
      removeFromCompare: (slug) =>
        set((s) => ({ compareList: s.compareList.filter((p) => p.slug !== slug) })),
      isInCompare: (slug) => get().compareList.some((p) => p.slug === slug),
      clearCompare: () => set({ compareList: [] }),
    }),
    {
      name: "ttp-wishlist",
      partialize: (s) => ({ wishlist: s.wishlist }), // only persist wishlist, not compare
    }
  )
);
