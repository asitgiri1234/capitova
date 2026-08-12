"use client";

import dynamic from "next/dynamic";

// Never server-rendered, never part of LCP: the field is decoration.
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => null,
});

export default function CanvasLayer() {
  // z-[1] sits above the bone inversion panel (z-0) and below sections (z-10),
  // so the field stays visible once the page inverts.
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="pointer-events-none fixed inset-0 z-[1]"
    >
      <Scene />
    </div>
  );
}
