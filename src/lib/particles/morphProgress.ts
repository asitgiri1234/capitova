"use client";

import { NAV } from "@/lib/constants";

export const MORPH_SECTION_IDS = [
  "hero",
  ...NAV.map((item) => item.id),
] as const;

export type MorphAnchor = {
  id: string;
  top: number;
  height: number;
  /** scrollY at which this section's midpoint sits at viewport center */
  scroll: number;
};

let anchors: MorphAnchor[] = [];
let logged = false;

/**
 * ScrollTrigger wraps a pinned section in a `.pin-spacer`, and it is the
 * spacer — not the section — that occupies the scroll distance. Measuring the
 * section instead makes every boundary after a pinned section wrong.
 */
function layoutBox(el: HTMLElement): HTMLElement {
  const parent = el.parentElement;
  if (parent && parent.classList.contains("pin-spacer")) return parent;
  return el;
}

export function measureMorphBounds() {
  if (typeof window === "undefined") return;

  const viewport = window.innerHeight;
  const next: MorphAnchor[] = [];

  for (const id of MORPH_SECTION_IDS) {
    const el = document.getElementById(id);
    // Skip a missing section rather than abandoning the whole measurement.
    if (!el) continue;

    const box = layoutBox(el);
    const top = box.getBoundingClientRect().top + window.scrollY;
    const height = box.offsetHeight;

    next.push({
      id,
      top,
      height,
      // uProgress reaches exactly N when section N's midpoint is centered.
      scroll: Math.max(top + height / 2 - viewport / 2, 0),
    });
  }

  // A pinned section mid-pin can report a rect that breaks ordering; force the
  // anchors monotonic so the lookup below can never divide by zero or invert.
  for (let i = 1; i < next.length; i++) {
    if (next[i].scroll <= next[i - 1].scroll) {
      next[i].scroll = next[i - 1].scroll + 1;
    }
  }

  anchors = next;

  if (process.env.NODE_ENV !== "production" && !logged && anchors.length > 1) {
    logged = true;
    console.info(
      "[capitova] particle morph mapping (uProgress → scrollY):",
      anchors.map((a, i) => ({
        uProgress: i,
        section: a.id,
        top: Math.round(a.top),
        height: Math.round(a.height),
        scrollY: Math.round(a.scroll),
      })),
    );
  }
}

export function getMorphAnchors(): readonly MorphAnchor[] {
  return anchors;
}

/**
 * Map absolute scroll position onto 0–(n-1). uProgress is exactly N when
 * section N's midpoint is at viewport center, and interpolates between.
 */
export function morphProgressFromScroll(scrollY: number): number {
  const last = anchors.length - 1;
  if (last < 1) return 0;

  if (scrollY <= anchors[0].scroll) return 0;
  if (scrollY >= anchors[last].scroll) return last;

  for (let i = 0; i < last; i++) {
    const start = anchors[i].scroll;
    const end = anchors[i + 1].scroll;
    if (scrollY >= start && scrollY < end) {
      return i + (scrollY - start) / (end - start);
    }
  }

  return last;
}
