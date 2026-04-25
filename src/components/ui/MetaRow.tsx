import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}

export default function MetaRow({ icon: Icon, label, value, hint }: Props) {
  return (
    <div className="tt-meta">
      <span className="tt-meta-ico"><Icon /></span>
      <div className="min-w-0">
        <p className="tt-meta-lbl">{label}</p>
        <p className="tt-meta-val">{value}</p>
        {hint && <p className="text-[12px] text-stone-500 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}
