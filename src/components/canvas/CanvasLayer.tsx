"use client";

import dynamic from "next/dynamic";

// Never server-rendered, never part of LCP: the field is decoration.
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => null,
});

export default function CanvasLayer() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="pointer-events-none fixed inset-0 z-0"
    >
      <Scene />
    </div>
  );
}
