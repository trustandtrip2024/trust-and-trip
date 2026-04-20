"use client";

import { MapPin, Users, CalendarDays, Search } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

export default function SearchBar() {
  const { open } = useTripPlanner();

  return (
    <button
      onClick={() => open()}
      className="w-full text-left bg-cream/95 backdrop-blur-xl rounded-2xl md:rounded-full shadow-soft-lg border border-cream hover:shadow-[0_8px_40px_-8px_rgba(11,28,44,0.25)] transition-all duration-300 group"
      aria-label="Open trip planner"
    >
      <div className="grid md:grid-cols-[1.3fr_1fr_1fr_auto] gap-0">
        {/* Destination */}
        <div className="flex items-center gap-3 px-5 py-4 md:py-3 border-b md:border-b-0 md:border-r border-ink/8">
          <MapPin className="h-4 w-4 text-gold shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink/50 font-medium">Destination</p>
            <p className="text-sm font-medium text-ink/70 group-hover:text-ink transition-colors">Where to?</p>
          </div>
        </div>

        {/* Travel Type */}
        <div className="flex items-center gap-3 px-5 py-4 md:py-3 md:pl-5 border-b md:border-b-0 md:border-r border-ink/8">
          <Users className="h-4 w-4 text-gold shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink/50 font-medium">Travel Type</p>
            <p className="text-sm font-medium text-ink/70 group-hover:text-ink transition-colors">Who&apos;s traveling?</p>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-3 px-5 py-4 md:py-3 md:pl-5">
          <CalendarDays className="h-4 w-4 text-gold shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink/50 font-medium">Duration</p>
            <p className="text-sm font-medium text-ink/70 group-hover:text-ink transition-colors">How long?</p>
          </div>
        </div>

        {/* Search button */}
        <div className="px-3 py-3 flex items-center justify-center">
          <div className="bg-ink group-hover:bg-gold text-cream group-hover:text-ink transition-all duration-300 rounded-xl md:rounded-full px-5 py-3 md:px-6 flex items-center gap-2 text-sm font-medium w-full md:w-auto justify-center">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </div>
        </div>
      </div>
    </button>
  );
}
