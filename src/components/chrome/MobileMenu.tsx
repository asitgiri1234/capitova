"use client";

import { useEffect, useRef } from "react";
import { CONTACT_CHANNELS, NAV } from "@/lib/constants";
import { getLenis, scrollToSection } from "@/lib/lenis";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  id: string;
  open: boolean;
  onClose: () => void;
  activeSection: string;
};

const FOCUSABLE = "a[href], button:not([disabled])";

export default function MobileMenu({
  id,
  open,
  onClose,
  activeSection,
}: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    // Lock scrolling behind the overlay.
    getLenis()?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    items[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || items.length === 0) return;

      // Trap: wrap focus at both ends of the overlay.
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      getLenis()?.start();
      restoreFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-void/98 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="flex items-center justify-between container-page pt-6">
        <span className="font-display text-base tracking-[0.02em] text-bone">
          Menu
        </span>
        <button
          type="button"
          onClick={onClose}
          className="tap-target justify-end font-mono text-xs tracking-[0.12em] text-bone uppercase"
        >
          Close
        </button>
      </div>

      <nav
        aria-label="Sections"
        className="flex flex-1 flex-col justify-center container-page"
      >
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={activeSection === item.id ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onClose();
                  scrollToSection(item.id);
                }}
                className={cn(
                  "tap-target block py-3 font-display text-3xl tracking-[-0.01em]",
                  activeSection === item.id ? "text-mint" : "text-bone",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-page pb-8">
        <ul className="flex flex-col gap-1 border-t border-white/10 pt-6">
          {CONTACT_CHANNELS.map((channel) => (
            <li key={channel.label}>
              <a
                href={`mailto:${channel.email}`}
                className="tap-target font-mono text-[10px] tracking-[0.12em] text-white/60 uppercase"
              >
                {channel.label} / {channel.email}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
