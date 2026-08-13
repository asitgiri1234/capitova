"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import CellDivisionCanvas from "@/components/ui/CellDivisionCanvas";
import Scrim from "@/components/ui/Scrim";
import { cn } from "@/lib/utils";

type Tile = {
  index: string;
  title: string;
  body: string;
  tags: string[];
  span: string;
  hero?: boolean;
};

const TILES: Tile[] = [
  {
    index: "01",
    title: "Protein Engineering",
    body: "Directed evolution and de novo backbone design, iterated against binding and stability objectives.",
    tags: ["Design", "Evolution", "Binders"],
    span: "md:col-span-6 lg:col-span-7 lg:row-span-2",
    hero: true,
  },
  {
    index: "02",
    title: "Assay Automation",
    body: "Liquid handling and plate logistics run unattended, with every result written back to the design loop.",
    tags: ["Robotics", "LIMS"],
    span: "md:col-span-3 lg:col-span-5",
  },
  {
    index: "03",
    title: "Structural Biology",
    body: "Cryo-EM and crystallography in-house, resolving the structures our models are scored against.",
    tags: ["Cryo-EM", "Crystallography"],
    span: "md:col-span-3 lg:col-span-5",
  },
  {
    index: "04",
    title: "Data Infrastructure",
    body: "A single versioned substrate for sequence, structure and assay data across every program.",
    tags: ["Pipelines", "Versioning"],
    span: "md:col-span-3 lg:col-span-4",
  },
  {
    index: "05",
    title: "Regulatory & QA",
    body: "ISO 13485 quality systems and documentation maintained alongside the science, not after it.",
    tags: ["ISO 13485", "Audit"],
    span: "md:col-span-3 lg:col-span-4",
  },
  {
    index: "06",
    title: "Translational Medicine",
    body: "Candidate selection informed by pharmacology and clinical feasibility from the first design cycle.",
    tags: ["Pharmacology", "Clinical"],
    span: "md:col-span-3 lg:col-span-4",
  },
];

export default function Capabilities() {
  const reducedMotion = useReducedMotion();
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarsePointer(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const interactive = !reducedMotion && !coarsePointer;

  return (
    <section id="capabilities" className="relative z-10 container-page py-32">
      <div className="mx-auto w-full max-w-7xl">
        <Scrim contentClassName="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-4 font-mono text-xs tracking-widest text-white/50 uppercase">
              <span aria-hidden="true" className="block h-px w-12 bg-mint" />
              03 / Capabilities
            </p>
            <h2 className="mt-8 font-display text-[clamp(2.25rem,5vw,3.8rem)] leading-[1.0] tracking-[-0.01em] text-bone">
              What we run in-house.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/55 lg:text-right">
            Every step from sequence to validated candidate happens under one
            roof, so a design decision and its wet-lab answer are days apart
            rather than quarters.
          </p>
        </Scrim>

        {/* gap-px over a white/8 ground: the gaps themselves are the hairlines */}
        <div className="mt-16 grid grid-cols-1 gap-px bg-white/8 md:grid-cols-6 lg:grid-cols-12">
          {TILES.map((tile) => (
            <BentoTile
              key={tile.index}
              tile={tile}
              interactive={interactive}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoTile({
  tile,
  interactive,
  reducedMotion,
}: {
  tile: Tile;
  interactive: boolean;
  reducedMotion: boolean;
}) {
  const hover = interactive ? "hover" : undefined;

  return (
    <motion.article
      initial="rest"
      animate="rest"
      whileHover={hover}
      whileFocus={hover}
      tabIndex={0}
      variants={{
        rest: {
          backgroundColor: "rgb(6, 8, 11)",
          borderColor: "rgba(6, 8, 11, 0)",
        },
        hover: {
          backgroundColor: "rgb(12, 16, 21)",
          borderColor: "rgba(123, 255, 196, 0.3)",
        },
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative flex min-h-[280px] flex-col justify-between border border-transparent bg-void p-8",
        tile.hero && "min-h-[420px] lg:min-h-[560px]",
        tile.span,
      )}
    >
      <div className="relative z-10">
        <motion.span
          variants={{
            rest: { color: "rgba(255,255,255,0.25)" },
            hover: { color: "#7BFFC4" },
          }}
          transition={{ duration: 0.4 }}
          className="font-mono text-xs tracking-widest uppercase tabular-nums"
        >
          {tile.index}
        </motion.span>

        <motion.h3
          variants={{ rest: { x: 0 }, hover: { x: 4 } }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-2xl font-medium tracking-tight text-bone"
        >
          {tile.title}
        </motion.h3>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
          {tile.body}
        </p>
      </div>

      {tile.hero ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-1/2 bottom-24 z-0 -translate-y-1/4"
        >
          <CellDivisionCanvas />
        </div>
      ) : null}

      <div className="relative z-10 mt-8 flex flex-wrap gap-2">
        {tile.tags.map((tag) => (
          <span
            key={tag}
            className="border border-white/12 px-2 py-1 font-mono text-[10px] tracking-widest text-white/60 uppercase"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* bottom edge line, drawn left to right on hover */}
      <motion.span
        aria-hidden="true"
        variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "left center" }}
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 block h-px bg-mint",
          reducedMotion && "hidden",
        )}
      />
    </motion.article>
  );
}
