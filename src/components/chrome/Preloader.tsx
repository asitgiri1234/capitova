"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getLenis } from "@/lib/lenis";

const VISITED_KEY = "capitova_visited";
const PHASES = ["Sequencing", "Folding", "Validating"] as const;

function phaseFor(progress: number) {
  if (progress < 33) return PHASES[0];
  if (progress < 66) return PHASES[1];
  return PHASES[2];
}

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Decide on the client only: sessionStorage and matchMedia are not
  // available during SSR, and guessing would cause a hydration mismatch.
  useLayoutEffect(() => {
    const seen = sessionStorage.getItem(VISITED_KEY) === "1";
    if (seen || reducedMotion) {
      sessionStorage.setItem(VISITED_KEY, "1");
      onCompleteRef.current();
      return;
    }
    sessionStorage.setItem(VISITED_KEY, "1");
    setMounted(true);
  }, [reducedMotion]);

  useLayoutEffect(() => {
    if (!mounted) return;

    document.body.style.overflow = "hidden";
    // Lenis is created by a parent effect, which runs after this one.
    const stopId = window.setTimeout(() => getLenis()?.stop(), 0);

    const release = () => {
      document.body.style.overflow = "";
      getLenis()?.start();
    };

    const counter = { value: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        value: 100,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => setProgress(counter.value),
        onComplete: () => {
          gsap.to(overlayRef.current, {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 1,
            ease: "expo.inOut",
            onComplete: () => {
              release();
              setMounted(false);
              onCompleteRef.current();
            },
          });
        },
      });
    });

    return () => {
      window.clearTimeout(stopId);
      ctx.revert();
      release();
    };
  }, [mounted]);

  if (!mounted) return null;

  const rounded = Math.round(progress);

  return (
    <div
      ref={overlayRef}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void px-12"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center font-mono text-6xl tabular-nums text-bone">
          {rounded}
        </div>
        <div className="relative h-px w-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 w-full origin-left bg-mint"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </div>
        <div className="mt-6 text-center font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">
          {phaseFor(progress)}
        </div>
      </div>
    </div>
  );
}
