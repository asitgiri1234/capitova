# CAPITOVA

Landing page for CAPITOVA, a precision-biology / computational protein design company.
Aesthetic: dark, technical, laboratory-instrument. Sharp edges, hairline rules, monospaced chrome.

## Stack

| Concern         | Choice                                                  |
| --------------- | ------------------------------------------------------- |
| Framework       | Next.js 15, App Router, React 19                          |
| Language        | TypeScript, `strict: true`                                |
| Styling         | Tailwind CSS v4 (CSS-first config via `@theme`)           |
| Scroll          | Lenis (smooth scroll), driven from `gsap.ticker`          |
| Scroll animation| GSAP + ScrollTrigger                                      |
| State animation | Motion (`motion/react`)                                   |
| 3D              | three, @react-three/fiber, @react-three/drei              |
| Class merging   | clsx + tailwind-merge via `cn()`                          |
| Lint            | ESLint (`eslint-config-next`)                             |

Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run lint`.

> **Never run `npm run build` while `npm run dev` is running.** Both write to `.next`,
> and the build overwrites the dev server's asset manifest — the page then loads with
> `/_next/static/css/app/layout.css` returning 404 and renders completely unstyled
> (serif text, white background, blue links). The fix is to restart the dev server.

## Design tokens

All tokens live in `src/app/globals.css` inside a single `@theme` block, which emits them
as CSS custom properties **and** generates Tailwind utilities.

### Color

| Token             | Value     | Utility examples          |
| ----------------- | --------- | ------------------------- |
| `--color-void`    | `#06080B` | `bg-void`, `text-void`    |
| `--color-surface` | `#0C1015` | `bg-surface`              |
| `--color-mint`    | `#7BFFC4` | `text-mint`, `border-mint`|
| `--color-violet`  | `#A78BFA` | `text-violet`             |
| `--color-bone`    | `#EDEAE4` | `text-bone`               |
| `--color-muted`   | `#6B7280` | `text-muted`              |

### Radii

| Token           | Value |
| --------------- | ----- |
| `--radius-sm`   | `2px` |
| `--radius-md`   | `4px` |

Radii exist for hairline-precise edges only. They are not a license to round anything.

### Easing

| Token                   | Value                            |
| ----------------------- | -------------------------------- |
| `--ease-out-expo`       | `cubic-bezier(0.16, 1, 0.3, 1)`  |
| `--ease-in-out-quart`   | `cubic-bezier(0.76, 0, 0.24, 1)` |

### Type

Three tiers, all loaded with `next/font/google` in `src/app/layout.tsx`, exposed as CSS
variables on `<html>`, and mapped onto Tailwind's font namespace by `@theme`.

| Token             | Family                    | Weights | Used for                                              |
| ----------------- | ------------------------- | ------- | ----------------------------------------------------- |
| `--font-display`  | Gloock                    | **400 only** | `h1`, `h2`, hero and Contact headlines, wordmarks |
| `--font-body`     | Inter                     | 400/500 | all prose, card titles and body, the About statement   |
| `--font-mono`     | Martian Mono              | 400/500 | labels, eyebrows, indices, nav, HUD, marquee, footer   |
| `--font-serif`    | Instrument Serif *italic* | 400     | the About accent words only                            |

`--font-body` is set on `body`; headings opt into `font-display` explicitly.

> **Gloock has exactly one weight.** Never put `font-medium`, `font-semibold` or
> `font-bold` on an element using `--font-display` — the browser synthesises a fake bold
> and the serifs smear. Emphasis in headings comes from size and color, never weight.
>
> Gloock is also heavy and tightly spaced, so display type carries its own metrics:
> letter-spacing around `-0.015em` (not `-0.04em`, which collides the serifs), line-height
> no tighter than `0.95`, and descender clearance on any `overflow-hidden` clip box
> (see `SplitText`). Martian Mono is wider than a typical mono — chrome tracking is
> `0.12em`, not `0.2em`.

## File structure

```
src/
  app/
    layout.tsx        root layout: fonts, metadata, skip link, HUD, SmoothScroll, <main id="main">
    globals.css       @theme tokens, base element styles, a11y rules
    page.tsx          landing page — canvas layer, preloader, sections
  components/
    canvas/           the persistent WebGL field
      CanvasLayer.tsx   fixed z-0 host; dynamic-imports Scene (ssr: false)
      Scene.tsx         <Canvas>, adaptive particle budget, rig, frameloop gating
      ParticleField.tsx one Points, one draw call, six morph targets
      shaders/          vertex + fragment sources as typed strings
    chrome/           persistent overlays (HUD, preloader)
    providers/        SmoothScroll (Lenis + gsap.ticker + ScrollTrigger sync)
    sections/         one file per page section, self-contained
    ui/               reusable primitives (Reveal, SplitText, MagneticButton, Counter)
  hooks/
    useReducedMotion.ts   SSR-safe prefers-reduced-motion boolean
    useActiveSection.ts   ScrollTrigger-driven active section id
  lib/
    constants.ts      SITE metadata, NAV section list
    lenis.ts          shared Lenis handle + scrollToSection()
    scrollStore.ts    useSyncExternalStore store: progress, velocity, activeSection
    utils.ts          cn() — clsx + tailwind-merge
    particles/
      targets.ts        seeded target-shape generators (helix … singularity)
      morphProgress.ts  section offsets → uProgress 0–5
```

