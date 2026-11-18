'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {useEffect, useMemo, useRef, useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ArrowDown, ArrowUpRight, Check, Plus, Sparkles} from 'lucide-react';
import type {Product, FilamentColor} from '@/types/store';
import {money, unitPrice, COLORS} from '@/lib/catalog';
import {useCart} from '@/stores/cart';
import MorphCardSpool from '@/components/three/MorphCardSpool';
import {spoolMorphMotion} from '@/lib/spoolMorphMotion';

/** Live motion values are read by R3F's frame loop, avoiding 60 React renders/sec. */
const COLOR_NAMES=['Ocean Blue','Neon Green','Sunset Orange','Electric Purple'];
const MorphSpoolCanvas=dynamic(()=>import('@/components/three/MorphSpoolCanvas'),{ssr:false});

function MorphCard({product,index,color,showLocal}:{product:Product;index:number;color:FilamentColor;showLocal:boolean}){
 const add=useCart(s=>s.add);
 const [added,setAdded]=useState(false);
 const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const weight=product.weightOptions.includes(1)?1:product.weightOptions[0]||1;
 useEffect(()=>()=>{if(timeout.current)clearTimeout(timeout.current)},[]);
 const onAdd=()=>{
   add(product,color,weight,1);
   setAdded(true);
   if(timeout.current)clearTimeout(timeout.current);
   timeout.current=setTimeout(()=>setAdded(false),1600);
 };
 return <article className="morph-card" data-morph-card style={{'--morph-accent':color.hex} as React.CSSProperties}>
   <div className="morph-card-top"><span>{String(index+1).padStart(2,'0')} / UFILL MATERIALS</span><span>{product.badge||'THE MATERIAL EDIT'}</span></div>
   <Link href={`/shop/${product.slug}`} className="morph-card-visual" aria-label={`Explore ${product.name}`}>
     <span className="morph-landmark" data-morph-target={index} aria-hidden="true"/>
     {showLocal&&<MorphCardSpool color={color.hex} name={product.name}/>}
     <span className="morph-card-weight">{weight} KG</span>
     <span className="morph-card-view">VIEW DETAILS <ArrowUpRight size={15}/></span>
   </Link>
   <div className="morph-card-content">
     <div className="morph-card-category"><i/> UFILL3D / {product.category} / {product.diameter}</div>
     <Link href={`/shop/${product.slug}`} className="morph-card-name">{product.name} <ArrowUpRight size={18}/></Link>
     <p className="morph-card-tagline">{product.tagline}</p>
     <div className="morph-card-selection"><span style={{background:color.hex}}/> {color.name} · {weight} KG</div>
     <div className="morph-card-purchase"><span>{money(unitPrice(product,weight))}<small> / {weight} KG</small></span><button type="button" onClick={onAdd} aria-label={added?`${product.name} added to bag`:`Add ${weight} kilogram ${product.name} in ${color.name} to bag`}>{added?<Check size={17}/>:<Plus size={17}/>} {added?'ADDED':'ADD TO BAG'}</button></div>
   </div>
 </article>;
}

/**
 * A single, shared WebGL canvas renders all four copies of the same GLB.
 * The first model begins in the center; three emerge from it and all four
 * follow the actual DOM card coordinates while the scene is GSAP pinned.
 * At completion, the product cards show the same GLB in a static showcase pose.
 */
