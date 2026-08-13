# CAPITOVA

A landing page for a precision-biology company that designs proteins computationally.

**Live:** LIVE_URL_HERE
**Repository:** https://github.com/asitgiri1234/capitova

## Overview

CAPITOVA is a single-page marketing site for a fictional computational protein design company. It is built as a continuous scroll narrative rather than a stack of independent sections: six sections, each with its own layout logic, sharing one background and one scroll timeline. The visual language is a laboratory instrument — near-black ground, hairline rules, monospaced data chrome, and no rounded corners or drop shadows anywhere.

The core concept is a single persistent WebGL particle system that sits behind the entire page and morphs through biological scale as the reader scrolls: DNA double helix, folded protein chain, node network, cell cluster, constellation, and finally a collapsed singularity at the call to action. It mounts once and never unmounts. Every section is transparent and layers over it, and the field responds to each one — shifting laterally, changing scale, and receding in opacity wherever the copy is dense — so that it reads as one continuous system rather than six disconnected background effects.

## Tech Stack

| Technology | Version | Why |
| --- | --- | --- |
| Next.js | 15.5 | App Router with server-rendered markup, so the hero headline is real text in the initial HTML and the LCP element does not wait on JavaScript. |
| TypeScript | 5.9 | `strict: true` throughout. The particle pipeline passes typed `Float32Array` buffers between modules where a silent shape mismatch would be invisible until render. |
| Tailwind CSS | 4.3 | CSS-first configuration. Every design token lives in one `@theme` block that emits both custom properties and utilities, so there is a single source of truth for colour, type, radii and easing. |
| GSAP + ScrollTrigger | 3.15 | The only library that handles pinning, scrubbing and horizontal scroll conversion reliably. ScrollTrigger owns every scroll-driven animation on the page. |
| Lenis | 1.3 | Smooth scrolling driven from the GSAP ticker rather than its own `requestAnimationFrame`, so scroll, pinning and tweens share one clock. |
| Motion | 13.1 | Component state animation only — hover, focus, press. Declarative variants that propagate to children suit card and tile interactions better than imperative timelines. |
| three | 0.185 | The particle field. Custom `ShaderMaterial` doing the morph on the GPU. |
| @react-three/fiber | 9.7 | Keeps the scene graph declarative and inside React's lifecycle, so the render loop can be gated by component state. |

## Getting Started

Requires **Node.js 20 or later** (developed on 22.13).

```bash
git clone https://github.com/asitgiri1234/capitova.git
cd capitova
npm install

npm run dev      # development server
npm run build    # production build
npm start        # serve the production build
npm run lint     # eslint
```

The development server runs at **http://localhost:3000**.

Note: do not run `npm run build` while `npm run dev` is running. Both write to `.next`, and the build overwrites the development asset manifest, which leaves the page serving a 404 for its stylesheet until the dev server is restarted.

## Project Structure

```
src/
  app/
    layout.tsx          root layout: fonts, metadata, skip link, HUD, smooth scroll
    page.tsx            the page itself: canvas layer, preloader, six sections
    globals.css         design tokens in @theme, base element styles, shared classes
    opengraph-image.tsx generated OG card
    icon.tsx            generated favicon
    robots.ts           robots.txt
    sitemap.ts          sitemap.xml

  components/
    canvas/             the persistent WebGL field
      CanvasLayer.tsx     fixed host at z-0; dynamically imports the scene
      Scene.tsx           canvas, adaptive particle budget, camera rig, frameloop gating
      ParticleField.tsx   one Points object, one draw call, six morph targets
      shaders/            vertex and fragment sources as typed template strings

    sections/           one self-contained component per page section
    chrome/             persistent overlays: HUD, preloader, mobile menu, footer
    ui/                 reusable primitives: SplitText, Reveal, Odometer, Counter,
                        MagneticButton, Scrim, CellDivisionCanvas
    providers/          SmoothScroll — Lenis wired into the GSAP ticker

  hooks/
    useReducedMotion.ts SSR-safe prefers-reduced-motion subscription
    useActiveSection.ts ScrollTrigger-driven active section id

  lib/
    constants.ts        site metadata and the navigation model
    lenis.ts            shared Lenis handle and programmatic scrolling
    scrollStore.ts      external store: progress, velocity, active section, inversion
    utils.ts            cn() — clsx plus tailwind-merge
    particles/
      targets.ts        seeded generators for the six target shapes
      morphProgress.ts  section geometry mapped onto uProgress 0–5
      composition.ts    per-section framing of the field: offset, scale, opacity
```

