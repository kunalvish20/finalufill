# UFILL3D — Three Homepages · Cinematic 3D Filament E-Commerce

A Next.js / React / TypeScript / React Three Fiber / GSAP / Lenis storefront adapted directly from the supplied UFILL3D project. Includes **three homepage experiences**, a single-to-four spools transformation, improved white-and-purple branded GLB, live filament-color switching, a scroll-reactive 3D printhead, shopping flows, and an existing Supabase + Razorpay checkout integration.

## 1. Run in VS Code

- Install **Node.js 22 LTS**, and open the **extracted project folder**, containing `package.json`.
- The ZIP intentionally excludes `node_modules` and `.next` (these are platform-specific / generated and should not be copied from another PC).
- In VS Code PowerShell:

```powershell
npm install
npm run dev
```

- Open **http://localhost:3000**. This starts in **demo catalog / demo checkout** mode until you configure production credentials.

**If you already tried older ZIPs and see `MODULE_NOT_FOUND`**, open a **fresh extract** of this ZIP. Alternatively, delete the old `node_modules` and `.next` folders in PowerShell and run `npm install` again:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm install
npm run dev
```

## 2. Homepage URLs

| URL | Experience |
|---|---|
| `/` | Original dark-violet Awwwards-style cinematic hero, interactive 3D spool, GSAP chapters and color universe; **new one-to-four 3D product transformation** replaces the older single-to-four glowing thread-branch presentation; rebuilt 3D-printing section. |
| `/secondary-home` | White-and-purple e-commerce hero with a draggable real GLB, material categories, **one-to-four scroll transformation**, four shoppable product cards, bestsellers, flowing filament illustration, and a live 3D material color lab. |
| `/tertiary-homepage` | **NEW.** The same cinematic-style hero as `/`, second full-screen chapter with one spool floating in the center, third chapter where **one real GLB becomes four separate colored GLBs**, smoothly flying into real product-card locations, followed by layer-by-layer printer and a shop CTA. |

### Four-spool 3D morph (all three homepages)

- ScrollTrigger pins the third chapter on desktop and drives **a single WebGL canvas** rather than four independent WebGL contexts.
- First a single model appears; then three additional matching models emerge with staggered motion. One evolves into four distinct **blue, green, orange and purple filament** colorways; printed white flanges, purple outer rim and UFILL3D branding remain unchanged.
- Card image placeholders are measured from the actual DOM layout, so final 3D positions fit the product frames across desktop widths.
- When the pinned scroll concludes, each product card retains an actual 3D spool in a front three-quarter pose, with the label and colored filament visible. The card models render only when the cards approach the viewport.
- The add (+) buttons use the persistent Zustand cart and selected filament colors, with links to full product details.
- On screens <=760px and reduced-motion devices, the chapter uses responsive 2×2 product cards with still 3D spools instead of the pinned motion effect. WebGL is required to display the models.

Key files: `components/sections/SpoolMorphShowcase.tsx`, `components/three/MorphSpoolCanvas.tsx`, `lib/spoolMorphMotion.ts` and `app/morph.css`.

### New high-detail GLB

- `public/models/ufill3d_spool.glb`: complete premium photo-textured reconstruction, updated full-diameter filament pack, physically visible ribbing and micro-groove rings.
- `public/models/ufill3d_spool_low.glb`: a visually matching, lower-polygon model used across animated homepage scenes and their four 3D cards to reduce initial transfer and GPU work.
- `components/three/Spool.tsx` recolors only **three named filament surfaces**: base, highlight and thin darker winding grooves. The branded plates, perimeter and core do not recolor.
- The photographic print, reverse side and true dimensions are reconstructed from a single image: **marketing model, not a CAD-accurate or manufacturing-ready part.** QR code scanning is not verified.

### 3D-printing experience

`components/three/PrinterSceneInner.tsx` renders an additive-manufacturing buildplate and gantry, a nozzle that travels along an actual curved perimeter, and 92 individually extruded layers progressively revealed by scroll. Printing text is included on both `/` and `/tertiary-homepage`.

### Typography, smoothness and loader

DM Sans Variable is loaded locally and paired with Helvetica / Arial fallbacks. A **single global Lenis instance** synchronizes scrolling with GSAP ScrollTrigger; individual pages do not create duplicate scroll handlers. A short branded loading overlay appears on initial load and route changes. 3D stages and product canvases are lazy-mounted near the viewport, while mobile/reduced-motion users receive lighter alternatives.

## 3. Shop + checkout

Existing features retained and integrated:

1. `/shop` — product catalog, filters, sorting, cards and quick views.
2. `/shop/[slug]` — full product details, weight/quantity/color, interactive 3D GLB.
3. `/customize` — live 3D color and material configuration.
4. `/cart` — local persisted cart with correct color, weight, quantity and totals.
5. `/checkout` — shipping details, coupon input, order overview, payment status routes.
6. `/account`, `/orders`, `/admin` — existing Supabase flows retained (require configuration).
7. `/api/checkout/create`, `/api/checkout/verify`, `/api/checkout/webhook` — existing server-side Razorpay integration remains in place.

**Demo vs live distinction:** Without configured keys and a proper Supabase database, checkout is a safe **demo** and does not collect money or mark orders paid. To accept payments you must configure a real Razorpay merchant account and Supabase schema and verify payment callbacks / webhook handling. The UI being clickable is not proof that real payments have been verified.

## 4. Live Supabase and Razorpay configuration

1. Copy `.env.example` to `.env.local`.
2. Review and run `supabase/migrations/001_storefront.sql` in a **new / appropriately backed-up Supabase project**; configure real catalog, variants and stock.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and **server-only** `SUPABASE_SERVICE_ROLE_KEY`.
4. Add your Razorpay merchant credentials: `NEXT_PUBLIC_RAZORPAY_KEY_ID`, **server-only** `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
5. Configure signed payment webhooks for `https://YOUR-DOMAIN/api/checkout/webhook`; test real provider test-mode orders and concurrent stock reservations before enabling production payments.
6. Set shipping, GST, privacy, refund/returns, stock, inventory sources and business policies before a public launch.

**Never put secret or service-role keys into client components or Git.** `npm run build` is the production compile step; deploy to Vercel or another Node.js/Next.js-capable platform after validation.

## 5. Quality checks

```bash
npm run typecheck
npm run test:smoke
npm run build
```

**Completed in this environment:** TypeScript semantic check, GLB binary integrity + materials checks, local route and asset smoke checks. **Not completed:** live Next.js production build, actual graphical WebGL/scroll regression testing, end-to-end Razorpay/Supabase payments, and deployment. Production build requires the Linux SWC runtime here, which cannot be downloaded due restricted package-network access. Windows `npm install` downloads the correct Windows binary and dependencies normally.

For acceptance before going live, test desktop at 1440/1280/1024px, mobile at 390/375/320px, reduced motion, reversing the pinned scroll, four distinct material colors, colored cart entries, quantity changes, demo checkout and payment verification in Razorpay test mode.
