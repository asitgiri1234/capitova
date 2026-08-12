"use client";

import { useEffect, useRef } from "react";
import { NAV } from "@/lib/constants";
import { getLenis, scrollToSection } from "@/lib/lenis";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  activeSection: string;
  inverted: boolean;
};

const FOCUSABLE = "a[href], button:not([disabled])";

export default function MobileMenu({
  open,
  onClose,
  activeSection,
  inverted,
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
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-void md:hidden"
    >
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="font-mono text-xs tracking-[0.2em] text-bone uppercase">
          Menu
        </span>
        <button
          type="button"
          onClick={onClose}
          className="tap-target justify-end font-mono text-xs tracking-[0.2em] text-bone uppercase"
        >
          Close
        </button>
      </div>

      <nav aria-label="Sections" className="flex flex-1 flex-col justify-center px-6">
        <ul className="flex flex-col gap-2">
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
                  "tap-target py-3 font-mono text-2xl tracking-[0.1em] uppercase",
                  activeSection === item.id
                    ? inverted
                      ? "text-violet-deep"
                      : "text-mint"
                    : "text-bone",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
