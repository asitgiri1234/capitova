"use client";

import { useState } from "react";
import CanvasLayer from "@/components/canvas/CanvasLayer";
import Preloader from "@/components/chrome/Preloader";
import Footer from "@/components/chrome/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Technology from "@/components/sections/Technology";
import Capabilities from "@/components/sections/Capabilities";
import Impact from "@/components/sections/Impact";
import Contact from "@/components/sections/Contact";

export default function Home() {
  const [heroReady, setHeroReady] = useState(false);

  return (
    <>
      

      {/* z-0: mounted once, never unmounted — morphs behind every section */}
      <CanvasLayer />

      <Preloader onComplete={() => setHeroReady(true)} />

      <Hero start={heroReady} />
      <About />
      <Technology />
      <Capabilities />
      <Impact />
      <Contact />
      <Footer />
    </>
  );
}
