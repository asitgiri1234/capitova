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
          background:
            "radial-gradient(ellipse at center, color-mix(in srgb, var(--color-void) 75%, transparent) 0%, color-mix(in srgb, var(--color-void) 55%, transparent) 45%, transparent 78%)",
          maskImage:
            "radial-gradient(ellipse at center, #000 0%, #000 55%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, #000 0%, #000 55%, transparent 85%)",
        }}
      />
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}
