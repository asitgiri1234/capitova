"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setScrollState } from "@/lib/scrollStore";

/**
 * One ScrollTrigger per section id; whichever section is entered (forward or
 * backward) becomes the active section in the scroll store.
 */
export function useActiveSection(ids: readonly string[]) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;

        ScrollTrigger.create({
          trigger: el,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => setScrollState({ activeSection: id }),
          onEnterBack: () => setScrollState({ activeSection: id }),
        });
      }
    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [ids]);
}

export default useActiveSection;
