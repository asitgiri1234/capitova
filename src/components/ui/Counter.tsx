"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type CounterProps = {
  value: number;
  decimals?: number;
  className?: string;
};

function format(value: number, decimals: number) {
  return decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString("en-US");
}

/** Counts up from zero the first time it enters the viewport. */
export default function Counter({
  value,
  decimals = 0,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => format(0, decimals));
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      setDisplay(format(value, decimals));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const proxy = { value: 0 };
      const tween = gsap.to(proxy, {
        value,
        duration: 1.6,
        ease: "power2.out",
        paused: true,
        onUpdate: () => setDisplay(format(proxy.value, decimals)),
      });

      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => tween.play(),
      });
    }, el);

    return () => ctx.revert();
  }, [decimals, reducedMotion, value]);

  return (
    <span
      ref={ref}
      aria-label={format(value, decimals)}
      aria-live="off"
      className={cn("tabular-nums", className)}
    >
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
