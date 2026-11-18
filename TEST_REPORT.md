# UFILL3D Three-homepage delivery checks — 18 November 2026

## Verified

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit --pretty false` — **PASS**, zero diagnostics.
- Structural routes, imports and checkout source checks — **PASS** (`npm run test:smoke`).
- New `/tertiary-homepage` route exists and uses the cinema hero + central reveal + morph stage.
- Both original homepages include new four-spool morph section with real GLB model components.
- Four selected colors are attached to cart actions and product card link destinations in source.
- High-detail GLB: 20 meshes, 169,288 vertices, 331,008 triangles; glTF 2.0 valid and importable via trimesh.
- Morph GLB: 20 meshes, 86,680 vertices, 169,920 triangles; glTF 2.0 valid and importable via trimesh.
- New filament winding groove material exported in both files and recognized by the React tinting logic.
- Four lightweight per-color WebP card preview assets exist.
- Single scroll engine / GSAP ScrollTrigger and loader integrated in root layout; previous duplicate home-only scroll engine removed.
- Checkout code maintains demo fallback when credentials are absent. Live verification still requires server-side secrets, a configured database, and payment webhooks.

## Environment limitations: NOT verified / not claimed as passed

- Next production build: **BLOCKED** because only a Windows SWC runtime was present among the uploaded dependencies; network cannot access the package registry to obtain Linux SWC. `next build` aborts with `Failed to load SWC binary for linux/x64`.
- Fully rendered browser, GLTF loading timing, user drag/pin/reverse scroll end-to-end: **NOT VERIFIED**.
- Performance/fps on Windows or mobile phones: **NOT BENCHMARKED**. Four-spool stage uses a lower-polygon shared scene and mobile fallbacks to reduce load.
- Real Supabase auth, live payment/order lifecycle and stock concurrency: **NOT EXECUTED** (requires account credentials and test environment).
- Live deployment: **NOT PERFORMED**.

## Recommended local acceptance test

1. Fresh extract; `npm install`, `npm run typecheck`, `npm run build`, `npm run dev`.
2. Visit `/`, `/secondary-home` and `/tertiary-homepage`; confirm loader, correct typography and GLB orientation.
3. Scroll at desktop width through a morph stage; verify 1 spool emerges into 4 colored spools, all four align with card images, and fallback preview images appear at scroll end.
4. Reverse scroll through stage and confirm the movement reverses without duplicate spools or broken pin layout.
5. Test smaller screens and system Reduce Motion; confirm normal accessible 2×2 cards and no canvas exception.
6. Confirm filament-only recoloring (rim and branding stay purple/white) in color selector, product view and four-way scene.
7. Watch the printer section: nozzle motion, completed layer count, responsive placement.
8. Add at least two different materials/colors to the cart; change quantities, reload and proceed through **demo** checkout.
9. Configure Supabase and Razorpay test mode, check signing, webhooks, stock reservation and exactly-once paid-order transitions before production.
