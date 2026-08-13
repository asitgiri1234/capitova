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
 * Descender clearance for the clip box. Gloock's tails sit well below the
 * baseline, so the wrapper is padded and pulled back by an equal negative
 * margin — the visual baseline and line spacing are unchanged.
 */
const PAD_BOTTOM = 0.18;
const PAD_TOP = 0.08;

/**
 * Start offset, in percent of the inner span's own height. It must clear the
 * padded clip box, not just the text: at 110% the top of each glyph stayed
 * inside the enlarged box and showed as stray fragments.
 */
const HIDDEN_Y = 130;

/** Safety net — the headline must never be permanently invisible. */
const FORCE_PLAY_MS = 2000;

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
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const startedRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const lines = text.split("\n");

  // Build the reveal once, paused. Playback is decided separately below, so a
  // trigger that never arrives cannot leave the text stuck off-screen.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll<HTMLElement>("[data-split-inner]");

    if (reducedMotion) {
      gsap.set(targets, { yPercent: 0, clearProps: "transform" });
      startedRef.current = true;
      onCompleteRef.current?.();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    startedRef.current = false;

    const ctx = gsap.context(() => {
      // fromTo, not to: never rely on GSAP parsing the inline start transform.
      tweenRef.current = gsap.fromTo(
        targets,
        { yPercent: HIDDEN_Y },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "expo.out",
          delay,
          stagger,
          // Scroll-triggered reveals are driven by ScrollTrigger; mount
          // reveals stay paused until play() is called.
          paused: trigger === "mount",
          onComplete: () => onCompleteRef.current?.(),
          ...(trigger === "scroll"
            ? { scrollTrigger: { trigger: el, start: "top 85%", once: true } }
            : {}),
        },
      );
    }, el);

    return () => {
      ctx.revert();
      tweenRef.current = null;
    };
  }, [delay, reducedMotion, stagger, trigger]);

  // Playback + safety net.
  useLayoutEffect(() => {
    if (reducedMotion || trigger !== "mount") return;

    const start = () => {
      if (startedRef.current) return;
      const tween = tweenRef.current;
      if (!tween) return;
      startedRef.current = true;
      tween.play();
    };

    if (play) {
      start();
      return;
    }

    // The gate never opened — reveal anyway rather than leave a blank hero.
    const timer = window.setTimeout(start, FORCE_PLAY_MS);
    return () => window.clearTimeout(timer);
  }, [play, reducedMotion, trigger]);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      aria-label={text.replace(/\n/g, " ")}
      className={cn(className)}
    >
      {lines.map((line, lineIndex) => {
        const words = line.split(" ");
        return (
          // display is set inline so the three-line structure survives even if
          // utility CSS fails to load.
          <span
            key={lineIndex}
            aria-hidden="true"
            className="block"
            style={{ display: "block" }}
          >
            {words.map((word, wordIndex) => (
              <span
                key={`${lineIndex}-${wordIndex}`}
                className="inline-block overflow-hidden align-bottom"
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  verticalAlign: "bottom",
                  // Match the heading's own line-height so the clip box tracks
                  // the text box instead of collapsing to a default.
                  lineHeight: "inherit",
                  paddingTop: `${PAD_TOP}em`,
                  marginTop: `${-PAD_TOP}em`,
                  paddingBottom: `${PAD_BOTTOM}em`,
                  marginBottom: `${-PAD_BOTTOM}em`,
                  marginRight:
                    wordIndex < words.length - 1 ? "0.25em" : undefined,
                }}
              >
                <span
                  data-split-inner
                  className="inline-block will-change-transform"
                  style={{
                    display: "inline-block",
                    lineHeight: "inherit",
                    transform: reducedMotion
                      ? "none"
                      : `translateY(${HIDDEN_Y}%)`,
                  }}
                >
                  {word}
                </span>
              </span>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}
