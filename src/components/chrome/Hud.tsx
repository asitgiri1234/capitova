"use client";

import { useState } from "react";
import { NAV, SITE } from "@/lib/constants";
import { scrollToSection } from "@/lib/lenis";
import { useScrollStore } from "@/lib/scrollStore";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";

const SECTION_IDS = ["hero", ...NAV.map((item) => item.id)] as const;

const TICK =
  "pointer-events-none absolute hidden h-[14px] w-[14px] transition-colors duration-[400ms] md:block";

export default function Hud() {
  const { progress, activeSection, inverted } = useScrollStore();
  useActiveSection(SECTION_IDS);

  const [menuOpen, setMenuOpen] = useState(false);

  const percent = String(Math.round(progress * 100)).padStart(3, "0");

  // Every chrome element transitions over 400ms, so the flip never snaps.
  const fade = "transition-colors duration-[400ms]";

  return (
    <header className="pointer-events-none fixed inset-0 z-40 select-none">
      {/* corner ticks */}
      <span
        className={cn(
          TICK,
          "top-6 left-6 border-t border-l",
          inverted ? "border-void/30" : "border-white/20",
        )}
      />
      <span
        className={cn(
          TICK,
          "top-6 right-6 border-t border-r",
          inverted ? "border-void/30" : "border-white/20",
        )}
      />
      <span
        className={cn(
          TICK,
          "bottom-6 left-6 border-b border-l",
          inverted ? "border-void/30" : "border-white/20",
        )}
      />
      <span
        className={cn(
          TICK,
          "right-6 bottom-6 border-r border-b",
          inverted ? "border-void/30" : "border-white/20",
        )}
      />

      {/* top-left: wordmark */}
      <div className="pointer-events-auto absolute top-6 left-6 md:left-12">
        <a
          href="#hero"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("hero");
          }}
          className={cn(
            "tap-target font-mono text-xs tracking-[0.2em] uppercase",
            fade,
            inverted ? "text-void" : "text-bone",
          )}
        >
          {SITE.name}
        </a>
      </div>

      {/* top-right: full nav on desktop, MENU toggle on mobile */}
      <nav
        aria-label="Sections"
        className="pointer-events-auto absolute top-6 right-6 md:right-12"
      >
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          className={cn(
            "tap-target font-mono text-xs tracking-[0.2em] uppercase md:hidden",
            fade,
            inverted ? "text-void" : "text-bone",
          )}
        >
          Menu
        </button>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => {
            const active = activeSection === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active ? "true" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={cn(
                    "tap-target font-mono text-[10px] tracking-[0.2em] uppercase",
                    fade,
                    inverted
                      ? active
                        ? "text-violet-deep"
                        : "text-void/60 hover:text-void"
                      : active
                        ? "text-mint"
                        : "text-white/60 hover:text-bone",
                  )}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* bottom-left: live scroll readout */}
      <div className="absolute bottom-6 left-12 hidden font-mono text-[10px] tracking-[0.2em] uppercase md:block">
        <span className={cn(fade, inverted ? "text-void/65" : "text-white/60")}>
          Scroll
        </span>
        <span className={cn(fade, inverted ? "text-void/25" : "text-white/20")}>
          {" / "}
        </span>
        <span
          className={cn(
            "tabular-nums",
            fade,
            inverted ? "text-violet-deep" : "text-mint",
          )}
        >
          {percent}%
        </span>
      </div>

      {/* bottom-right: progress rail */}
      <div className="absolute right-12 bottom-6 hidden md:block">
        <div
          className={cn(
            "relative h-24 w-px",
            fade,
            inverted ? "bg-void/20" : "bg-white/15",
          )}
        >
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-full origin-top",
              fade,
              inverted ? "bg-violet-deep" : "bg-mint",
            )}
            style={{ transform: `scaleY(${progress})` }}
          />
        </div>
      </div>
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeSection={activeSection}
        inverted={inverted}
      />
    </header>
  );
}
