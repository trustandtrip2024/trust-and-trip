"use client";

// In-page quote modal for the package detail sticky bar.
//
// Replaces the prior "Get free quote" CTA that pushed users to a full
// page navigation at /customize-trip?package=slug. That redirect lost
// scroll position, broke the sticky bar's inline conversion moment,
// and gave the user a fresh page to bounce from.
//
// This modal renders the same <LeadForm> in popup variant with the
// package context already filled in — so the user never leaves the
// detail page to send a quote request.

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import LeadForm from "@/components/LeadForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageTitle: string;
  packageSlug: string;
}

export default function PackageQuoteModal({
  open, onOpenChange, packageTitle, packageSlug,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-tat-charcoal/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-[min(560px,94vw)] max-h-[90vh] overflow-y-auto rounded-3xl bg-tat-paper dark:bg-tat-charcoal shadow-soft-lg focus:outline-none data-[state=open]:animate-slide-up-soft"
          aria-describedby={undefined}
        >
          {/* Heading row — matches the user-requested copy "Plan Your Trip"
              with a close affordance pinned to the right. */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-tat-charcoal/8 dark:border-white/10">
            <Dialog.Title className="font-display text-[20px] md:text-[22px] font-semibold text-tat-charcoal dark:text-tat-paper">
              Plan Your Trip
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="grid place-items-center h-9 w-9 rounded-full bg-tat-charcoal/6 hover:bg-tat-charcoal/12 dark:bg-white/10 dark:hover:bg-white/15 transition-colors"
              >
                <X className="h-4 w-4 text-tat-charcoal dark:text-tat-paper" />
              </button>
            </Dialog.Close>
          </div>

          <div className="px-5 md:px-6 py-5">
            <LeadForm
              variant="popup"
              title={`Customise the ${packageTitle} trip`}
              subtitle="Tell us what you'd like to change — hotels, pace, activities, dates. A real planner replies within 2 hours."
              ctaLabel="Send to a planner"
              packageContext={packageTitle}
              packageSlug={packageSlug}
              source="trip_planner"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