### Scroll architecture

Lenis is created once in `SmoothScroll` and driven from `gsap.ticker` — never from a
bare `requestAnimationFrame`, so Lenis, ScrollTrigger and every tween share one clock.
`ScrollTrigger.update()` runs on each Lenis scroll event. `ScrollTrigger.refresh()` is
called after webfonts settle, and morph boundaries are re-measured on every refresh so
pinned sections do not desync the particle field.

### Stacking order

| z      | Element                                                             |
| ------ | ------------------------------------------------------------------- |
| `0`    | `CanvasLayer` — the persistent particle field                        |
| `10`   | every section, plus the footer                                       |
| `40`   | `Hud`                                                                |
| `50`   | `Preloader`, and the mobile menu overlay                             |

Dark sections never paint a background — they stay transparent over `body` so the field
shows through. The light state belongs to Contact and Footer alone: Contact wipes a bone
panel that is `absolute inset-0` **inside its own section**, and Footer sets `bg-bone`
directly. A viewport-fixed panel was tried and reverted — being viewport-sized, it painted
bone over Impact while Impact was still on screen. The cost of scoping it to the section is
that particles do not show through the bone; that is the intended trade.

### Shared layout classes

Two classes in `@layer components` must be used rather than re-derived per section:

- `.container-page` — the site's horizontal inset (24px / 40px / 64px). Never write
  `px-*` on a section root; sections drifting apart is exactly what this prevents.
- `.tap-target` — 44×44 minimum, applied only under `(pointer: coarse)` so the desktop
  chrome keeps its 10–12px mono scale. Every interactive element outside the main CTAs
  needs it.

Pinned sections (`About`, `Technology`) create their ScrollTriggers inside
`gsap.matchMedia("(min-width: 768px)")`. A pin must never be created below md — a 240vh
pinned section on a phone is a scroll trap, not an effect.

### CSS layers

Element-level rules in `globals.css` (`a`, `ul`, `:focus-visible`, `body`) must stay
inside `@layer base`. Unlayered CSS outranks *every* Tailwind utility, so an unlayered
`a { text-decoration: none }` silently defeats `underline`, and an unlayered
`:focus-visible { outline: … mint }` defeats a per-component focus ring — which matters
on the bone section, where a mint ring is invisible.

### WebGL rules

- One `THREE.Points`, one geometry, one `ShaderMaterial`, one draw call. Adding a second
  particle system is a regression, not a feature.
- Particle count is chosen once on mount from viewport width and `hardwareConcurrency`.
- The render loop must stop when the tab is hidden (`frameloop="never"`), and reduced
  motion renders exactly one frame (`frameloop="demand"`) — a still helix.
- `uProgress` is always lerped toward its target, never snapped. The lag is the effect.

## Non-negotiable rules

1. **GSAP + ScrollTrigger owns all scroll-driven animation. Motion owns component state
   animation only (hover, press, presence, layout).** Never animate the same property with
   both libraries — they will fight over the same inline style and produce jitter.
2. **Every animated component must branch on `useReducedMotion()`** and render a static,
   complete final state when it returns `true`. Not a shortened animation — no animation, and
   the element already at its end state.
3. **No rounded corners, no drop shadows, no gradients used as decoration.** Separation comes
   from hairline borders only: 1px, white at 8% opacity (`border border-white/8`). Gradients are
   permitted only when they carry meaning (e.g. a data ramp), never as ambient polish.
4. **All numeric, label, and UI-chrome text uses `font-mono uppercase tracking-widest text-xs`.**
   Prose uses the display font; anything instrument-like is mono.
5. **Sections are self-contained components in `src/components/sections/`; primitives live in
   `src/components/ui/`.** A section owns its own layout, copy, and animation, and is dropped into
   `page.tsx` with no props-plumbing from the page.

## Accessibility baseline

- `:focus-visible` shows a 2px mint outline at 2px offset — never remove it.
- The skip link is the first element in `<body>` and must stay there.
- The reduced-motion media query in `globals.css` neutralizes animation and transition
  durations globally; component-level branching (rule 2) is still required, because it also
  governs GSAP timelines, which CSS cannot reach.
