import { NAV } from "@/lib/constants";

const SECTIONS = [{ id: "hero", label: "Hero" }, ...NAV];

export default function Home() {
  return (
    <>
      {SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="flex min-h-screen items-center px-6 md:px-12"
        >
          <h2 className="font-mono text-xs tracking-widest text-white/40 uppercase">
            {section.label}
          </h2>
        </section>
      ))}
    </>
  );
}
