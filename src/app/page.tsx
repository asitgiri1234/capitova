"use client";

import { useState } from "react";
import CanvasLayer from "@/components/canvas/CanvasLayer";
import Preloader from "@/components/chrome/Preloader";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Technology from "@/components/sections/Technology";
import { NAV } from "@/lib/constants";

const PENDING = NAV.filter(
  (item) => !["about", "technology"].includes(item.id),
);

export default function Home() {
  const [heroReady, setHeroReady] = useState(false);

  return (
    <>
      {/* Mounted once, never unmounted: the field morphs behind every section. */}
      <CanvasLayer />

      <Preloader onComplete={() => setHeroReady(true)} />

      <Hero start={heroReady} />
      <About />
      <Technology />

      {PENDING.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="relative z-10 flex min-h-screen items-center px-12"
        >
          <h2 className="font-mono text-xs tracking-widest text-white/40 uppercase">
            {section.label}
          </h2>
        </section>
      ))}
    </>
  );
}
