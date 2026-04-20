"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface TripSelections {
  destination: string;
  destinationName: string;
  travelType: string;
  month: string;
  duration: string;
  budget: string;
}

const EMPTY: TripSelections = {
  destination: "",
  destinationName: "",
  travelType: "",
  month: "",
  duration: "",
  budget: "",
};

interface Ctx {
  isOpen: boolean;
  selections: TripSelections;
  open: (preset?: Partial<TripSelections>) => void;
  close: () => void;
  update: (patch: Partial<TripSelections>) => void;
}

const TripPlannerContext = createContext<Ctx | null>(null);

export function TripPlannerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selections, setSelections] = useState<TripSelections>(EMPTY);

  const open = (preset: Partial<TripSelections> = {}) => {
    setSelections((s) => ({ ...s, ...preset }));
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const update = (patch: Partial<TripSelections>) =>
    setSelections((s) => ({ ...s, ...patch }));

  return (
    <TripPlannerContext.Provider value={{ isOpen, selections, open, close, update }}>
      {children}
    </TripPlannerContext.Provider>
  );
}

export function useTripPlanner() {
  const ctx = useContext(TripPlannerContext);
  if (!ctx) throw new Error("useTripPlanner must be within TripPlannerProvider");
  return ctx;
}
