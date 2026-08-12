"use client";

import { NAV } from "@/lib/constants";

export const MORPH_SECTION_IDS = [
  "hero",
  ...NAV.map((item) => item.id),
] as const;

/** Page-space top offset of each of the six sections. */
let bounds: number[] = [];

export function measureMorphBounds() {
  const next: number[] = [];
  for (const id of MORPH_SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) return;
    next.push(el.getBoundingClientRect().top + window.scrollY);
  }
  bounds = next;
}

export function getMorphBounds() {
  return bounds;
}

/**
 * Map the current scroll position onto 0–5, where each whole number is a
 * section boundary. Derived from real section offsets, so unequal section
 * heights (pinned ones especially) still get exactly one morph each.
 */
export function morphProgressFromScroll(
  scrollY: number,
  viewportHeight: number,
): number {
  if (bounds.length < MORPH_SECTION_IDS.length) return 0;

  const probe = scrollY + viewportHeight * 0.5;
  const last = bounds.length - 1;

  if (probe <= bounds[0]) return 0;
  if (probe >= bounds[last]) return last;

  for (let i = 0; i < last; i++) {
    const start = bounds[i];
    const end = bounds[i + 1];
    if (probe >= start && probe < end) {
      const span = end - start;
      const t = span > 0 ? (probe - start) / span : 0;
      return i + Math.min(Math.max(t, 0), 1);
    }
  }

  return last;
}
