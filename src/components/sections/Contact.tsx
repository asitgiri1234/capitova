"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAnimate } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHoverCapable } from "@/hooks/useHoverCapable";
import SplitText from "@/components/ui/SplitText";
import { CONTACT_CHANNELS } from "@/lib/constants";
import { setScrollState } from "@/lib/scrollStore";
import { cn } from "@/lib/utils";

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    if (!section || !panel) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(panel, { clipPath: "inset(0% 0% 0% 0%)" });
      } else {
        gsap.fromTo(
          panel,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              // Shorter travel on phones: a 65% window does not complete
              // before the section is already filling the screen.
              end: window.matchMedia("(min-width: 768px)").matches
                ? "top 20%"
                : "top 50%",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      // The HUD flips only once Contact genuinely owns the viewport.
      ScrollTrigger.create({
        trigger: section,
        start: "top 45%",
        onEnter: () => setScrollState({ inverted: true }),
        onLeaveBack: () => setScrollState({ inverted: false }),
      });
    }, section);

    return () => {
      ctx.revert();
      setScrollState({ inverted: false });
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative z-10 container-page flex min-h-[100dvh] flex-col justify-center section-y text-void"
    >
      {/*
        Bone lives inside the section, clipped to its own box. A fixed,
        viewport-sized panel bled the light background over Impact while
        Impact was still on screen.
      */}
      <div
        ref={panelRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-bone"
        style={{ clipPath: "inset(100% 0% 0% 0%)" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <p className="flex items-center gap-4 font-mono text-xs tracking-widest text-void/50 uppercase">
          <span aria-hidden="true" className="block h-px w-12 bg-void" />
          05 / Contact
        </p>

        <SplitText
          text={"Let's build the next molecule."}
          as="h2"
          trigger="scroll"
          className="mt-8 font-display text-[clamp(1.85rem,7.5vw,6.5rem)] leading-[1.02] tracking-[-0.01em] text-void md:mt-10 md:leading-[0.95] md:tracking-[-0.015em]"
        />

        <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-void/65 md:mt-10 md:text-base">
          We work with research groups and clinical teams who need a design
          cycle measured in days — tell us what you are trying to build.
        </p>

        <PrimaryCta reducedMotion={reducedMotion} />

        <div className="mt-12 grid grid-cols-1 md:mt-16 md:grid-cols-3">
          {CONTACT_CHANNELS.map((channel, index) => (
            <div
              key={channel.label}
              className={cn(
                "border-t border-void/15 py-6 md:border-t-0 md:py-0",
                index > 0 && "md:border-l md:border-void/15 md:pl-8",
                index < CONTACT_CHANNELS.length - 1 && "md:pr-8",
              )}
            >
              <div className="font-mono text-[10px] tracking-[0.12em] text-void/65 uppercase">
                {channel.label}
              </div>
              <a
                href={`mailto:${channel.email}`}
                className="tap-target mt-2 font-mono text-xs tracking-widest text-void underline decoration-void/30 decoration-1 underline-offset-4 transition-all duration-200 hover:decoration-void hover:underline-offset-[6px]"
              >
                {channel.email}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrimaryCta({ reducedMotion }: { reducedMotion: boolean }) {
  const hoverable = useHoverCapable();
  const [scope, animate] = useAnimate();
  const fillRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  const EXPO = [0.16, 1, 0.3, 1] as const;

  const enter = () => {
    if (reducedMotion || !hoverable) return;
    const fill = fillRef.current;
    if (!fill) return;
    // sweeps up from the bottom …
    fill.style.transformOrigin = "bottom center";
    animate(fill, { scaleY: 1 }, { duration: 0.5, ease: EXPO });
    if (labelRef.current) {
      animate(labelRef.current, { color: "#EDEAE4" }, { duration: 0.3 });
    }
    if (arrowRef.current) {
      animate(arrowRef.current, { x: 8 }, { duration: 0.5, ease: EXPO });
      animate(arrowRef.current, { color: "#EDEAE4" }, { duration: 0.3 });
    }
  };

  const leave = () => {
    if (reducedMotion || !hoverable) return;
    const fill = fillRef.current;
    if (!fill) return;
    // … and retracts upward, so it never simply plays in reverse.
    fill.style.transformOrigin = "top center";
    animate(fill, { scaleY: 0 }, { duration: 0.5, ease: EXPO });
    if (labelRef.current) {
      animate(labelRef.current, { color: "#06080B" }, { duration: 0.3 });
    }
    if (arrowRef.current) {
      animate(arrowRef.current, { x: 0 }, { duration: 0.5, ease: EXPO });
      animate(arrowRef.current, { color: "#06080B" }, { duration: 0.3 });
    }
  };

  return (
    <div ref={scope} className="mt-12 md:mt-16">
      <a
        href="mailto:research@capitova.bio"
        onPointerEnter={enter}
        onPointerLeave={leave}
        onFocus={enter}
        onBlur={leave}
        className={cn(
          "relative flex w-full items-center justify-between overflow-hidden border border-void px-6 py-6 md:px-8 md:py-8",
          // The global focus ring is mint, which is invisible on bone.
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-void",
          // Reduced motion gets a plain instant swap instead of the sweep.
          reducedMotion && "hover:bg-void hover:text-bone",
        )}
      >
        {!reducedMotion ? (
          <span
            ref={fillRef}
            aria-hidden="true"
            className="absolute inset-0 z-0 block bg-void"
            style={{ transform: "scaleY(0)", transformOrigin: "bottom center" }}
          />
        ) : null}

        <span
          ref={labelRef}
          className="relative z-10 font-mono text-xs tracking-[0.12em] uppercase md:text-sm md:tracking-[0.15em]"
        >
          Start a conversation
        </span>
        <span
          ref={arrowRef}
          aria-hidden="true"
          className="relative z-10 font-mono text-sm"
        >
          &rarr;
        </span>
      </a>
    </div>
  );
}
