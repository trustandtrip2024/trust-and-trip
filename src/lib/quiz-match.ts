import type { Package } from "./data";

export type QuizTravelType = "Couple" | "Family" | "Group" | "Solo" | "Pilgrim";
export type QuizVibe = "Beach" | "Mountain" | "Culture" | "Spiritual" | "City";
export type QuizDuration = "3-5" | "6-9" | "10+";
export type QuizBudget = "lt50k" | "50-100k" | "100k+";

export interface QuizAnswers {
  travelType: QuizTravelType;
  vibe: QuizVibe;
  duration: QuizDuration;
  budget: QuizBudget;
}

const VIBE_DESTINATIONS: Record<QuizVibe, string[]> = {
  Beach: [
    "bali", "maldives", "andaman", "kerala", "lakshadweep", "goa",
    "sri-lanka", "phuket", "krabi", "mauritius", "seychelles",
  ],
  Mountain: [
    "switzerland", "kashmir", "himachal", "uttarakhand", "ladakh",
    "sikkim", "spiti-valley", "manali", "leh", "gangtok", "darjeeling",
    "shimla", "kasol", "mussoorie", "auli",
  ],
  Culture: [
    "rajasthan", "japan", "vietnam", "thailand", "varanasi", "agra",
    "udaipur", "jaipur", "jodhpur", "khajuraho", "hampi", "morocco",
    "egypt", "cambodia",
  ],
  Spiritual: [
    "char-dham", "uttarakhand", "varanasi", "rishikesh", "haridwar",
    "kedarnath", "badrinath", "amarnath", "tirupati", "ayodhya",
    "vaishno-devi", "kashi", "puri", "rameshwaram",
  ],
  City: [
    "dubai", "singapore", "london", "paris", "new-york", "hong-kong",
    "tokyo", "seoul", "istanbul", "bangkok", "kuala-lumpur",
  ],
};

function durationMatches(days: number, q: QuizDuration): boolean {
  if (q === "3-5") return days >= 3 && days <= 5;
  if (q === "6-9") return days >= 6 && days <= 9;
  return days >= 10;
}

function budgetMatches(price: number, q: QuizBudget): boolean {
  if (q === "lt50k") return price < 50000;
  if (q === "50-100k") return price >= 50000 && price <= 100000;
  return price > 100000;
}

function vibeMatches(slug: string, name: string, q: QuizVibe): boolean {
  const targets = VIBE_DESTINATIONS[q];
  const lowerSlug = slug.toLowerCase();
  const lowerName = name.toLowerCase();
  return targets.some((t) => lowerSlug.includes(t) || lowerName.includes(t));
}

export interface ScoredPackage {
  pkg: Package;
  score: number;
}

export function scorePackages(packages: Package[], answers: QuizAnswers): ScoredPackage[] {
  // Pilgrim is a separate tier — when chosen, restrict the pool to the
  // pilgrim category and skip vibe matching (yatra slugs share spiritual
  // destinations regardless).
  const pool =
    answers.travelType === "Pilgrim"
      ? packages.filter((p) => (p.categories ?? []).some((c) => c.toLowerCase().includes("pilgrim")) || p.travelType === "Solo")
      : packages.filter((p) => p.travelType === answers.travelType);

  const scoreOne = (pkg: Package): number => {
    let s = 0;
    if (answers.travelType !== "Pilgrim" && pkg.travelType === answers.travelType) s += 30;
    if (vibeMatches(pkg.destinationSlug, pkg.destinationName, answers.vibe)) s += 25;
    if (durationMatches(pkg.days, answers.duration)) s += 18;
    if (budgetMatches(pkg.price, answers.budget)) s += 18;
    if (pkg.rating >= 4.7) s += 5;
    if (pkg.featured) s += 4;
    if (pkg.trending) s += 3;
    return s;
  };

  return pool
    .map((pkg) => ({ pkg, score: scoreOne(pkg) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
