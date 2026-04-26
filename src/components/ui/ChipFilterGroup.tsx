"use client";

import type { LucideIcon } from "lucide-react";

export interface ChipDef {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface Props {
  chips: ChipDef[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}

export default function ChipFilterGroup({ chips, activeId, onChange, ariaLabel }: Props) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap snap-x snap-mandatory md:snap-none pb-1"
    >
      {chips.map(({ id, label, icon: Icon }) => {
        const active = activeId === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(id)}
            className={`tt-chip shrink-0 snap-start ${active ? "tt-chip--active" : ""}`}
          >
            {Icon && <Icon />}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
