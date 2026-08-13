"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/constants";
import { scrollToSection } from "@/lib/lenis";

type Link = { label: string; href: string; section?: string };

const COLUMNS: { title: string; links: Link[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "#about", section: "about" },
      { label: "Research", href: "#technology", section: "technology" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Platform",
    links: [
      {
        label: "Structure Prediction",
        href: "#technology",
        section: "technology",
      },
      { label: "Generative Design", href: "#" },
      { label: "Automated Synthesis", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Accessibility", href: "#" },
    ],
  },
];

/** UTC clock. Renders a stable placeholder until mounted — never on the server. */
function UtcClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, "0");
      const mm = String(now.getUTCMinutes()).padStart(2, "0");
      const ss = String(now.getUTCSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };

    read();
    const id = window.setInterval(read, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      UTC {time ?? "--:--:--"}
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-void/15 bg-bone text-void">
      <div className="mx-auto w-full max-w-7xl container-page pt-20">
        <div className="flex flex-wrap justify-between gap-12">
          <div className="font-display text-2xl tracking-[-0.01em]">
            {SITE.name}
          </div>

          <div className="flex flex-wrap gap-16">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <div className="font-mono text-xs tracking-widest text-void/65 uppercase">
                  {column.title}
                </div>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <a
                        href={link.href}
                        onClick={
                          link.section
                            ? (event) => {
                                event.preventDefault();
                                scrollToSection(link.section as string);
                              }
                            : undefined
                        }
                        className="tap-target font-mono text-xs tracking-widest text-void/65 uppercase transition-colors duration-200 hover:text-void"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* watermark wordmark, flush to the bottom edge */}
      <div className="overflow-hidden container-page">
        <div
          aria-hidden="true"
          className="mt-16 -mb-[0.14em] whitespace-nowrap font-display text-[clamp(4rem,18vw,16rem)] leading-none tracking-[-0.02em] text-void/5"
        >
          {SITE.name}
        </div>
      </div>

      <div className="border-t border-void/15">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 container-page py-6 font-mono text-[10px] tracking-[0.12em] text-void/65 uppercase md:flex-row md:justify-between md:gap-0">
          <span>© 2026 Capitova Biosciences</span>
          <UtcClock />
          <span>52.5200° N, 13.4050° E</span>
        </div>
      </div>
    </footer>
  );
}
