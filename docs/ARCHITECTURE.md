# Architecture notes

Working notes on how CAPITOVA is put together and the conventions I hold it to. The
README covers what the site is; this covers why the code looks the way it does, and the
handful of rules that are load-bearing rather than stylistic.

## Stack

| Concern          | Choice                                          |
| ---------------- | ----------------------------------------------- |
| Framework        | Next.js 15, App Router, React 19                 |
| Language         | TypeScript, `strict: true`                       |
| Styling          | Tailwind CSS v4, CSS-first config via `@theme`   |
| Scroll           | Lenis, driven from `gsap.ticker`                 |
| Scroll animation | GSAP + ScrollTrigger                             |
| State animation  | Motion (`motion/react`)                          |
| 3D               | three, @react-three/fiber, @react-three/drei     |
| Class merging    | clsx + tailwind-merge via `cn()`                 |

Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run lint`.

I never run `npm run build` while the dev server is up. Both write to `.next`, and the
build overwrites the dev server's asset manifest — the page then loads with
`/_next/static/css/app/layout.css` returning 404 and renders completely unstyled, which
looks like a Tailwind configuration failure and is not one. Restarting the dev server is
the fix.

## Design tokens

Every token lives in one `@theme` block in `src/app/globals.css`, which emits them as CSS
custom properties and generates the matching Tailwind utilities.

### Colour

| Token             | Value     | Utilities                  |
| ----------------- | --------- | -------------------------- |
| `--color-void`    | `#06080B` | `bg-void`, `text-void`     |
| `--color-surface` | `#0C1015` | `bg-surface`               |
| `--color-mint`    | `#7BFFC4` | `text-mint`, `border-mint` |
| `--color-violet`  | `#A78BFA` | `text-violet`              |
| `--color-violet-deep` | `#4C3D8F` | inverted-state accent  |
| `--color-bone`    | `#EDEAE4` | `text-bone`                |
| `--color-muted`   | `#6B7280` | `text-muted`               |

### Radii and easing

`--radius-sm: 2px`, `--radius-md: 4px`. These exist for hairline-precise edges, not as
permission to round anything.

`--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` and
`--ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1)`.

### Type

| Token            | Family                    | Weights      | Used for                                            |
| ---------------- | ------------------------- | ------------ | --------------------------------------------------- |
| `--font-display` | Gloock                    | **400 only** | `h1`, `h2`, hero and Contact headlines, wordmarks   |
| `--font-body`    | Inter                     | 400/500      | all prose, card titles and body, the About statement |
| `--font-mono`    | Martian Mono              | 400/500      | labels, eyebrows, indices, nav, HUD, marquee, footer |
| `--font-serif`   | Instrument Serif *italic* | 400          | the About accent words only                          |

`--font-body` is set on `body`; headings opt into `font-display` explicitly.

Gloock has exactly one weight. `font-medium`, `font-semibold` and `font-bold` must never
land on an element using `--font-display` — the browser synthesises a fake bold and the
serifs smear. Emphasis in headings comes from size and colour. Preflight resets headings
to `font-weight: inherit`, and `.font-display` additionally sets
`font-synthesis-weight: none` as a backstop.

Gloock is heavy and tightly spaced, so display type carries its own metrics: tracking
around `-0.015em` rather than `-0.04em`, which collides the serifs; line-height no tighter
than `0.95`; and descender clearance on any `overflow-hidden` clip box. Martian Mono runs
wider than most monos, so chrome tracking is `0.12em`, not `0.2em`.

## Layout

```
src/
  app/          layout, page, tokens, and the generated OG/icon/robots/sitemap routes
  components/
    canvas/     the persistent WebGL field and its shaders
    chrome/     persistent overlays: HUD, preloader, mobile menu, footer
    providers/  SmoothScroll — Lenis wired into the GSAP ticker
    sections/   one self-contained component per page section
    ui/         reusable primitives
  hooks/        useReducedMotion, useActiveSection
  lib/          constants, lenis handle, scroll store, utils, particles/
```

Sections are self-contained: a section owns its layout, copy and animation, and drops
into `page.tsx` with no props plumbed from the page. Primitives live in `ui/`.

Two shared classes in `@layer components` must be used rather than re-derived:

- `.container-page` — the horizontal inset (24/40/64px). No `px-*` on a section root;
  sections drifting apart is exactly what this prevents.
- `.tap-target` — 44×44 minimum, only under `(pointer: coarse)`, so desktop chrome keeps
  its 10–12px mono scale.

