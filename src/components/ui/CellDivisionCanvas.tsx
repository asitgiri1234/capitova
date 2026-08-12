"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const LOOP_MS = 6000;
const DOT_COUNT = 26;
const MINT = "123, 255, 196";

/** easeInOutCubic — the pinch should accelerate, then settle. */
function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type Dot = { side: -1 | 1; ox: number; oy: number };

function buildDots(): Dot[] {
  // Deterministic layout: no seeded PRNG needed, just a spiral.
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: DOT_COUNT }, (_, i) => {
    const r = Math.sqrt((i + 0.5) / DOT_COUNT);
    const a = i * golden;
    return {
      side: i % 2 === 0 ? -1 : 1,
      ox: Math.cos(a) * r,
      oy: Math.sin(a) * r,
    };
  });
}

/**
 * A cheap 2D mitosis loop. Deliberately not WebGL and not part of the R3F
 * scene — it is a tile decoration and must not compete for the GPU.
 */
export default function CellDivisionCanvas({
  className,
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dots = buildDots();
    let width = 0;
    let height = 0;
    let raf = 0;
    let start = performance.now();
    let onScreen = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(Math.floor(width * dpr), 1);
      canvas.height = Math.max(Math.floor(height * dpr), 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(reducedMotion ? 0.5 : (performance.now() - start) / LOOP_MS);
    };

    function draw(rawT: number) {
      if (!ctx || width === 0 || height === 0) return;

      const t = rawT % 1;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const base = Math.min(width, height) * 0.24;

      // Separation drives the whole animation: 0 = single cell, >r = split.
      const spread = ease(Math.min(t / 0.82, 1));
      const d = spread * base * 2.05;
      const r = base * (1 - 0.28 * spread);

      // Fade out at the end of the loop, back in at the start.
      const alpha = t > 0.9 ? 1 - (t - 0.9) / 0.1 : t < 0.05 ? t / 0.05 : 1;

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${MINT}, ${0.4 * alpha})`;

      ctx.beginPath();
      if (d < r) {
        // Overlapping: trace the union outline so the waist pinches naturally.
        const a = Math.acos(Math.min(d / r, 1));
        ctx.arc(cx - d, cy, r, a, Math.PI * 2 - a);
        ctx.arc(cx + d, cy, r, -(Math.PI - a), Math.PI - a);
        ctx.closePath();
      } else {
        ctx.moveTo(cx - d + r, cy);
        ctx.arc(cx - d, cy, r, 0, Math.PI * 2);
        ctx.moveTo(cx + d + r, cy);
        ctx.arc(cx + d, cy, r, 0, Math.PI * 2);
      }
      ctx.stroke();

      // Chromatin dots migrate to their daughter cell as the cell splits.
      ctx.fillStyle = `rgba(${MINT}, ${0.55 * alpha})`;
      for (const dot of dots) {
        const dx = cx + dot.side * d + dot.ox * r * 0.62;
        const dy = cy + dot.oy * r * 0.62;
        ctx.beginPath();
        ctx.arc(dx, dy, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Reduced motion: one static mid-division frame, no loop at all.
    if (reducedMotion) {
      resize();
      const ro = new ResizeObserver(() => resize());
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    const tick = (now: number) => {
      draw((now - start) / LOOP_MS);
      raf = requestAnimationFrame(tick);
    };

    const play = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };
    const pause = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    // Off-screen tiles must not burn frames.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen && !document.hidden) play();
        else pause();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) pause();
      else if (onScreen) play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    start = performance.now();
    play();

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none block h-full w-full", className)}
    />
  );
}