export default function SpoolMorphShowcase({products,withIntro=false,id='spool-chapter',sharedHero=false}:{products:Product[];withIntro?:boolean;id?:string;sharedHero?:boolean}){
 const wrap=useRef<HTMLDivElement>(null);
 const [near,setNear]=useState(false);
 const [render3d,setRender3d]=useState<boolean|null>(null);
 const [reducedMotion,setReducedMotion]=useState(false);
 const [mobileViewport,setMobileViewport]=useState(false);
 const colorSelections=useMemo(()=>products.slice(0,4).map((p,i)=>p.colors.find(c=>c.name===COLOR_NAMES[i])||COLORS.find(c=>c.name===COLOR_NAMES[i])||p.colors[0]),[products]);
 useEffect(()=>{
   setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
   setMobileViewport(window.matchMedia('(max-width: 900px)').matches);
   try{const c=document.createElement('canvas');setRender3d(Boolean(c.getContext('webgl2')||c.getContext('webgl')))}catch{setRender3d(false)}
 },[]);
 useEffect(()=>{
   if(!wrap.current)return;
   const observer=new IntersectionObserver(([entry])=>setNear(entry.isIntersecting),{rootMargin:'150px'});
   observer.observe(wrap.current);
   return ()=>observer.disconnect();
 },[]);
 useEffect(()=>{
   if(!wrap.current)return;
   gsap.registerPlugin(ScrollTrigger);
   const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const mobile=window.matchMedia('(max-width: 900px)').matches;
   const stage=wrap.current.querySelector<HTMLElement>('.morph-stage');
   if(!stage)return;
   spoolMorphMotion.progress=-1;
   spoolMorphMotion.active=true;
   if(reduced||(mobile&&!sharedHero)){
     gsap.set(wrap.current.querySelectorAll('[data-morph-card]'),{autoAlpha:1,y:0});
     gsap.set(wrap.current.querySelectorAll('.morph-card-spool'),{opacity:1});
     spoolMorphMotion.progress=1;
     return ()=>{spoolMorphMotion.active=false;spoolMorphMotion.progress=-1};
   }
   if(mobile){
     gsap.set(wrap.current.querySelectorAll('[data-morph-card]'),{autoAlpha:1,y:0,scale:1});
     gsap.set(wrap.current.querySelectorAll('.morph-headline,.morph-footer'),{autoAlpha:1,y:0});
     const trigger=ScrollTrigger.create({trigger:stage,start:'top 95%',end:'top 15%',scrub:true,onUpdate:self=>{spoolMorphMotion.progress=self.progress},onLeave:()=>{spoolMorphMotion.progress=1},onLeaveBack:()=>{spoolMorphMotion.progress=-1}});
     return ()=>{trigger.kill();spoolMorphMotion.active=false;spoolMorphMotion.progress=-1};
   }
   const ctx=gsap.context(()=>{
     gsap.set('[data-morph-card]',{autoAlpha:0,y:0,scale:1});
     gsap.set('.morph-card-spool',{opacity:0});
     gsap.set('.morph-headline',{autoAlpha:0,y:30});
     gsap.set('.morph-phase-label',{autoAlpha:1});
     const timeline=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{
       trigger:stage,
       start:'top top',end:()=>`+=${Math.max(window.innerHeight*2.65,1950)}`,
       pin:true,pinSpacing:true,scrub:true,anticipatePin:1,invalidateOnRefresh:true,
       onUpdate:self=>{spoolMorphMotion.progress=self.progress},
       onEnter:()=>{spoolMorphMotion.progress=Math.max(0,spoolMorphMotion.progress)},
       onEnterBack:()=>{spoolMorphMotion.progress=Math.max(0,spoolMorphMotion.progress)},
       onLeave:()=>{spoolMorphMotion.progress=1},
       onLeaveBack:()=>{spoolMorphMotion.progress=-1}
     }});
     timeline.to({}, {duration:1},0);
     timeline.fromTo('.morph-headline',{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:.19},.04)
       .to('.morph-phase-label',{autoAlpha:0,duration:.12},.23)
       .fromTo('.morph-split-flash',{autoAlpha:0,scale:.6},{autoAlpha:.67,scale:1.13,duration:.035},.36)
       .to('.morph-split-flash',{autoAlpha:0,scale:1.8,duration:.09},.395)
       .fromTo('[data-morph-card]',{autoAlpha:0},{autoAlpha:1,duration:.11,stagger:.01},.75)
       .fromTo('.morph-footer',{autoAlpha:0,y:15},{autoAlpha:1,y:0,duration:.11},.83);
   },wrap);
   ScrollTrigger.refresh();
   return()=>{ctx.revert();spoolMorphMotion.active=false;spoolMorphMotion.progress=-1};
 },[products,withIntro,sharedHero]);
 if(products.length<4)return null;
 return <div ref={wrap} className={`morph-story ${withIntro?'morph-with-intro':''}`}>
   {!sharedHero&&<div className="morph-sticky-canvas" aria-hidden="true">{near&&render3d&&!reducedMotion&&!mobileViewport&&<MorphSpoolCanvas colors={colorSelections.map(c=>c.hex)} withIntro={withIntro}/>}</div>}
   {withIntro&&<section className="morph-intro" id="tertiary-orbit"><div className="morph-intro-overline">02 / ONE PERFECT SPOOL</div><h2>THE WORLD<br/>BEGINS WITH <em>ONE.</em></h2><p>One spool becomes four material choices.<br/>Keep scrolling to explore the collection.</p><span className="morph-intro-cue"><ArrowDown size={15}/> SCROLL TO MULTIPLY</span><span className="morph-intro-side">01 SPOOL / 04 POSSIBILITIES</span></section>}
   <section id={id} className="morph-stage" aria-label="Four colorful UFILL3D spools smoothly transform into four shop product cards">
     <div className="morph-background-grid" aria-hidden="true"/>
     <div className="morph-stage-top"><span><Sparkles size={13}/> {withIntro?'03 / THE COLOR EXPANSION':'02 / THE COLOR EXPANSION'}</span><span>ONE BECOMES FOUR / REAL 3D</span></div>
     <div className="morph-headline"><span className="micro">01 SPOOL <span className="morph-dash"/> 04 MATERIALS</span><h2>FOUR WAYS<br/>TO <em>MAKE IT.</em></h2><p>Compare PLA, PLA+, PETG and ABS in one view. Open a card to explore the details.</p></div>
     <div className="morph-phase-label">SCROLL TO TRANSFORM <ArrowDown size={14}/></div>
     <div className="morph-split-flash" aria-hidden="true"/>
     <div className="morph-product-grid" data-morph-grid>{products.slice(0,4).map((p,i)=><MorphCard key={p.id} product={p} index={i} color={colorSelections[i]} showLocal={!sharedHero||render3d===false||reducedMotion}/>)}</div>
     <div className="morph-footer"><span>UFILL3D / PRECISION IN MOTION</span><Link href="/shop">SHOP THE WHOLE COLLECTION <ArrowUpRight size={16}/></Link></div>
   </section>
 </div>;
}