## Design Approach

**Colour.** The palette is near-black (`#06080B`) with bioluminescent mint (`#7BFFC4`) and a violet secondary (`#A78BFA`). Biotech design defaults to clinical white and corporate blue, which reads as pharmaceutical marketing and says nothing about the work. Mint on near-black is the colour of a fluorescence micrograph or a gel under UV — it points at the bench rather than the boardroom, and it gives the particle field something to do, since additive blending only reads on a dark ground. Separation everywhere comes from 1px hairlines at 8% white; there are no shadows, no gradients used decoratively, and no rounded corners.

**Type.** Three tiers with strictly separated jobs. Gloock, a high-contrast display serif, is used only for headings and wordmarks. The expected choice for a technical brand is a neutral grotesk, which would have made the page competent and forgettable; a display serif against monospaced data chrome creates a tension between the editorial and the instrumental that is the whole personality of the page. Gloock ships a single weight, so headings carry no bold at all — emphasis comes from size and colour, and the type system enforces that rather than working around it. Inter handles all body copy, including the long About statement where a display serif would hurt readability. Martian Mono carries every label, index, statistic unit, and piece of navigation, so anything instrument-like is immediately distinguishable from prose.

**Persistent chrome.** A fixed HUD frames the viewport at all times: corner ticks, the wordmark, section navigation, a live scroll percentage readout, and a progress rail. It never scrolls away. The page is meant to feel like an instrument display with content moving behind the glass, and a header that disappears on scroll would break that.

**Scale contrast.** Hierarchy is carried almost entirely by scale rather than weight or colour. Headlines run to 9rem while their accompanying labels sit at 10px, roughly a 14:1 ratio. That extreme jump gives every section a single unambiguous focal point and lets the supporting text stay quiet.

**Value inversion.** The page is dark for five sections and then inverts to bone for the final call to action. The light panel wipes upward on scroll rather than fading, and the HUD chrome crossfades from mint-on-black to dark-on-bone as it happens. After a long dark scroll the inversion functions as an ending — the reader arrives somewhere different, which is exactly the moment to ask for contact.

## Animation Approach

**One canvas, one draw call.** The field is a single `THREE.Points` object with one `BufferGeometry` and one `ShaderMaterial`. All six target shapes are uploaded once as separate vertex attributes (`aTarget0` through `aTarget5`), and the vertex shader interpolates between the relevant pair using a single `uProgress` uniform. Nothing is swapped, re-uploaded or re-allocated while scrolling; the morph is entirely GPU-side, so moving between two 90,000-particle shapes costs one uniform write per frame instead of a geometry rebuild. Each particle also carries its own random seed and scale, so simplex-noise drift and the cursor lens never move points in lockstep.

**Strict division of labour.** GSAP and ScrollTrigger own every scroll-driven animation — pins, scrubs, the horizontal track, the value inversion wipe. Motion owns component state only — hover, focus, press. No property is ever animated by both libraries, because two animation engines writing the same inline style produce jitter that is difficult to trace back to its cause.

**One clock.** Lenis is created once and driven from `gsap.ticker` with `lagSmoothing(0)`, and `ScrollTrigger.update()` runs on each Lenis scroll event. Running Lenis on its own `requestAnimationFrame` puts smooth scrolling and ScrollTrigger on separate clocks, which shows up as pinned sections drifting a frame behind the content.

**Composition per section.** The field is never centred behind a text column. A composition table maps each section to a lateral offset, vertical offset, scale and opacity — pushed right behind the hero, hard left and shrunk to 75% behind the dense About statement, lifted above the statistics in Impact. The table is sampled at fractional progress, so the framing crossfades along the same axis as the morph.

**Nothing snaps.** `uProgress`, the field's position, scale and opacity are all lerped toward their targets rather than assigned. The field arrives slightly after the reader does, and that lag is the effect. Section boundaries are computed from real element geometry — including the pin spacers that ScrollTrigger inserts, which are what actually occupy scroll distance for a pinned section — rather than an even division of page height.

## Performance

