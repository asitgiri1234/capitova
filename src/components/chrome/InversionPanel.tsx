"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { setScrollState } from "@/lib/scrollStore";

/**
 * The bone panel for the final value inversion.
 *
 * It lives at z-0 — *behind* the particle canvas (z-1) rather than inside the
 * Contact section — for one reason: a light background painted by the section
 * itself would sit at z-10 and hide the field completely, and no z-index
 * arrangement can put particles over an opaque section background while
 * keeping that section's text over the particles. Wiping a viewport-anchored
 * panel underneath the canvas gives the same visual (bone rising over the dark
 * page) and leaves the singularity readable against it.
 */
export default function InversionPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const contact = document.getElementById("contact");
    if (!contact) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        // No wipe: the panel is simply there once Contact arrives.
        ScrollTrigger.create({
          trigger: contact,
          start: "top 60%",
          onEnter: () => {
            gsap.set(panel, { clipPath: "inset(0% 0% 0% 0%)" });
            setScrollState({ inverted: true });
          },
          onLeaveBack: () => {
            gsap.set(panel, { clipPath: "inset(100% 0% 0% 0%)" });
            setScrollState({ inverted: false });
          },
        });
        return;
      }

      gsap.fromTo(
        panel,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: {
            trigger: contact,
            start: "top 85%",
            end: "top 20%",
            scrub: 0.8,
          },
        },
      );

      // Flip the HUD past the midpoint of the wipe, so its dark chrome lands
      // on bone rather than on the still-dark upper viewport.
      ScrollTrigger.create({
        trigger: contact,
        start: "top 45%",
        onEnter: () => setScrollState({ inverted: true }),
        onLeaveBack: () => setScrollState({ inverted: false }),
      });
    }, panel);

    return () => {
      ctx.revert();
      setScrollState({ inverted: false });
    };
  }, [reducedMotion]);

  return (
    <div
      ref={panelRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-bone"
      style={{ clipPath: "inset(100% 0% 0% 0%)" }}
    />
  );
}