## Scroll

Lenis is created once in `SmoothScroll` and driven from `gsap.ticker` with
`lagSmoothing(0)` — never from a bare `requestAnimationFrame`, so Lenis, ScrollTrigger and
every tween share one clock. `ScrollTrigger.update()` runs on each Lenis scroll event.
`ScrollTrigger.refresh()` fires after webfonts settle and after the canvas mounts, and the
morph boundaries are re-measured on every refresh.

Pinned sections (About, Technology) create their ScrollTriggers inside
`gsap.matchMedia("(min-width: 768px)")`. A pin must never be created below md — a 240vh
pinned section on a phone is a scroll trap, not an effect.

## Stacking order

| z    | Element                                     |
| ---- | ------------------------------------------- |
| `0`  | `CanvasLayer` — the persistent particle field |
| `10` | every section, plus the footer               |
| `40` | `Hud`                                        |
| `50` | `Preloader` and the mobile menu overlay      |

Dark sections never paint a background — they stay transparent over `body` so the field
shows through. The light state belongs to Contact and Footer alone: Contact wipes a bone
panel that is `absolute inset-0` inside its own section, and Footer sets `bg-bone`
directly.

I tried a viewport-fixed bone panel beneath the canvas so particles would show through the
inversion. It bled light across Impact while Impact was still on screen, because a fixed
element is viewport-sized by definition and the wipe is driven by Contact's approach.
Scoping the panel to its section costs the show-through and is the right trade.

## CSS layers

Element-level rules (`a`, `ul`, `:focus-visible`, `body`) belong inside `@layer base`.
Unlayered CSS outranks every Tailwind utility, so an unlayered
`a { text-decoration: none }` silently defeats `underline`, and an unlayered
`:focus-visible { outline: … mint }` defeats a per-component focus ring — which matters on
the bone section, where a mint ring is invisible.

## The particle field

- One `THREE.Points`, one geometry, one `ShaderMaterial`, one draw call. A second particle
  system would be a regression, not a feature.
- All six targets ship as vertex attributes and the morph happens in the vertex shader.
  Nothing is re-uploaded during scroll.
- Particle count is chosen once on mount from viewport width and `hardwareConcurrency`.
- The loop stops when the tab is hidden; reduced motion renders on demand.
- `uProgress` is always lerped toward its target, never snapped. The lag is the effect.

`morphProgress.ts` maps scroll position onto 0–5, hitting exactly N when section N's
midpoint reaches viewport centre. It measures the `.pin-spacer` that ScrollTrigger inserts
around a pinned section, not the section itself — the spacer is what occupies the scroll
distance, and measuring the section makes every boundary after a pinned section wrong.
Anchors are forced monotonic because a section measured mid-pin can report a rect that
breaks ordering.

`composition.ts` frames the field per section: lateral offset, vertical offset, scale and
opacity, sampled at fractional progress so framing crossfades along the same axis as the
morph. The field is never centred behind a text column. The offset lives on an outer group
and the slow Y rotation on an inner group — putting both on one group makes an offset field
orbit the origin.

## Rules I do not break

1. **GSAP + ScrollTrigger owns all scroll-driven animation. Motion owns component state
   only** — hover, press, presence, layout. Never both on the same property; two engines
   writing one inline style produce jitter that is painful to trace.
2. **Every animated component branches on `useReducedMotion()`** and renders a static,
   complete final state — not a shortened animation. This also governs GSAP timelines,
   which the CSS media query cannot reach.
3. **No rounded corners, no drop shadows, no decorative gradients.** Separation is 1px
   hairlines at 8% white. Gradients are allowed only when they carry meaning — a legibility
   scrim, a data ramp — never as ambient polish.
4. **All numeric, label and chrome text is `font-mono uppercase tracking-widest text-xs`.**
   Prose uses the body font; anything instrument-like is mono.
5. **Sections are self-contained in `sections/`; primitives live in `ui/`.**

## Accessibility baseline

- `:focus-visible` shows a 2px mint outline at 2px offset, overridden to void on the bone
  section. Never removed.
- The skip link is the first element in `<body>` and stays there.
- Word-level splitting only in `SplitText`; character splitting shreds the accessibility
  tree. The full sentence lives on `aria-label`, visual spans are `aria-hidden`.
- Animated counters carry a static `aria-label` and `aria-live="off"`.
- The reduced-motion media query in `globals.css` neutralises durations globally, but
  component-level branching is still required — see rule 2.
