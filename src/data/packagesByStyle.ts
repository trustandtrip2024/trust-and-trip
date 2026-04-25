// TODO: Wire to Sanity getPackagesByType. Placeholder until production data flows in.

import type { PackageCardProps } from "@/components/ui/PackageCard";

export type StyleId =
  | "Honeymoon" | "Family" | "Solo" | "Group"
  | "Adventure" | "Wellness" | "Pilgrim" | "Luxury";

const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?w=1600&q=75&auto=format&fit=crop`;

const make = (
  id: string,
  title: string,
  destination: string,
  travelStyle: string,
  duration: string,
  price: number,
  image: string,
  rating: number,
  count: number,
): PackageCardProps & { id: string; style: StyleId } => ({
  id,
  style: travelStyle as StyleId,
  image,
  title,
  href: `/packages/${id}`,
  destination,
  travelStyle,
  duration,
  rating,
  ratingCount: count,
  price,
  originalPrice: Math.round(price * 1.18),
  saveAmount: Math.round(price * 0.18),
  customizeHref: `/customize-trip?package=${id}`,
});

export const STYLE_PACKAGES: (PackageCardProps & { id: string; style: StyleId })[] = [
  // Honeymoon
  make("bali-honeymoon-7n8d",      "7N/8D Bali villa honeymoon",       "Bali",        "Honeymoon", "7N / 8D", 84000,  UNSPLASH("photo-1537996194471-e657df975ab4"), 4.9, 142),
  make("maldives-overwater-5n6d",  "5N/6D Maldives overwater retreat", "Maldives",    "Honeymoon", "5N / 6D", 245000, UNSPLASH("photo-1514282401047-d79a71a590e8"), 4.9, 86),
  make("santorini-romance-6n7d",   "6N/7D Santorini caldera romance",  "Greece",      "Honeymoon", "6N / 7D", 198000, UNSPLASH("photo-1570077188670-e3a8d69ac5ff"), 4.8, 64),
  make("kyoto-cherry-honeymoon",   "8N/9D Kyoto cherry blossom",       "Japan",       "Honeymoon", "8N / 9D", 168000, UNSPLASH("photo-1545569756-7e39db71a14e"), 4.8, 49),
  make("zanzibar-honeymoon",       "7N/8D Zanzibar shore honeymoon",   "Tanzania",    "Honeymoon", "7N / 8D", 142000, UNSPLASH("photo-1542640244-7e672d6cef4e"), 4.7, 38),
  make("kerala-houseboat-romance", "5N/6D Kerala houseboat romance",   "Kerala",      "Honeymoon", "5N / 6D", 56000,  UNSPLASH("photo-1602216056096-3b40cc0c9944"), 4.8, 121),

  // Family
  make("singapore-family-6n7d",    "6N/7D Singapore-Sentosa family",   "Singapore",   "Family",    "6N / 7D", 96000,  UNSPLASH("photo-1525625293386-3f8f99389edd"), 4.8, 156),
  make("kerala-family-7n8d",       "7N/8D Kerala family backwaters",   "Kerala",      "Family",    "7N / 8D", 78000,  UNSPLASH("photo-1602216056096-3b40cc0c9944"), 4.9, 188),
  make("dubai-family-5n6d",        "5N/6D Dubai theme-park family",    "Dubai",       "Family",    "5N / 6D", 112000, UNSPLASH("photo-1512453979798-5ea266f8880c"), 4.7, 134),
  make("switzerland-fam-9n10d",    "9N/10D Switzerland scenic family", "Switzerland", "Family",    "9N / 10D",195000, UNSPLASH("photo-1527668752968-14dc70a27c95"), 4.9, 92),
  make("thailand-fam-6n7d",        "6N/7D Thailand temples + beaches", "Thailand",    "Family",    "6N / 7D", 86000,  UNSPLASH("photo-1552465011-b4e21bf6e79a"), 4.8, 174),
  make("rajasthan-family-7n8d",    "7N/8D Rajasthan heritage family",  "Rajasthan",   "Family",    "7N / 8D", 64000,  UNSPLASH("photo-1590082773386-d19499f8c28e"), 4.8, 211),

  // Solo
  make("manali-solo-5n6d",         "5N/6D Manali solo trekker",        "Himachal",    "Solo",      "5N / 6D", 32000,  UNSPLASH("photo-1626621341517-bbf3d9990a23"), 4.7, 89),
  make("bali-solo-6n7d",           "6N/7D Bali solo discovery",        "Bali",        "Solo",      "6N / 7D", 58000,  UNSPLASH("photo-1537996194471-e657df975ab4"), 4.8, 76),
  make("ladakh-solo-7n8d",         "7N/8D Ladakh solo high-altitude",  "Ladakh",      "Solo",      "7N / 8D", 48000,  UNSPLASH("photo-1622308644420-b20142b1e4fc"), 4.9, 64),
  make("rishikesh-solo-4n5d",      "4N/5D Rishikesh solo riverside",   "Rishikesh",   "Solo",      "4N / 5D", 22000,  UNSPLASH("photo-1561361058-c24cecae35ca"), 4.6, 102),
  make("vietnam-solo-7n8d",        "7N/8D Vietnam solo north-to-south","Vietnam",     "Solo",      "7N / 8D", 64000,  UNSPLASH("photo-1525625293386-3f8f99389edd"), 4.7, 53),
  make("goa-solo-4n5d",            "4N/5D Goa solo coast",             "Goa",         "Solo",      "4N / 5D", 26000,  UNSPLASH("photo-1512343879784-a960bf40e7f2"), 4.6, 145),

  // Group
  make("thailand-group-7n8d",      "7N/8D Thailand group",             "Thailand",    "Group",     "7N / 8D", 88000,  UNSPLASH("photo-1552465011-b4e21bf6e79a"), 4.8, 67),
  make("bali-group-6n7d",          "6N/7D Bali group adventure",       "Bali",        "Group",     "6N / 7D", 76000,  UNSPLASH("photo-1537996194471-e657df975ab4"), 4.7, 58),
  make("dubai-group-5n6d",         "5N/6D Dubai group quick-fire",     "Dubai",       "Group",     "5N / 6D", 72000,  UNSPLASH("photo-1512453979798-5ea266f8880c"), 4.8, 41),
  make("vietnam-group-8n9d",       "8N/9D Vietnam group circuit",      "Vietnam",     "Group",     "8N / 9D", 92000,  UNSPLASH("photo-1525625293386-3f8f99389edd"), 4.7, 32),
  make("malaysia-group-6n7d",      "6N/7D Malaysia group",             "Malaysia",    "Group",     "6N / 7D", 64000,  UNSPLASH("photo-1596422846543-75c6fc197f07"), 4.6, 28),
  make("turkey-group-9n10d",       "9N/10D Turkey group balloon",      "Turkey",      "Group",     "9N / 10D",128000, UNSPLASH("photo-1541432901042-2d8bd64b4a9b"), 4.8, 24),

  // Adventure
  make("spiti-bike-9n10d",         "9N/10D Spiti Valley bike trip",    "Spiti Valley","Adventure", "9N / 10D",78000,  UNSPLASH("photo-1626621341517-bbf3d9990a23"), 4.9, 91),
  make("ladakh-trek-7n8d",         "7N/8D Markha Valley trek",         "Ladakh",      "Adventure", "7N / 8D", 64000,  UNSPLASH("photo-1622308644420-b20142b1e4fc"), 4.9, 58),
  make("uttarakhand-vof-6n7d",     "6N/7D Valley of Flowers + Hemkund","Uttarakhand", "Adventure", "6N / 7D", 42000,  UNSPLASH("photo-1561361058-c24cecae35ca"), 4.8, 71),
  make("manali-paragliding-5n6d",  "5N/6D Manali paragliding",         "Himachal",    "Adventure", "5N / 6D", 38000,  UNSPLASH("photo-1626621341517-bbf3d9990a23"), 4.7, 64),
  make("andaman-dive-6n7d",        "6N/7D Andaman PADI dive package",  "Andaman",     "Adventure", "6N / 7D", 86000,  UNSPLASH("photo-1586500036706-41963de24d8b"), 4.8, 49),
  make("zanskar-trek-8n9d",        "8N/9D Zanskar Valley trek",        "Ladakh",      "Adventure", "8N / 9D", 92000,  UNSPLASH("photo-1622308644420-b20142b1e4fc"), 4.9, 31),

  // Wellness
  make("kerala-wellness-7n8d",     "7N/8D Kerala wellness retreat",    "Kerala",      "Wellness",  "7N / 8D", 92000,  UNSPLASH("photo-1602216056096-3b40cc0c9944"), 4.9, 138),
  make("rishikesh-yoga-5n6d",      "5N/6D Rishikesh yoga retreat",     "Rishikesh",   "Wellness",  "5N / 6D", 38000,  UNSPLASH("photo-1561361058-c24cecae35ca"), 4.8, 102),
  make("bali-ubud-wellness",       "6N/7D Bali Ubud wellness",         "Bali",        "Wellness",  "6N / 7D", 78000,  UNSPLASH("photo-1537996194471-e657df975ab4"), 4.8, 67),
  make("ananda-himalayas",         "5N/6D Ananda in the Himalayas",    "Uttarakhand", "Wellness",  "5N / 6D", 158000, UNSPLASH("photo-1561361058-c24cecae35ca"), 4.9, 41),
  make("dharamkot-meditation",     "6N/7D Dharamkot meditation",       "Himachal",    "Wellness",  "6N / 7D", 42000,  UNSPLASH("photo-1626621341517-bbf3d9990a23"), 4.7, 38),
  make("coorg-wellness",           "5N/6D Coorg wellness escape",      "Coorg",       "Wellness",  "5N / 6D", 56000,  UNSPLASH("photo-1591080152067-b3e63c3b4c2c"), 4.8, 52),

  // Pilgrim
  make("uttarakhand-chardham-helicopter-5n6d", "5N/6D Char Dham by helicopter",        "Uttarakhand","Pilgrim", "5N / 6D", 220000, UNSPLASH("photo-1561361058-c24cecae35ca"), 4.9, 84),
  make("uttarakhand-kedarnath-heli-2n3d",      "2N/3D Kedarnath by helicopter",        "Uttarakhand","Pilgrim", "2N / 3D", 55000,  UNSPLASH("photo-1561361058-c24cecae35ca"), 4.9, 142),
  make("uttarakhand-dodham-road-6n7d",         "6N/7D Do Dham road yatra",             "Uttarakhand","Pilgrim", "6N / 7D", 35000,  UNSPLASH("photo-1561361058-c24cecae35ca"), 4.8, 96),
  make("uttarakhand-chardham-road-11n12d",     "11N/12D Char Dham complete road",      "Uttarakhand","Pilgrim", "11N / 12D",48000,  UNSPLASH("photo-1561361058-c24cecae35ca"), 4.8, 78),
  make("varanasi-spiritual-4n5d",              "4N/5D Varanasi spiritual retreat",     "Varanasi",   "Pilgrim", "4N / 5D", 26000,  UNSPLASH("photo-1561361058-c24cecae35ca"), 4.7, 64),
  make("amarnath-yatra-6n7d",                  "6N/7D Amarnath yatra",                 "Kashmir",    "Pilgrim", "6N / 7D", 38000,  UNSPLASH("photo-1561361058-c24cecae35ca"), 4.7, 47),

  // Luxury
  make("maldives-luxury-7n8d",     "7N/8D Maldives private-island luxury", "Maldives",   "Luxury",  "7N / 8D", 360000, UNSPLASH("photo-1514282401047-d79a71a590e8"), 4.9, 38),
  make("dubai-burj-luxury",        "5N/6D Dubai Burj-suite luxury",        "Dubai",      "Luxury",  "5N / 6D", 220000, UNSPLASH("photo-1512453979798-5ea266f8880c"), 4.9, 32),
  make("japan-ryokan-luxury",      "8N/9D Japan ryokan + Shinkansen lux",  "Japan",      "Luxury",  "8N / 9D", 285000, UNSPLASH("photo-1540959733332-eab4deabeeaf"), 4.9, 28),
  make("italy-amalfi-luxury",      "9N/10D Italy Amalfi coast luxury",     "Italy",      "Luxury",  "9N / 10D",340000, UNSPLASH("photo-1502602898657-3e91760cbb34"), 4.8, 24),
  make("singapore-marina-luxury",  "5N/6D Singapore Marina-Bay luxury",    "Singapore",  "Luxury",  "5N / 6D", 198000, UNSPLASH("photo-1525625293386-3f8f99389edd"), 4.8, 36),
  make("paris-eiffel-luxury",      "6N/7D Paris Eiffel-suite luxury",      "France",     "Luxury",  "6N / 7D", 260000, UNSPLASH("photo-1502602898657-3e91760cbb34"), 4.8, 31),
];
