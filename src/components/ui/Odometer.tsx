"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type OdometerProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

function format(value: number, decimals: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Counts up once on scroll-in. Width is reserved from the final string so the
 * surrounding layout never shifts while the digits churn.
 */
export default function Odometer({
  value,
  decimals = 0,
  prefix,
  suffix,
  duration = 2.2,
  className,
}: OdometerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const final = useMemo(() => format(value, decimals), [value, decimals]);

  // Server and first client render both show the final value, so there is no
  // hydration mismatch and no reflow when the tween starts.
  const [display, setDisplay] = useState(final);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      setDisplay(final);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    setDisplay(format(0, decimals));

    const ctx = gsap.context(() => {
      const proxy = { value: 0 };
      const tween = gsap.to(proxy, {
        value,
        duration,
        ease: "power3.out",
        paused: true,
        onUpdate: () => setDisplay(format(proxy.value, decimals)),
        onComplete: () => setDisplay(final),
      });

      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once: true,
        onEnter: () => tween.play(),
      });
    }, el);

    return () => ctx.revert();
  }, [decimals, duration, final, reducedMotion, value]);

  // Screen readers get the finished value once; the churning digits are
  // hidden and the region is explicitly not live.
  return (
    <span
      ref={ref}
      aria-label={`${prefix ?? ""}${final}${suffix ?? ""}`}
      aria-live="off"
      className={cn("tabular-nums", className)}
    >
      {/*
        inline-flex + nowrap: the digits are an inline-block, so a narrow
        column could otherwise break the line between the value and its
        suffix ("4.2" above a stranded "M").
      */}
      <span
        aria-hidden="true"
        className="inline-flex items-baseline whitespace-nowrap"
      >
        {prefix}
        <span
          className="inline-block text-left tabular-nums"
          style={{ minWidth: `${final.length}ch` }}
        >
          {display}
        </span>
        {suffix}
      </span>
    </span>
  );
}
