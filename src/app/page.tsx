"use client";

import { useState } from "react";
import Preloader from "@/components/chrome/Preloader";
import Hero from "@/components/sections/Hero";
import { NAV } from "@/lib/constants";

export default function Home() {
  const [heroReady, setHeroReady] = useState(false);

  return (
    <>
      <Preloader onComplete={() => setHeroReady(true)} />

      <Hero start={heroReady} />

      {NAV.map((section) => (
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
