"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import MagneticButton from "@/components/ui/MagneticButton";
import SplitText from "@/components/ui/SplitText";
import Scrim from "@/components/ui/Scrim";

const HEADLINE = "Engineering\nlife at the\nsmallest scale.";

const STATS = [
  "12 Therapeutic Programs",
  "4.2M Protein Structures",
  "ISO 13485 Certified",
] as const;

export default function Hero({ start = true }: { start?: boolean }) {
  const tailRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  // Sub-paragraph, CTAs and stats follow the headline in.
  useLayoutEffect(() => {
    const el = tailRef.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    if (!start) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.75, ease: "power3.out" },
      );
    }, el);
    return () => ctx.revert();
  }, [reducedMotion, start]);

  // Looping scroll cue.
  useLayoutEffect(() => {
    const el = cueRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.8,
          ease: "power2.inOut",
          repeat: -1,
          transformOrigin: "top center",
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden container-page pb-24 md:pb-28"
    >
      {/* z-0 slot: WebGL canvas drops in here full-bleed without touching text layout */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div
          className="absolute top-1/2 left-1/2 h-[70vh] w-[70vw] -translate-x-1/2 -translate-y-1/3 blur-3xl"
          style={{
            opacity: 0.07,
            background:
              "radial-gradient(circle at center, var(--color-mint) 0%, transparent 65%)",
          }}
        />
      </div>

      <Scrim className="z-10 mx-auto w-full max-w-7xl">
        <p className="flex items-center gap-3 font-mono text-xs tracking-[0.15em] text-mint uppercase">
          <span aria-hidden="true" className="inline-block h-px w-px bg-mint" />
          Precision Biology / Est. 2019
        </p>

        <SplitText
          text={HEADLINE}
          as="h1"
          play={start}
          className="mt-6 font-display text-[clamp(1.95rem,8.5vw,9rem)] leading-[1.02] tracking-[-0.01em] text-bone md:mt-8 md:leading-[0.95] md:tracking-[-0.015em]"
        />

        <div ref={tailRef} style={{ opacity: reducedMotion ? 1 : 0 }}>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-white/60 md:mt-10 md:text-base">
            We pair computational protein design with automated wet-lab
            validation to move therapeutic candidates from sequence to
            structure in days, not years.
          </p>

          {/* gap-6 = 24px: two buttons capped at 12px each can never close it */}
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-6 md:mt-10">
            <MagneticButton href="#about" variant="primary">
              Explore the platform
            </MagneticButton>
            <MagneticButton href="#technology" variant="ghost">
              Research
            </MagneticButton>
          </div>

          <ul className="mt-16 hidden items-center md:flex">
            {STATS.map((stat, index) => (
              <li
                key={stat}
                className={`font-mono text-xs tracking-widest text-white/60 uppercase ${
                  index === 0 ? "pr-6" : "border-l border-white/10 px-6"
                }`}
              >
                {stat}
              </li>
            ))}
          </ul>
        </div>
      </Scrim>

      <div className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex md:bottom-8">
        <span className="font-mono text-[10px] tracking-[0.18em] text-white/60 uppercase">
          Scroll
        </span>
        <span className="block h-10 w-px overflow-hidden bg-white/10">
          <span
            ref={cueRef}
            className="block h-full w-px origin-top bg-mint"
            style={{ transform: reducedMotion ? "none" : "scaleY(0)" }}
          />
        </span>
      </div>
    </section>
  );
}
