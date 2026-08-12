"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Odometer from "@/components/ui/Odometer";
import Scrim from "@/components/ui/Scrim";

type Stat = {
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
  description: string;
};

const STATS: Stat[] = [
  {
    value: 4.2,
    decimals: 1,
    suffix: "M",
    label: "Protein structures",
    description: "Solved and validated in our structural database.",
  },
  {
    value: 11,
    label: "Day design cycle",
    description: "From target selection to synthesized candidate.",
  },
  {
    value: 94,
    suffix: "%",
    label: "In-silico filter rate",
    description: "Failures eliminated before reaching the bench.",
  },
  {
    value: 12,
    label: "Active programs",
    description: "Therapeutic programs currently in development.",
  },
];

const PARTNERS = [
  "Nature Biotechnology",
  "NIH SBIR",
  "EMBL-EBI",
  "Broad Institute",
  "Cell Press",
  "Wellcome Trust",
];

export default function Impact() {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const blocks = section.querySelectorAll<HTMLElement>("[data-stat]");
    const rules = section.querySelectorAll<HTMLElement>("[data-stat-rule]");

    if (reducedMotion) {
      gsap.set(blocks, { opacity: 1, y: 0 });
      gsap.set(rules, { scaleX: 1 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(rules, { transformOrigin: "left center" });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      });

      tl.fromTo(
        blocks,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
        },
        0,
      );
      tl.fromTo(
        rules,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: "power3.out", stagger: 0.12 },
        0.15,
      );
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Seamless marquee: two identical tracks, loop at exactly -50%.
  useLayoutEffect(() => {
    const track = marqueeRef.current;
    if (!track || reducedMotion) return;

    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        xPercent: -50,
        duration: 38,
        ease: "none",
        repeat: -1,
      });

      const pause = () => tween.pause();
      const resume = () => tween.resume();
      track.addEventListener("pointerenter", pause);
      track.addEventListener("pointerleave", resume);

      return () => {
        track.removeEventListener("pointerenter", pause);
        track.removeEventListener("pointerleave", resume);
      };
    }, track);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="impact"
      className="relative z-10 flex min-h-screen flex-col justify-center py-40"
    >
      {/* legibility scrims so stats stay readable over the particle field */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[20%]"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-void), transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[20%]"
        style={{
          background: "linear-gradient(to top, var(--color-void), transparent)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl container-page">
        <Scrim className="inline-block">
        <p className="flex items-center gap-4 font-mono text-xs tracking-widest text-white/50 uppercase">
          <span aria-hidden="true" className="block h-px w-12 bg-mint" />
          04 / Impact
        </p>
        <h2 className="mt-8 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] font-medium tracking-[-0.03em] text-bone">
          Measured, not claimed.
        </h2>
        </Scrim>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              data-stat
              style={{ opacity: reducedMotion ? 1 : 0 }}
              className={
                index === 0
                  ? "border-t border-white/10 py-8 md:border-t-0 md:py-0 lg:pr-10"
                  : "border-t border-white/10 py-8 md:border-t-0 md:py-0 md:border-l md:pl-10 lg:pr-10"
              }
            >
              <Scrim bleed="-inset-x-4 -inset-y-8">
              <div className="text-[clamp(3.5rem,8vw,7rem)] leading-none font-medium tracking-[-0.05em] text-bone">
                <Odometer
                  value={stat.value}
                  decimals={stat.decimals ?? 0}
                  suffix={stat.suffix}
                />
              </div>

              <span
                data-stat-rule
                aria-hidden="true"
                style={{ transform: reducedMotion ? "none" : "scaleX(0)" }}
                className="mt-6 block h-px w-full origin-left bg-mint"
              />

              <div className="mt-6 font-mono text-xs tracking-[0.2em] text-mint uppercase">
                {stat.label}
              </div>
              <p className="mt-3 max-w-[22ch] text-sm text-white/60">
                {stat.description}
              </p>
              </Scrim>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-24 overflow-hidden border-y border-white/10 py-6">
        <div
          ref={marqueeRef}
          className={
            reducedMotion
              ? "flex w-full items-center gap-10 overflow-hidden container-page"
              : "flex w-max items-center gap-10"
          }
        >
          {(reducedMotion ? [PARTNERS] : [PARTNERS, PARTNERS]).map(
            (group, groupIndex) => (
              <div
                key={groupIndex}
                aria-hidden={groupIndex > 0 ? "true" : undefined}
                className="flex shrink-0 items-center gap-10"
              >
                {group.map((partner) => (
                  <span
                    key={partner}
                    className="flex shrink-0 items-center gap-10 font-mono text-xs tracking-[0.2em] text-white/60 uppercase"
                  >
                    {partner}
                    <span
                      aria-hidden="true"
                      className="block h-[3px] w-[3px] bg-mint"
                    />
                  </span>
                ))}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
