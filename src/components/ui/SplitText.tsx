"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type SplitTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  delay?: number;
  stagger?: number;
  trigger?: "mount" | "scroll";
  /** Hold at the pre-animation state until this flips true (preloader gating). */
  play?: boolean;
  onComplete?: () => void;
};

/**
 * Word-level split only — character splitting shreds the accessibility tree.
 * The full string lives on the wrapper's aria-label; the visual spans are
 * aria-hidden, so assistive tech reads one coherent sentence.
 */
export default function SplitText({
  text,
  as: Tag = "h1",
  className,
  delay = 0,
  stagger = 0.06,
  trigger = "mount",
  play = true,
  onComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const lines = text.split("\n");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll<HTMLElement>("[data-split-inner]");

    if (reducedMotion) {
      gsap.set(targets, { yPercent: 0, clearProps: "transform" });
      onCompleteRef.current?.();
      return;
    }

    if (!play) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        yPercent: 0,
        duration: 1.1,
        ease: "expo.out",
        delay,
        stagger,
        onComplete: () => onCompleteRef.current?.(),
        ...(trigger === "scroll"
          ? { scrollTrigger: { trigger: el, start: "top 85%", once: true } }
          : {}),
      });
    }, el);

    return () => ctx.revert();
  }, [delay, play, reducedMotion, stagger, trigger]);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      aria-label={text.replace(/\n/g, " ")}
      className={cn(className)}
    >
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} aria-hidden="true" className="block">
          {line.split(" ").map((word, wordIndex) => (
            <span
              key={`${lineIndex}-${wordIndex}`}
              className="inline-block overflow-hidden align-bottom"
            >
              <span
                data-split-inner
                className="inline-block will-change-transform"
                style={{ transform: "translateY(110%)" }}
              >
                {word}
              </span>
              {wordIndex < line.split(" ").length - 1 ? (
                <span className="inline-block">&nbsp;</span>
              ) : null}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
