"use client";

import { cn } from "@/lib/utils";

type ScrimProps = {
  children: React.ReactNode;
  /** Classes for the outer box (sizing, placement). */
  className?: string;
  /**
   * Classes for the inner content box. Layout that must apply directly to the
   * children — flex rows, grids — belongs here, not on `className`, because
   * the children are nested one level inside.
   */
  contentClassName?: string;
  /** How far the scrim bleeds past the content it protects. */
  bleed?: string;
};

/**
 * A local legibility backdrop: sits above the particle canvas and below the
 * text it wraps, so copy stays readable without dimming the whole field.
 * The gradient fades to nothing at the edges, keeping particles visible
 * around and through it rather than cutting a hard rectangle out of the page.
 */
export default function Scrim({
  children,
  className,
  contentClassName,
  bleed = "-inset-x-8 -inset-y-12",
}: ScrimProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute z-[5] backdrop-blur-[2px]",
          bleed,
        )}
        style={{
          /*
            Multi-stop so the falloff is gradual and the scrim never reads as
            an oval. A mask on top of this produced a second, harder edge —
            the gradient alone does the whole job.
          */
          background: [
            "radial-gradient(ellipse at center,",
            "color-mix(in srgb, var(--color-void) 75%, transparent) 0%,",
            "color-mix(in srgb, var(--color-void) 62%, transparent) 30%,",
            "color-mix(in srgb, var(--color-void) 40%, transparent) 50%,",
            "color-mix(in srgb, var(--color-void) 18%, transparent) 68%,",
            "transparent 85%)",
          ].join(" "),
        }}
      />
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}
