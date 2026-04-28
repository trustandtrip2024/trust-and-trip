// TODO: Wire to Sanity getDestinations + duration metadata.
// Placeholder: 4 entries per bucket × 4 buckets = 16 cards.

export type DurationId = "long-weekend" | "3-5" | "6-9" | "10+";

export type DestinationDurationItem = {
  id: string;
  name: string;
  region: string;
  country?: string;
  whisper: string;
  image: string;
  packageCount: number;
  priceFrom: number;
  href: string;
  durations: DurationId[];
};

const u = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=75&auto=format&fit=crop`;

export const DESTINATIONS_BY_DURATION: DestinationDurationItem[] = [
  // Long weekend
  { id: "goa",       name: "Goa",       region: "West India",  country: "India",       whisper: "Coast and chai, in equal measure.", image: u("photo-1512343879784-a960bf40e7f2"), packageCount: 24, priceFrom: 18000, href: "/destinations/goa",       durations: ["long-weekend", "3-5"] },
  { id: "rishikesh", name: "Rishikesh", region: "Uttarakhand", country: "India",       whisper: "Mountains and the river that runs through.", image: u("photo-1561361058-c24cecae35ca"), packageCount: 18, priceFrom: 14000, href: "/destinations/rishikesh", durations: ["long-weekend", "3-5"] },
  { id: "udaipur",   name: "Udaipur",   region: "Rajasthan",   country: "India",       whisper: "Lakes, palaces, evenings that stretch.",     image: u("photo-1599661046289-e31897846e41"), packageCount: 16, priceFrom: 22000, href: "/destinations/rajasthan", durations: ["long-weekend", "3-5"] },
  { id: "shimla",    name: "Shimla",    region: "Himachal",    country: "India",       whisper: "Pine, snow, slow trains.",                    image: u("photo-1626015365107-3a71e18c5268"), packageCount: 14, priceFrom: 16000, href: "/destinations/himachal-pradesh", durations: ["long-weekend", "3-5"] },

  // 3-5 day
  { id: "manali",    name: "Manali",    region: "Himachal",    country: "India",       whisper: "Where the road softens into snow.", image: u("photo-1626621341517-bbf3d9990a23"), packageCount: 22, priceFrom: 20000, href: "/destinations/manali",    durations: ["3-5", "6-9"] },
  { id: "andaman",   name: "Andaman",   region: "Bay of Bengal", country: "India",     whisper: "Reefs, white sand, slow boats.",   image: u("photo-1586500036706-41963de24d8b"), packageCount: 18, priceFrom: 35000, href: "/destinations/andaman",   durations: ["3-5", "6-9"] },
  { id: "kerala",    name: "Kerala",    region: "South India", country: "India",       whisper: "Slow water, slower mornings.",     image: u("photo-1602216056096-3b40cc0c9944"), packageCount: 28, priceFrom: 28000, href: "/destinations/kerala",    durations: ["3-5", "6-9"] },
  { id: "thailand",  name: "Thailand",  region: "Southeast Asia", country: "Thailand", whisper: "Temples, beaches, easy first international.", image: u("photo-1552465011-b4e21bf6e79a"), packageCount: 30, priceFrom: 35000, href: "/destinations/thailand",  durations: ["3-5", "6-9"] },

  // 6-9 day
  { id: "bali",      name: "Bali",      region: "Indonesia",   country: "Indonesia",   whisper: "Green, gentle, and full of surprises.",   image: u("photo-1537996194471-e657df975ab4"), packageCount: 32, priceFrom: 45000, href: "/destinations/bali",      durations: ["6-9"] },
  { id: "vietnam",   name: "Vietnam",   region: "Southeast Asia", country: "Vietnam",  whisper: "North to south, by night train.",         image: u("photo-1525625293386-3f8f99389edd"), packageCount: 18, priceFrom: 55000, href: "/destinations/vietnam",   durations: ["6-9", "10+"] },
  { id: "spiti",     name: "Spiti Valley", region: "Himachal", country: "India",      whisper: "Cold deserts and warm tea.",              image: u("photo-1626621341517-bbf3d9990a23"), packageCount: 12, priceFrom: 60000, href: "/destinations/himachal-pradesh", durations: ["6-9", "10+"] },
  { id: "ladakh",    name: "Ladakh",    region: "Himalayas",   country: "India",      whisper: "Where the road is half the holiday.",     image: u("photo-1589553416260-f586c8f1514f"), packageCount: 16, priceFrom: 30000, href: "/destinations/ladakh",    durations: ["6-9", "10+"] },

  // 10+ day
  { id: "switzerland", name: "Switzerland", region: "Central Europe", country: "Switzerland", whisper: "The Alps, on your terms.",        image: u("photo-1527668752968-14dc70a27c95"), packageCount: 22, priceFrom: 125000, href: "/destinations/switzerland", durations: ["10+"] },
  { id: "japan",       name: "Japan",       region: "East Asia",      country: "Japan",       whisper: "Old country, careful detail.",     image: u("photo-1540959733332-eab4deabeeaf"), packageCount: 16, priceFrom: 90000,  href: "/destinations/japan",       durations: ["10+"] },
  { id: "italy",       name: "Italy",       region: "Southern Europe",country: "Italy",       whisper: "Walls older than calendars.",      image: u("photo-1502602898657-3e91760cbb34"), packageCount: 14, priceFrom: 145000, href: "/destinations/italy",       durations: ["10+"] },
  { id: "newzealand",  name: "New Zealand", region: "Oceania",        country: "New Zealand", whisper: "Two islands, a thousand vistas.",  image: u("photo-1506905925346-21bda4d32df4"), packageCount: 12, priceFrom: 195000, href: "/destinations/new-zealand", durations: ["10+"] },
];
