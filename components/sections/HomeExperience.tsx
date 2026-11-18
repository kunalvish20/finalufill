'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import SpoolMorphShowcase from './SpoolMorphShowcase';
import HeroSpoolInteraction from './HeroSpoolInteraction';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ArrowDown,ArrowRight,ArrowUpRight,ArrowDownRight,MoveUpRight,Plus} from 'lucide-react';
import type {Product} from '@/types/store';
import {COLORS,money} from '@/lib/catalog';
import {ColorSwatches} from '@/components/products/ColorSwatches';
import {ProductCard} from '@/components/products/ProductCard';
import {useConfigurator} from '@/stores/configurator';
import {useCart} from '@/stores/cart';
import CinematicCanvas,{sceneMotion} from '@/components/three/CinematicCanvas';
import PrinterScene,{printerMotion} from '@/components/three/PrinterScene';

export default function HomeExperience({products}:{products:Product[]}){
const [reduced,setReduced]=useState(false);const c=useConfigurator(s=>s.color),setColor=useConfigurator(s=>s.setColor);const add=useCart(s=>s.add);const pla=products.find(p=>p.slug==='pla-plus')||products[0];const [added,setAdded]=useState(false);
useEffect(()=>{
 gsap.registerPlugin(ScrollTrigger);
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 setReduced(reduce);
 printerMotion.progress=reduce?1:0;
 sceneMotion.phase='arrival'; sceneMotion.progress=0; sceneMotion.heroScroll=0; sceneMotion.dragYaw=0; sceneMotion.dragPitch=0;
 const ctx=gsap.context(()=>{
   const scenes:[string,string][]=[['#arrival','arrival'],['#spool-chapter','hidden'],['#engineered','engineered'],['#color-universe','colors'],['#collection','collection'],['#creation','creation'],['#showcase','showcase'],['#finale','finale']];
   scenes.forEach(([selector,phase])=>ScrollTrigger.create({trigger:selector,start:'top 55%',end:'bottom 45%',onEnter:()=>{sceneMotion.phase=phase;},onEnterBack:()=>{sceneMotion.phase=phase;}}));
   ScrollTrigger.create({trigger:'#arrival',start:'top top',end:'bottom top',onUpdate:self=>{sceneMotion.heroScroll=self.progress;}});
   if(!reduce){
     gsap.from('.hero-copy > *',{y:40,opacity:0,duration:1.2,stagger:.12,ease:'power3.out',delay:.18});
     gsap.utils.toArray<HTMLElement>('.rise').forEach(el=>gsap.fromTo(el,{y:45,opacity:0},{y:0,opacity:1,duration:1.15,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none reverse'}}));
     ScrollTrigger.create({trigger:'#creation',start:'top top',end:()=>`+=${Math.round(window.innerHeight*(window.innerWidth<760?1.9:2.6))}`,pin:true,pinSpacing:true,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>{printerMotion.progress=self.progress;}});
   }else{
     // The product morph handles its own reduced-motion fallback.
   }
 });
 ScrollTrigger.refresh();
 return()=>{ctx.revert();sceneMotion.dragging=false;printerMotion.progress=0;};
},[]);
return <main className="home-experience"><CinematicCanvas sharedMorph/>
<section id="arrival" className="chapter hero"><div className="hero-gridline"/><div className="hero-copy"><div className="micro hero-eyebrow">01 / MATERIALS OF POSSIBILITY</div><h1>PRINT<br/><em>BEYOND</em><br/>LIMITS<span className="dot">.</span></h1><p>Every idea starts somewhere.<br/>Find the filament to take yours further.</p><div className="hero-actions"><Link className="btn-primary" href="/shop">DISCOVER FILAMENTS <ArrowUpRight size={17}/></Link><a className="btn-ghost" href="#spool-chapter">EXPLORE EXPERIENCE <ArrowDown size={18}/></a></div></div><HeroSpoolInteraction/><div className="hero-side-label">PRECISION / CREATIVITY / WITHOUT LIMITS</div><div className="hero-bottom"><span>01—08 / THE MATERIAL JOURNEY</span><div className="scroll-line"><span/>SCROLL TO UNWIND</div><span>UF / 1.75MM / 2026</span></div></section>
<SpoolMorphShowcase products={products.slice(0,4)} sharedHero/>
<section id="engineered" className="chapter engineered"><div className="content-container"><div className="micro rise">03 / A DIFFERENT KIND OF MATERIAL</div><h2 className="display-heading rise">EVERY <em>LAYER</em><br/>MATTERS<span className="dot">.</span></h2><div className="engineering-body"><div className="technical-rule"/><p className="rise">The choices behind a print matter.<br/>Explore material and color with your project in mind.</p><div className="spec-list rise"><div><span>01</span> CONSISTENCY <ArrowUpRight size={16}/></div><div><span>02</span> CHARACTER <ArrowUpRight size={16}/></div><div><span>03</span> CREATIVE FREEDOM <ArrowUpRight size={16}/></div></div></div></div><HeroSpoolInteraction className="section-spool-interaction engineered-spool-interaction"/><div className="engineered-aside">IMAGINATION, WITH INTENTION. © UFILL3D</div></section>
<section id="color-universe" className="chapter color-universe"><div className="content-container color-layout"><div className="color-content"><span className="micro rise">04 / THE COLOR UNIVERSE</span><h2 className="display-heading rise">FIND YOUR<br/><em>FREQUENCY.</em></h2><p className="rise">Choose a color that changes the character of your print. Preview it on the spool before it reaches your bag.</p><div className="color-panel rise"><div className="color-info"><div><span className="micro">CURRENT SELECTION</span><h3>{c.name}</h3></div><div className="color-price">{money(pla.price)} <small>/ 1KG</small></div></div><ColorSwatches value={c} onChange={setColor} colors={COLORS}/><div className="color-panel-bottom"><span>PLA+ PRO / 1.75MM / 1KG</span><button className="btn-primary" onClick={()=>{add(pla,c,1);setAdded(true);setTimeout(()=>setAdded(false),1600)}}>{added?'ADDED TO BAG':'ADD TO BAG'} <Plus size={18}/></button></div></div></div><div className="color-stage-label">INTERACTIVE / LIVE MATERIAL COLOR</div></div><HeroSpoolInteraction className="section-spool-interaction color-spool-interaction"/></section>
<section id="collection" className="chapter collection-section"><div className="content-container"><div className="collection-header"><div><span className="micro rise">05 / THE FILAMENT COLLECTION</span><h2 className="display-heading rise">MATERIALS<br/>WITH <em>MEANING.</em></h2></div><div className="collection-sub"><p>Start with the material that suits your idea.<br/>Then choose a color to make it yours.</p><Link className="underlined-link" href="/shop">EXPLORE ALL FILAMENTS <ArrowUpRight size={16}/></Link></div></div><div className="home-products">{products.slice(0,4).map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div><div className="collection-outro"><span>THE RIGHT MATERIAL CHANGES EVERYTHING.</span><Link href="/shop" className="outline-pill">VIEW THE FULL COLLECTION <ArrowUpRight size={17}/></Link></div></div></section>
<section id="creation" className="chapter creation-section" aria-label="Animated additive manufacturing with visible extruded filament layers"><PrinterScene/><div className="content-container creation-content"><div className="micro rise">06 / WATCH PRECISION TAKE SHAPE</div><h2 className="display-heading rise">PRINTED<br/><em>LAYER BY LAYER.</em></h2><p className="rise">See how a shape comes together, one path and one layer at a time.</p><Link href="/shop" className="btn-primary">START YOUR NEXT PRINT <ArrowUpRight size={17}/></Link></div><span className="creation-index">LIVE MATERIAL DEPOSITION / UFILL3D</span></section>
<section id="showcase" className="chapter showcase-section"><div className="content-container showcase-content"><div><span className="micro rise">07 / THE SIGNATURE SERIES</span><h2 className="display-heading rise">MEET<br/><em>PLA+ PRO.</em></h2><p className="rise">Explore PLA+ Pro, see the color options and find the spool size that fits your next print.</p><div className="showcase-specs rise"><div><strong>1.75</strong><small>MM DIAMETER</small></div><div><strong>1.0</strong><small>KG SPOOL</small></div><div><strong>10</strong><small>COLORWAYS</small></div></div><Link href="/shop/pla-plus" className="btn-primary">DISCOVER PLA+ PRO <ArrowUpRight size={17}/></Link></div></div><span className="showcase-large-type">SIGNATURE / 001</span></section>
<section id="finale" className="chapter finale-section"><div className="finale-inner"><span className="micro rise">08 / THE FUTURE IS YOURS TO MAKE</span><div className="finale-loop">∞</div><h2 className="rise">MAKE THE<br/><em>IMPOSSIBLE.</em></h2><p>LAYER BY LAYER.</p><div className="finale-actions"><Link href="/shop" className="btn-primary">SHOP FILAMENTS <ArrowUpRight size={17}/></Link><Link href="/customize" className="btn-ghost">EXPLORE COLORS <ArrowRight size={17}/></Link></div><div className="finale-caption">YOUR NEXT PRINT STARTS WITH A CHOICE.</div></div></section>
</main>}
