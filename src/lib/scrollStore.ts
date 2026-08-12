"use client";

import { useSyncExternalStore } from "react";

export type ScrollState = {
  /** 0–1 progress through the full scrollable page. */
  progress: number;
  /** Signed scroll velocity, px/frame-ish (Lenis units). */
  velocity: number;
  /** id of the section currently occupying the viewport. */
  activeSection: string;
  /** true while the light (bone) panel owns the viewport. */
  inverted: boolean;
};

const INITIAL: ScrollState = {
  progress: 0,
  velocity: 0,
  activeSection: "hero",
  inverted: false,
};

let state: ScrollState = INITIAL;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/**
 * Merge a partial update. Values are quantized before comparison so a scroll
 * frame that does not visibly change the HUD does not trigger a React render.
 */
export function setScrollState(partial: Partial<ScrollState>) {
  const next: ScrollState = {
    progress:
      partial.progress === undefined
        ? state.progress
        : Math.round(clamp01(partial.progress) * 1000) / 1000,
    velocity:
      partial.velocity === undefined
        ? state.velocity
        : Math.round(partial.velocity * 100) / 100,
    activeSection: partial.activeSection ?? state.activeSection,
    inverted: partial.inverted ?? state.inverted,
  };

  if (
    next.progress === state.progress &&
    next.velocity === state.velocity &&
    next.activeSection === state.activeSection &&
    next.inverted === state.inverted
  ) {
    return;
  }

  state = next;
  emit();
}

export function resetScrollState() {
  state = INITIAL;
  emit();
}

export function getScrollState(): ScrollState {
  return state;
}

function getServerSnapshot(): ScrollState {
  return INITIAL;
}

export function subscribeScrollState(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useScrollStore(): ScrollState {
  return useSyncExternalStore(
    subscribeScrollState,
    getScrollState,
    getServerSnapshot,
  );
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return n < 0 ? 0 : n > 1 ? 1 : n;
}
