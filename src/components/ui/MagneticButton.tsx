"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scrollToSection } from "@/lib/lenis";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "ghost";
  className?: string;
};

const RADIUS = 90;
const STRENGTH = 0.28;

export default function MagneticButton({
  children,
  href,
  variant = "primary",
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const label = labelRef.current;
    if (!el || !label || reducedMotion) return;

    // Touch devices have no hover cursor to chase.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    const labelX = gsap.quickTo(label, "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    const labelY = gsap.quickTo(label, "y", {
      duration: 0.4,
      ease: "power3.out",
    });

    let engaged = false;

    const onPointerMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;

      // Distance to the element's edge, not its center.
      const ox = Math.max(Math.abs(dx) - rect.width / 2, 0);
      const oy = Math.max(Math.abs(dy) - rect.height / 2, 0);
      const distance = Math.hypot(ox, oy);

      if (distance > RADIUS) {
        if (engaged) {
          engaged = false;
          gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.4)" });
          gsap.to(label, {
            x: 0,
            y: 0,
            duration: 0.9,
            ease: "elastic.out(1,0.4)",
          });
        }
        return;
      }

      engaged = true;
      xTo(dx * STRENGTH);
      yTo(dy * STRENGTH);
      labelX(dx * STRENGTH * 0.5);
      labelY(dy * STRENGTH * 0.5);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      gsap.killTweensOf([el, label]);
      gsap.set([el, label], { x: 0, y: 0 });
    };
  }, [reducedMotion]);

  const isAnchorTarget = href.startsWith("#");

  return (
    <a
      ref={ref}
      href={href}
      onClick={
        isAnchorTarget
          ? (event) => {
              event.preventDefault();
              scrollToSection(href.slice(1));
            }
          : undefined
      }
      className={cn(
        "inline-flex items-center justify-center px-8 py-4 font-mono text-xs tracking-widest uppercase transition-colors duration-200",
        variant === "primary"
          ? "bg-mint text-void hover:bg-mint/90"
          : "border border-white/20 text-bone hover:border-mint",
        className,
      )}
    >
      <span ref={labelRef} className="inline-block will-change-transform">
        {children}
      </span>
    </a>
  );
}
