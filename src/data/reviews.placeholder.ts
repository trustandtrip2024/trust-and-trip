// TODO: Replace with real review data once CMS is connected. Every entry below
// is marked __placeholder: true so it can be filtered out in production.
// DO NOT ship as live testimonial copy without replacing the body fields.

export type ReviewPlaceholder = {
  id: string;
  __placeholder: true;
  firstName: string;
  city: string;
  destination: string;
  bookedDate: string;   // ISO
  rating: number;
  body: string;
  photos?: string[];
};

export const REVIEWS_PLACEHOLDER: ReviewPlaceholder[] = [
  { id: "rv-1", __placeholder: true, firstName: "Traveler 1", city: "City",   destination: "Destination", bookedDate: "2026-02-01", rating: 5, body: "Review pending — awaiting CMS connection." },
  { id: "rv-2", __placeholder: true, firstName: "Traveler 2", city: "City",   destination: "Destination", bookedDate: "2026-01-20", rating: 5, body: "Review pending — awaiting CMS connection." },
  { id: "rv-3", __placeholder: true, firstName: "Traveler 3", city: "City",   destination: "Destination", bookedDate: "2026-01-12", rating: 5, body: "Review pending — awaiting CMS connection." },
  { id: "rv-4", __placeholder: true, firstName: "Traveler 4", city: "City",   destination: "Destination", bookedDate: "2025-12-28", rating: 5, body: "Review pending — awaiting CMS connection." },
  { id: "rv-5", __placeholder: true, firstName: "Traveler 5", city: "City",   destination: "Destination", bookedDate: "2025-12-10", rating: 5, body: "Review pending — awaiting CMS connection." },
  { id: "rv-6", __placeholder: true, firstName: "Traveler 6", city: "City",   destination: "Destination", bookedDate: "2025-11-22", rating: 5, body: "Review pending — awaiting CMS connection." },
  { id: "rv-7", __placeholder: true, firstName: "Traveler 7", city: "City",   destination: "Destination", bookedDate: "2025-11-04", rating: 5, body: "Review pending — awaiting CMS connection." },
  { id: "rv-8", __placeholder: true, firstName: "Traveler 8", city: "City",   destination: "Destination", bookedDate: "2025-10-16", rating: 5, body: "Review pending — awaiting CMS connection." },
];
