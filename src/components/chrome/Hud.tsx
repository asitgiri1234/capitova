"use client";

import { NAV, SITE } from "@/lib/constants";
import { scrollToSection } from "@/lib/lenis";
import { useScrollStore } from "@/lib/scrollStore";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/utils";

const SECTION_IDS = ["hero", ...NAV.map((item) => item.id)] as const;

const TICK = "pointer-events-none absolute h-[14px] w-[14px] border-white/20";

export default function Hud() {
  const { progress, activeSection } = useScrollStore();
  useActiveSection(SECTION_IDS);

  const percent = String(Math.round(progress * 100)).padStart(3, "0");

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none">
      {/* corner ticks */}
      <span className={cn(TICK, "top-6 left-6 border-t border-l")} />
      <span className={cn(TICK, "top-6 right-6 border-t border-r")} />
      <span className={cn(TICK, "bottom-6 left-6 border-b border-l")} />
      <span className={cn(TICK, "right-6 bottom-6 border-r border-b")} />

      {/* top-left: wordmark */}
      <div className="pointer-events-auto absolute top-6 left-12">
        <a
          href="#hero"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("hero");
          }}
          className="font-mono text-xs tracking-[0.2em] text-bone uppercase"
        >
          {SITE.name}
        </a>
      </div>

      {/* top-right: nav */}
      <nav
        aria-label="Sections"
        className="pointer-events-auto absolute top-6 right-12"
      >
        <ul className="flex items-center gap-6">
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
                    "font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-200",
                    active ? "text-mint" : "text-white/50 hover:text-bone",
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
        <span className="text-white/40">Scroll</span>
        <span className="text-white/20"> / </span>
        <span className="text-mint tabular-nums">{percent}%</span>
      </div>

      {/* bottom-right: progress rail */}
      <div className="absolute right-12 bottom-6 hidden md:block">
        <div className="relative h-24 w-px bg-white/15">
          <div
            className="absolute inset-x-0 top-0 h-full origin-top bg-mint"
            style={{ transform: `scaleY(${progress})` }}
          />
        </div>
      </div>
    </div>
  );
}
