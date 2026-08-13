"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Scrim from "@/components/ui/Scrim";
import { cn } from "@/lib/utils";

const STATEMENT =
  "We build computational systems that read, predict, and rewrite the language of proteins — compressing a decade of wet-lab discovery into a single design cycle.";

const WORDS = STATEMENT.split(" ");
const ACCENT_START = WORDS.indexOf("read,");
const ACCENT_END = WORDS.indexOf("rewrite");

const FACTS = [
  { label: "Founded", value: "2019" },
  { label: "Design cycle", value: "11 Days" },
  { label: "Model params", value: "4.8B" },
] as const;

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const factsRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const words = section.querySelectorAll<HTMLElement>("[data-word]");
    const plainWords = section.querySelectorAll<HTMLElement>(
      "[data-word][data-plain]",
    );

    const accentWords = section.querySelectorAll<HTMLElement>(
      "[data-word][data-accent]",
    );

    // Reduced motion: no pin, no scrub — the statement is simply legible.
    if (reducedMotion) {
      gsap.set(plainWords, { color: "#EDEAE4" });
      gsap.set(accentWords, { color: "#7BFFC4" });
      gsap.set(factsRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Desktop only. Below md the pin is never created — a 240vh pinned
    // section on a phone is a scroll trap, not an effect.
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const each = 0.06;
      const total = (words.length - 1) * each + 0.4;

      gsap.set(factsRef.current, { opacity: 0, y: 16 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=140%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // Colour, not opacity: the unrevealed state stays a legible grey rather
      // than dissolving into whatever the particle field is doing behind it.
      tl.to(
        plainWords,
        { color: "#EDEAE4", duration: 0.4, ease: "none", stagger: { each } },
        0,
      );
      tl.to(
        accentWords,
        { color: "#7BFFC4", duration: 0.4, ease: "none", stagger: { each } },
        0,
      );
      tl.to(
        factsRef.current,
        { opacity: 1, y: 0, duration: total * 0.25, ease: "none" },
        total * 0.75,
      );
    });

    // Mobile: natural height, no pin, no scrub. Words are already at full
    // contrast and the statement arrives with a single fade-up.
    mm.add("(max-width: 767px)", () => {
      gsap.set(plainWords, { color: "#EDEAE4" });
      gsap.set(accentWords, { color: "#7BFFC4" });

      const statement = section.querySelector("[data-statement]");
      if (statement) {
        gsap.fromTo(
          statement,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: statement, start: "top 88%", once: true },
          },
        );
      }

      gsap.fromTo(
        factsRef.current,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: factsRef.current, start: "top 90%", once: true },
        },
      );
    });

    return () => mm.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative z-10 flex flex-col justify-center container-page section-y md:min-h-[100dvh]"
    >
      <Scrim className="mx-auto w-full max-w-4xl">
        <p className="flex items-center gap-4 font-mono text-xs tracking-widest text-white/50 uppercase">
          <span aria-hidden="true" className="block h-px w-12 bg-mint" />
          01 / Innovation
        </p>

        {/* The statement is the visual heading; this keeps the outline intact
            without altering the design. */}
        <h2 className="sr-only">Innovation</h2>

        <p
          data-statement
          className="mt-8 max-w-full text-[clamp(1.25rem,4.4vw,3.5rem)] leading-[1.35] tracking-[-0.01em] md:mt-10 md:leading-[1.15] md:tracking-[-0.02em]">
          {WORDS.map((word, index) => {
            const accent =
              ACCENT_START >= 0 && index >= ACCENT_START && index <= ACCENT_END;
            return (
              <span key={`${word}-${index}`}>
                <span
                  data-word
                  data-plain={accent ? undefined : ""}
                  data-accent={accent ? "" : undefined}
                  className={cn(
                    "inline-block",
                    accent
                      ? cn(
                          "font-serif italic",
                          reducedMotion ? "text-mint" : "text-mint/40",
                        )
                      : reducedMotion
                        ? "text-bone"
                        : "text-white/30",
                  )}
                >
                  {word}
                </span>
                {index < WORDS.length - 1 ? " " : null}
              </span>
            );
          })}
        </p>

        <div
          ref={factsRef}
          className="mt-12 grid grid-cols-1 gap-0 md:mt-16 md:grid-cols-3 md:gap-12"
          style={{ opacity: reducedMotion ? 1 : 0 }}
        >
          {FACTS.map((fact) => (
            <div key={fact.label} className="border-t border-white/10 py-4 md:py-0 md:pt-4">
              <div className="font-mono text-xs tracking-widest text-white/55 uppercase">
                {fact.label}
              </div>
              <div className="mt-2 font-mono text-xs tracking-widest text-bone uppercase tabular-nums">
                {fact.value}
              </div>
            </div>
          ))}
        </div>
      </Scrim>
    </section>
  );
}
