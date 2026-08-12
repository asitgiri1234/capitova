"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { setLenis } from "@/lib/lenis";
import { resetScrollState, setScrollState } from "@/lib/scrollStore";
import { measureMorphBounds } from "@/lib/particles/morphProgress";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Dev-only: reduced motion silently disables every animation on the page,
    // and Windows "Show animations off" turns it on. Make that visible.
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[capitova] prefers-reduced-motion: ${reducedMotion ? "reduce (animations disabled)" : "no-preference"}`,
      );
    }

    // Layout shifts once webfonts swap in, and pinned triggers cache offsets.
    let fontsCancelled = false;
    document.fonts?.ready.then(() => {
      if (fontsCancelled) return;
      ScrollTrigger.refresh();
      measureMorphBounds();
    });

    // Keep the particle morph boundaries in sync with pin-driven layout.
    const onRefresh = () => measureMorphBounds();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    // Reduced motion: no Lenis at all, native scrolling stays untouched.
    // The HUD readout still needs progress, so read it off the window.
    if (reducedMotion) {
      setLenis(null);
      resetScrollState();

      const onNativeScroll = () => {
        const limit =
          document.documentElement.scrollHeight - window.innerHeight;
        setScrollState({
          progress: limit > 0 ? window.scrollY / limit : 0,
          velocity: 0,
        });
      };

      onNativeScroll();
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      window.addEventListener("resize", onNativeScroll);
      return () => {
        fontsCancelled = true;
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        window.removeEventListener("scroll", onNativeScroll);
        window.removeEventListener("resize", onNativeScroll);
      };
    }

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
    });
    setLenis(lenis);

    const onScroll = () => {
      setScrollState({ progress: lenis.progress, velocity: lenis.velocity });
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);

    // GSAP's ticker drives Lenis so both share one rAF loop and one clock.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      fontsCancelled = true;
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      setLenis(null);
      resetScrollState();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
