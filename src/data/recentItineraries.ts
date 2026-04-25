// TODO: wire to live data source. Until then, fictional placeholder entries.
// The structure mirrors what the production booking/itinerary feed will expose.

export type RecentItinerary = {
  id: string;
  firstName: string;
  city: string;
  timeAgo: string;
  tripStyle: "Honeymoon" | "Family" | "Solo" | "Group" | "Pilgrim" | "Luxury" | "Adventure";
  priceBucket: "under-50k" | "50k-1.5l" | "1.5l-2.5l" | "luxury" | "yatra" | "honeymoon";
  nights: number;
  primaryDestination: string;
  otherDestinationsCount: number;
  price: number;
  plannerName: string;
  href: string;
};

export const RECENT_ITINERARIES: RecentItinerary[] = [
  { id: "ri-1",  firstName: "Aanya",   city: "Mumbai",     timeAgo: "2 hours ago",  tripStyle: "Honeymoon", priceBucket: "honeymoon", nights: 7, primaryDestination: "Bali",        otherDestinationsCount: 2, price: 84000,  plannerName: "Riya Sharma",  href: "/packages?recent=ri-1" },
  { id: "ri-2",  firstName: "Vikram",  city: "Bengaluru",  timeAgo: "4 hours ago",  tripStyle: "Family",    priceBucket: "1.5l-2.5l", nights: 9, primaryDestination: "Switzerland", otherDestinationsCount: 3, price: 195000, plannerName: "Kabir Mehra",  href: "/packages?recent=ri-2" },
  { id: "ri-3",  firstName: "Sneha",   city: "Delhi",      timeAgo: "6 hours ago",  tripStyle: "Pilgrim",   priceBucket: "yatra",      nights: 5, primaryDestination: "Kedarnath",   otherDestinationsCount: 1, price: 58000,  plannerName: "Ananya Pillai", href: "/packages?recent=ri-3" },
  { id: "ri-4",  firstName: "Rohan",   city: "Hyderabad",  timeAgo: "9 hours ago",  tripStyle: "Adventure", priceBucket: "50k-1.5l",  nights: 6, primaryDestination: "Spiti Valley",otherDestinationsCount: 0, price: 72000,  plannerName: "Tara Iyer",    href: "/packages?recent=ri-4" },
  { id: "ri-5",  firstName: "Priya",   city: "Pune",       timeAgo: "12 hours ago", tripStyle: "Honeymoon", priceBucket: "luxury",    nights: 6, primaryDestination: "Maldives",    otherDestinationsCount: 0, price: 245000, plannerName: "Riya Sharma",  href: "/packages?recent=ri-5" },
  { id: "ri-6",  firstName: "Aditya",  city: "Chennai",    timeAgo: "1 day ago",    tripStyle: "Solo",      priceBucket: "under-50k", nights: 5, primaryDestination: "Manali",      otherDestinationsCount: 1, price: 32000,  plannerName: "Devika Bose",  href: "/packages?recent=ri-6" },
  { id: "ri-7",  firstName: "Meera",   city: "Kolkata",    timeAgo: "1 day ago",    tripStyle: "Family",    priceBucket: "50k-1.5l",  nights: 8, primaryDestination: "Kerala",      otherDestinationsCount: 2, price: 96000,  plannerName: "Kabir Mehra",  href: "/packages?recent=ri-7" },
  { id: "ri-8",  firstName: "Kabir",   city: "Ahmedabad",  timeAgo: "2 days ago",   tripStyle: "Group",     priceBucket: "50k-1.5l",  nights: 7, primaryDestination: "Thailand",    otherDestinationsCount: 2, price: 88000,  plannerName: "Ananya Pillai", href: "/packages?recent=ri-8" },
  { id: "ri-9",  firstName: "Ishaan",  city: "Jaipur",     timeAgo: "2 days ago",   tripStyle: "Pilgrim",   priceBucket: "yatra",      nights: 6, primaryDestination: "Char Dham",   otherDestinationsCount: 3, price: 62000,  plannerName: "Devika Bose",  href: "/packages?recent=ri-9" },
  { id: "ri-10", firstName: "Tara",    city: "Lucknow",    timeAgo: "3 days ago",   tripStyle: "Honeymoon", priceBucket: "1.5l-2.5l", nights: 8, primaryDestination: "Japan",       otherDestinationsCount: 3, price: 168000, plannerName: "Tara Iyer",    href: "/packages?recent=ri-10" },
  { id: "ri-11", firstName: "Rahul",   city: "Indore",     timeAgo: "3 days ago",   tripStyle: "Family",    priceBucket: "50k-1.5l",  nights: 6, primaryDestination: "Singapore",   otherDestinationsCount: 1, price: 78000,  plannerName: "Riya Sharma",  href: "/packages?recent=ri-11" },
  { id: "ri-12", firstName: "Neha",    city: "Surat",      timeAgo: "4 days ago",   tripStyle: "Luxury",    priceBucket: "luxury",    nights: 7, primaryDestination: "Dubai",       otherDestinationsCount: 0, price: 220000, plannerName: "Kabir Mehra",  href: "/packages?recent=ri-12" },
];
