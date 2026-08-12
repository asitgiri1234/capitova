"use client";

import type Lenis from "lenis";

/**
 * Single shared handle on the Lenis instance created by <SmoothScroll />.
 * null when reduced motion is on (native scrolling) or before mount.
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}

/**
 * Scroll to an element id. Uses Lenis when available, otherwise native
 * scrolling (which the reduced-motion CSS block keeps instant).
 */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    return;
  }

  target.scrollIntoView();
}
