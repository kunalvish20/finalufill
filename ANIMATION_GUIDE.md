# UFILL3D 3D Morph Animation Guide

All three homepages have a 3D single-spool-to-four-product transition. Source:

- `components/sections/SpoolMorphShowcase.tsx`: GSAP `ScrollTrigger` pinned, reversible progress timeline, product cards, static fallback transition and responsive mode.
- `components/three/MorphSpoolCanvas.tsx`: one R3F canvas for four shared-geometry GLBs; staggered emergence and physically calculated card landing positions.
- `lib/spoolMorphMotion.ts`: scroll progress values for 3D render loop.
- `app/morph.css`: typography, dimensions and mobile static fallback.

## Timing (normalized pinned scroll progress)

- `0.00–0.24`: hold a single large center spool; title appears.
- `0.24–0.70`: three models emerge from the same center and fan out; all four get blue/green/orange/purple filament.
- `0.38–0.86`: spools transition smoothly from center/arc into actual DOM landmark positions on four product cards.
- `0.43–0.90`: product cards reveal as the models approach their destinations.
- `0.945–0.995`: swap fully aligned 3D spools to color-matched static product images for stable normal scrolling after the pin ends.

GSAP progress is written to one small mutable object and sampled by `useFrame`, avoiding React re-renders every frame. Frame-rate-independent damping makes scroll reversal smoother. Desktop runs the 3D scene; mobile and reduced motion display fallback images and cards.

## Adjusting speed

In `SpoolMorphShowcase.tsx`, change the `end` value (`window.innerHeight*2.65`) to make the pinned scroll animation longer/shorter. In `MorphSpoolCanvas.tsx`, change `THREE.MathUtils.damp` coefficients to adjust how rapidly spools catch up. The final position is determined by the card image `data-morph-target` boxes; do not hardcode per-card coordinates.

## Printer animation

`components/three/PrinterSceneInner.tsx`: simulated tool path, buildplate, gantry, 92 individually built filament perimeter layers; `components/three/PrinterScene.tsx` lazy-mounts near the viewport. ScrollTrigger controls `printerMotion.progress` from the corresponding page sections.

## Assets

- `/public/models/ufill3d_spool.glb` — detailed model used for hero and products.
- `/public/models/ufill3d_spool_low.glb` — lighter matching model used four times in the morph.
- `/public/images/morph-[1..4].webp` — corresponding blue/green/orange/purple product images.
