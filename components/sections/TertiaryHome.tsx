'use client';
import Link from 'next/link';
import {useEffect} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ArrowDown, ArrowUpRight, ArrowRight} from 'lucide-react';
import type {Product} from '@/types/store';
import CinematicCanvas, {sceneMotion} from '@/components/three/CinematicCanvas';
import HeroSpoolInteraction from './HeroSpoolInteraction';
import SpoolMorphShowcase from './SpoolMorphShowcase';
import PrinterScene, {printerMotion} from '@/components/three/PrinterScene';

export default function TertiaryHome({products}:{products:Product[]}){
 useEffect(()=>{
   gsap.registerPlugin(ScrollTrigger);
   const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   printerMotion.progress=reduced?1:0;
   sceneMotion.phase='arrival';sceneMotion.heroScroll=0;sceneMotion.dragYaw=0;sceneMotion.dragPitch=0;
   const context=gsap.context(()=>{
     ScrollTrigger.create({trigger:'#tertiary-arrival',start:'top top',end:'bottom top',onUpdate:self=>{sceneMotion.heroScroll=self.progress;sceneMotion.phase='arrival'},onLeave:()=>{sceneMotion.phase='hidden'},onEnterBack:()=>{sceneMotion.phase='arrival'}});
     ScrollTrigger.create({trigger:'#tertiary-orbit',start:'top 70%',end:'bottom top',onEnter:()=>{sceneMotion.phase='hidden'},onEnterBack:()=>{sceneMotion.phase='hidden'}});
     if(!reduced)ScrollTrigger.create({trigger:'#tertiary-print',start:'top top',end:()=>`+=${Math.round(window.innerHeight*(window.innerWidth<760?1.9:2.6))}`,pin:true,pinSpacing:true,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>{printerMotion.progress=self.progress}});
     if(!reduced){gsap.from('.tertiary-home .hero-copy > *',{opacity:0,y:34,duration:1.05,stagger:.1,ease:'power3.out',delay:.1})}
   });
   ScrollTrigger.refresh();
   return()=>{context.revert();sceneMotion.phase='hidden';sceneMotion.dragging=false;printerMotion.progress=0};
 },[]);
 return <main className="tertiary-home home-experience">
   <CinematicCanvas sharedMorph/>
   <section id="tertiary-arrival" className="chapter hero">
     <div className="hero-gridline"/>
     <div className="hero-copy"><span className="micro hero-eyebrow">01 / MATERIALS OF POSSIBILITY</span><h1>PRINT<br/><em>BEYOND</em><br/>LIMITS<span className="dot">.</span></h1><p>Every idea starts somewhere.<br/>Find the filament to take yours further.</p><div className="hero-actions"><a className="btn-primary" href="#tertiary-orbit">EXPLORE THE TRANSFORMATION <ArrowDown size={17}/></a><Link className="btn-ghost" href="/shop">SHOP FILAMENTS <ArrowUpRight size={17}/></Link></div></div>
     <HeroSpoolInteraction/><div className="hero-side-label">PRECISION / CREATIVITY / WITHOUT LIMITS</div><div className="hero-bottom"><span>01—04 / THE MATERIAL JOURNEY</span><span className="scroll-line"><span/> SCROLL TO DISCOVER</span><span>UF / 1.75 MM / 2026</span></div>
   </section>
   <SpoolMorphShowcase products={products.slice(0,4)} withIntro sharedHero id="tertiary-morph"/>
   <section id="tertiary-print" className="chapter creation-section tertiary-printer" aria-label="3D printing in progress"><PrinterScene/><div className="content-container creation-content"><div className="micro">04 / MADE LAYER BY LAYER</div><h2 className="display-heading">WATCH<br/><em>IDEAS FORM.</em></h2><p>Watch an idea take shape as each toolpath adds another layer.</p><Link className="btn-primary" href="/shop">FIND YOUR FILAMENT <ArrowUpRight size={17}/></Link></div><span className="creation-index">LIVE LAYER DEPOSITION / UFILL3D</span></section>
   <section className="tertiary-after"><div className="tertiary-after-inner"><div><div className="micro purple-text">YOUR NEXT IDEA STARTS HERE</div><h2>THE RIGHT<br/><em>MATERIAL.</em><br/>EVERY TIME.</h2><p>Explore four material choices, compare their colors and start with the spool that fits your idea.</p><Link href="/shop" className="btn-primary" style={{background:'#6d33bd',color:'#fff'}}>DISCOVER ALL MATERIALS <ArrowRight size={17}/></Link></div><div className="tertiary-after-art"><img src="/images/morph-4.webp" alt="UFILL3D spool with vivid purple filament" loading="lazy"/></div></div></section>
 </main>;
}