- The hero headline is server-rendered text present in view source. Only the transform is applied client-side, so the LCP element never waits on hydration.
- The 3D scene is dynamically imported with `ssr: false` and a null loading state, keeping three.js out of the initial bundle and off the critical path.
- Device pixel ratio is capped at 1.75, which is where additional particle density stops being visible and starts costing fill rate.
- Particle count is chosen once on mount from viewport width and `hardwareConcurrency`: 90,000 on desktop with 8 or more cores, 55,000 on lower-core desktops, 40,000 on tablet, 22,000 on mobile.
- The render loop stops entirely when the tab is hidden, and the reduced-motion path renders on demand rather than continuously.
- The material uses additive blending with `depthWrite: false`, so there is no depth sort for a fully transparent point cloud.
- Fonts are self-hosted through `next/font` with `display: swap` and no external font requests.
- Every GSAP timeline is created inside `gsap.context` and reverted on unmount; pinned sections are created inside `gsap.matchMedia` so they are torn down cleanly on resize.
- Counters reserve their final width in `ch` units before animating, so digits changing width never shift layout.

Production build: **214 kB** First Load JS for the route.

| Metric | Score |
| --- | --- |
| Performance | TBD |
| Accessibility | TBD |
| Best Practices | TBD |
| SEO | TBD |
| LCP | TBD |
| CLS | TBD |

Lighthouse figures to be filled in from a production run against the deployed URL.

## Accessibility

- Semantic landmarks throughout: `header`, `main`, `nav`, `footer`. One `h1`, an `h2` per section, and no skipped heading levels.
- A skip link is the first element in the body, visible on focus, targeting `#main`.
- The canvas layer is `aria-hidden` with `role="presentation"` and is not focusable — it is decoration and is announced as nothing.
- `SplitText` splits by word, never by character, and carries the complete sentence as an `aria-label` on the wrapper while the visual word spans are `aria-hidden`. The headline announces as one coherent sentence.
- Animated counters expose a static `aria-label` with the final value and are marked `aria-live="off"`, so a screen reader announces "4.2M" once rather than every intermediate frame.
- A 2px mint focus ring at 2px offset is visible on every interactive element, overridden to dark on the inverted section where mint would be invisible against bone.
- Body text meets a 4.5:1 contrast floor against its effective background, including the worst case of dense particles behind it; local scrims protect the text that sits over the field.
- The mobile menu is a modal dialog with a focus trap, Escape to close, scroll lock, and focus returned to the toggle on close.
- `prefers-reduced-motion` is a designed path, not a switch that turns things off. Every component branches on it and renders its complete final state: the preloader is skipped, pinning and scrubbing are replaced by static layout, the marquee stops as a legible row, the mitosis canvas renders a single mid-division frame, and the particle field holds a still shape per section. The page is complete and composed with no motion at all.

## Responsive Behaviour

Horizontal inset is defined once as a shared class — 24px, 40px, 64px — so sections cannot drift apart.

| Breakpoint | Behaviour |
| --- | --- |
| < 768px | Technology's horizontal pinned track becomes a vertical stack, and the ScrollTrigger timeline is never created rather than merely hidden. About's pin is likewise not created — a 240vh pinned section on a phone is a scroll trap. HUD corner ticks and the progress rail are hidden; navigation collapses to a MENU toggle opening a full-screen overlay. The particle field reduces in scale and opacity. Interactive targets are 44×44 minimum under coarse pointers. |
| 768px – 1023px | Bento grid moves to a six-column layout with the hero tile full width. Statistics become 2×2. Horizontal pinning and the desktop navigation are active. |
| ≥ 1024px | Full twelve-column bento grid, four-column statistics row, complete HUD with corner ticks, scroll readout and progress rail. |
| ≥ 1440px | Layout is capped at a 7xl container and centres; type reaches its clamp maxima. |

## Credits

Typefaces are served through `next/font/google`:

- [Gloock](https://fonts.google.com/specimen/Gloock) — display serif, 400
- [Inter](https://fonts.google.com/specimen/Inter) — body, 400 and 500
- [Martian Mono](https://fonts.google.com/specimen/Martian+Mono) — data and chrome, 400 and 500
- [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) — italic accent, 400

All visuals are generated procedurally in code. There is no stock imagery, no icon library and no raster assets: the particle field is a custom shader, the mitosis animation in the Capabilities tile is a 2D canvas drawing the union of two circles, and the social card is generated at build time with `next/og`.
