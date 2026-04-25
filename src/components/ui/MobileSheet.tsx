"use client";

import { Drawer } from "vaul";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidthClass?: string;
}

/**
 * Drawer on mobile (drag-to-dismiss, snap-points, native iOS feel).
 * Centered modal styling on md+ via Vaul's `direction="bottom"` + custom desktop classes.
 */
export default function MobileSheet({
  open,
  onClose,
  title,
  eyebrow,
  icon,
  children,
  maxWidthClass = "md:max-w-md",
}: Props) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-tat-charcoal/60 backdrop-blur-sm" />
        <Drawer.Content
          className={`fixed inset-x-0 bottom-0 z-[90] mt-24 flex h-auto max-h-[92vh] flex-col rounded-t-3xl bg-tat-paper outline-none md:inset-0 md:m-auto md:h-fit md:max-h-[88vh] md:w-full ${maxWidthClass} md:rounded-3xl md:shadow-soft-lg`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Drag handle (mobile only) */}
          <div className="mx-auto mt-2 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-tat-charcoal/15 md:hidden" />

          {/* Header */}
          {(title || eyebrow) && (
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-tat-charcoal/8 bg-tat-paper px-6 py-4">
              <div className="flex min-w-0 items-center gap-2.5">
                {icon && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tat-gold/15 text-tat-gold">
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  {eyebrow && (
                    <p className="text-[11px] uppercase tracking-widest text-tat-charcoal/45">{eyebrow}</p>
                  )}
                  {title && (
                    <Drawer.Title className="line-clamp-1 text-sm font-medium text-tat-charcoal">
                      {title}
                    </Drawer.Title>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-tat-charcoal/8"
              >
                <X className="h-4 w-4 text-tat-charcoal/60" />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
