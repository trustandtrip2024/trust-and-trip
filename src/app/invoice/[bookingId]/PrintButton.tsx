"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-meta px-3 py-1 rounded-pill bg-tat-orange text-white hover:bg-tat-orange/90"
    >
      Print / Save as PDF
    </button>
  );
}
