"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHoverCapable } from "@/hooks/useHoverCapable";
import Counter from "@/components/ui/Counter";
import Reveal from "@/components/ui/Reveal";
import Scrim from "@/components/ui/Scrim";

type Card = {
  index: string;
  title: string;
  body: string;
  value: number;
  decimals?: number;
  unit: string;
};

const CARDS: Card[] = [
  {
    index: "01",
    title: "Structure prediction",
    body: "Atomic-resolution folding from raw sequence, validated against cryo-EM ground truth.",
    value: 4.2,
    decimals: 1,
    unit: "Million structures",
  },
  {
    index: "02",
    title: "Generative design",
    body: "Diffusion models that generate novel backbones conditioned on target binding sites.",
    value: 38000,
    unit: "Candidates per run",
  },
  {
    index: "03",
    title: "Automated synthesis",
    body: "Closed-loop robotic expression and purification, running continuously without human handoff.",
    value: 24,
    unit: "Hour cycle",
  },
  {
    index: "04",
    title: "In-silico assay",
    body: "Molecular dynamics screening that eliminates 94% of failures before they reach the bench.",
    value: 94,
    unit: "Percent filtered",
  },
];

export default function Technology() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const hoverable = useHoverCapable();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    // matchMedia keeps the pin desktop-only and reverts it cleanly on resize.
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const distance = () => Math.max(track.scrollWidth - window.innerWidth, 0);

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // Card widths are clamp()-based, so track length moves with the viewport.
      const observer = new ResizeObserver(() => ScrollTrigger.refresh());
      observer.observe(track);

      return () => {
        observer.disconnect();
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { x: 0 });
      };
    });

    return () => mm.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="technology"
      className="relative z-10 md:h-[100dvh] md:overflow-hidden"
    >
      <div
        ref={trackRef}
        className="flex flex-col gap-4 container-page section-y md:h-full md:flex-row md:flex-nowrap md:items-stretch md:gap-8"
      >
        <Scrim
          className="shrink-0 md:w-[clamp(360px,40vw,560px)] md:pr-16"
          contentClassName="flex h-full flex-col justify-center"
        >
          <p className="flex items-center gap-4 font-mono text-xs tracking-widest text-white/50 uppercase">
            <span aria-hidden="true" className="block h-px w-12 bg-mint" />
            02 / Research
          </p>
          <h2 className="mt-8 font-display text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.0] tracking-[-0.01em] text-bone">
            Four systems, one pipeline.
          </h2>
        </Scrim>

        {CARDS.map((card, index) => (
          <Reveal
            key={card.index}
            delay={index * 0.05}
            className="shrink-0 md:h-full"
          >
            <TechCard card={card} reducedMotion={reducedMotion} hoverable={hoverable} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TechCard({
  card,
  reducedMotion,
  hoverable,
}: {
  card: Card;
  reducedMotion: boolean;
  hoverable: boolean;
}) {
  // Touch reports a synthetic hover on tap; without this the lift sticks.
  const hover = reducedMotion || !hoverable ? undefined : "hover";

  return (
    <motion.article
      initial="rest"
      animate="rest"
      whileHover={hover}
      whileFocus={hover}
      tabIndex={0}
      variants={{
        rest: { y: 0, borderColor: "rgba(255,255,255,0.1)" },
        hover: { y: -6, borderColor: "rgba(123,255,196,0.4)" },
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full w-full flex-col border border-white/10 bg-surface/75 p-6 backdrop-blur-[3px] md:w-[clamp(320px,32vw,440px)] md:p-8"
    >
      <motion.span
        variants={{
          rest: { color: "rgba(255,255,255,0.3)" },
          hover: { color: "#7BFFC4" },
        }}
        transition={{ duration: 0.3 }}
        className="font-mono text-xs tracking-widest uppercase tabular-nums"
      >
        {card.index}
      </motion.span>

      <span aria-hidden="true" className="mt-6 block h-px w-full bg-white/10" />

      <h3 className="mt-5 text-2xl font-medium tracking-tight text-bone md:mt-6 md:text-3xl">
        {card.title}
      </h3>

      <p className="mt-4 text-[15px] leading-relaxed text-white/55 md:text-sm">{card.body}</p>

      <div className="mt-auto pt-8 md:pt-10">
        <div className="font-mono text-4xl text-bone tabular-nums md:text-5xl">
          <Counter value={card.value} decimals={card.decimals ?? 0} />
        </div>
        <div className="mt-3 font-mono text-xs tracking-widest text-mint uppercase">
          {card.unit}
        </div>
      </div>
    </motion.article>
  );
}
