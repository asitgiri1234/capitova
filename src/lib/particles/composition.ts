"use client";

/**
 * Per-section framing for the particle field. The field is never centered
 * behind a text column: it swings left or right and recedes wherever the copy
 * is dense, and only takes the middle of the stage in Impact.
 *
 * Index matches uProgress: 0 hero … 5 contact.
 */
export type Composition = { x: number; scale: number; opacity: number };

const COMPOSITION: Composition[] = [
  { x: 3.5, scale: 1.0, opacity: 0.85 }, // hero — text column sits left
  { x: -5.0, scale: 0.75, opacity: 0.3 }, // about — statement is the hero
  { x: 4.5, scale: 1.0, opacity: 0.55 }, // technology — behind the card track
  { x: -4.0, scale: 0.8, opacity: 0.4 }, // capabilities — bento is dense
  { x: 0.0, scale: 1.0, opacity: 0.95 }, // impact — the field IS the visual
  { x: 0.0, scale: 1.0, opacity: 0.7 }, // contact — collapsed singularity
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Sample the table at a fractional uProgress so the framing crossfades along
 * the same axis as the morph itself — one continuous system, not six presets.
 */
export function sampleComposition(progress: number): Composition {
  const last = COMPOSITION.length - 1;
  const p = Math.min(Math.max(progress, 0), last);
  const i = Math.floor(p);
  const t = p - i;

  if (i >= last) return COMPOSITION[last];

  const a = COMPOSITION[i];
  const b = COMPOSITION[i + 1];
  return {
    x: lerp(a.x, b.x, t),
    scale: lerp(a.scale, b.scale, t),
    opacity: lerp(a.opacity, b.opacity, t),
  };
}

/**
 * Smoothed morph progress, written by ParticleField each frame and read by the
 * rig so the framing and the morph never disagree by more than a frame.
 */
export const fieldState = { progress: 0 };
