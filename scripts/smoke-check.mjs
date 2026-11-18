import {existsSync,readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
const root=process.cwd();
const expected=[
 'app/page.tsx','app/secondary-home/page.tsx','app/tertiary-homepage/page.tsx','app/shop/page.tsx',
 'app/shop/[slug]/page.tsx','app/cart/page.tsx','app/checkout/page.tsx',
 'app/checkout/success/page.tsx','app/api/checkout/create/route.ts',
 'app/api/checkout/verify/route.ts','app/api/checkout/webhook/route.ts',
 'components/sections/SecondaryHome.tsx','components/sections/FilamentFlow.tsx',
 'components/sections/SpoolMorphShowcase.tsx','components/sections/TertiaryHome.tsx',
 'components/three/MorphSpoolCanvas.tsx','lib/spoolMorphMotion.ts','app/morph.css','app/refinements.css','app/card-upgrade.css','components/cart/CartNotice.tsx',
 'components/three/Spool.tsx','components/three/CommerceSpoolScene.tsx',
 'public/models/ufill3d_spool.glb','public/models/ufill3d_spool_low.glb','public/images/ufill3d-real-spool.webp',
 'public/images/ufill3d-brand-logo.webp','app/icon.png','app/apple-icon.png','app/opengraph-image.png',
 'public/images/morph-1.webp','public/images/morph-2.webp','public/images/morph-3.webp','public/images/morph-4.webp',
 'supabase/migrations/001_storefront.sql'];
let failures=0;
for(const file of expected){const path=join(root,file);if(!existsSync(path)){console.error('MISSING ',file);failures++}else console.log('OK ',file)}
const glb=readFileSync(join(root,'public/models/ufill3d_spool.glb'));
if(glb.toString('ascii',0,4)!=='glTF'||glb.readUInt32LE(4)!==2||glb.readUInt32LE(8)!==glb.length){console.error('GLB header invalid');failures++}else console.log('OK glTF 2.0 binary,',Math.round(glb.length/1024),'KiB');
const glbLow=readFileSync(join(root,'public/models/ufill3d_spool_low.glb'));
if(glbLow.toString('ascii',0,4)!=='glTF'||glbLow.readUInt32LE(8)!==glbLow.length){console.error('LOD GLB header invalid');failures++}else console.log('OK LOD glTF 2.0 binary,',Math.round(glbLow.length/1024),'KiB');
const morph=readFileSync(join(root,'components/sections/SpoolMorphShowcase.tsx'),'utf8');
if(!morph.includes('ScrollTrigger')||!morph.includes('data-morph-target')||!morph.includes('useCart')){console.error('Morph source missing card targeting/cart wiring');failures++}
const spool=readFileSync(join(root,'components/three/Spool.tsx'),'utf8');
if(!spool.includes('White filament strands')||!spool.includes('filament highlight')||!spool.includes('material.color.lerp')){console.error('Filament material tint hook missing');failures++}
const home=readFileSync(join(root,'components/sections/HomeExperience.tsx'),'utf8');
if(!home.includes('ScrollTrigger')||!home.includes('sceneMotion')||!home.includes('ColorSwatches')){console.error('Cinematic animation/color wiring missing');failures++}
if(failures)process.exit(1);
console.log('\nPASS: routes/assets/GLB/material color switching present. This check does not replace browser/payment testing.');
