"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Users, CalendarDays, Search } from "lucide-react";
import { destinations } from "@/lib/data";

export default function SearchBar() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [travelType, setTravelType] = useState("");
  const [duration, setDuration] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (travelType) params.set("type", travelType);
    if (duration) params.set("duration", duration);
    router.push(`/packages?${params.toString()}`);
  };

  return (
    <div className="bg-cream/95 backdrop-blur-xl rounded-2xl md:rounded-full p-3 md:pr-3 md:pl-8 md:py-3 shadow-soft-lg border border-cream">
      <div className="grid md:grid-cols-[1.3fr_1fr_1fr_auto] gap-2 md:gap-0 md:divide-x md:divide-ink/10">
        {/* Destination */}
        <div className="flex items-center gap-3 px-4 py-3 md:py-2 group">
          <MapPin className="h-4 w-4 text-gold shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] uppercase tracking-wider text-ink/50 font-medium">
              Destination
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent text-sm text-ink outline-none cursor-pointer font-medium"
            >
              <option value="">Where to?</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}, {d.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Travel Type */}
        <div className="flex items-center gap-3 px-4 py-3 md:py-2 md:pl-6">
          <Users className="h-4 w-4 text-gold shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] uppercase tracking-wider text-ink/50 font-medium">
              Travel Type
            </label>
            <select
              value={travelType}
              onChange={(e) => setTravelType(e.target.value)}
              className="w-full bg-transparent text-sm text-ink outline-none cursor-pointer font-medium"
            >
              <option value="">Who's traveling?</option>
              <option value="Couple">Couple</option>
              <option value="Family">Family</option>
              <option value="Group">Group</option>
              <option value="Solo">Solo</option>
            </select>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-3 px-4 py-3 md:py-2 md:pl-6">
          <CalendarDays className="h-4 w-4 text-gold shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] uppercase tracking-wider text-ink/50 font-medium">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-transparent text-sm text-ink outline-none cursor-pointer font-medium"
            >
              <option value="">How long?</option>
              <option value="3-5">3 – 5 days</option>
              <option value="5-7">5 – 7 days</option>
              <option value="7-10">7 – 10 days</option>
              <option value="10+">10+ days</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="bg-ink hover:bg-gold text-cream hover:text-ink transition-all duration-300 rounded-xl md:rounded-full md:h-auto px-6 py-3.5 md:px-7 flex items-center justify-center gap-2 text-sm font-medium mt-1 md:mt-0 md:ml-2"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
    </div>
  );
}
