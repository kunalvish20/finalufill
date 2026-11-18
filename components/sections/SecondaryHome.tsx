'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ArrowDown,ArrowRight,ArrowUpRight,Check,MoveUpRight,Package,ShieldCheck,Sparkles,Truck,Plus} from 'lucide-react';
import type {Product} from '@/types/store';
import {COLORS,money} from '@/lib/catalog';
import {ColorSwatches} from '@/components/products/ColorSwatches';
import {ProductCard} from '@/components/products/ProductCard';
import {useCart} from '@/stores/cart';
import CommerceSpool from '@/components/three/CommerceSpool';
import CinematicCanvas,{sceneMotion} from '@/components/three/CinematicCanvas';
import HeroSpoolInteraction from './HeroSpoolInteraction';
import FilamentFlow from './FilamentFlow';
import SpoolMorphShowcase from './SpoolMorphShowcase';

export default function SecondaryHome({products}:{products:Product[]}){
 useEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);
  sceneMotion.phase='arrival';sceneMotion.heroScroll=0;sceneMotion.dragYaw=0;sceneMotion.dragPitch=0;
  const trigger=ScrollTrigger.create({trigger:'#commerce-arrival',start:'top top',end:'bottom top',onUpdate:self=>{sceneMotion.heroScroll=self.progress},onLeave:()=>{sceneMotion.phase='hidden'},onEnterBack:()=>{sceneMotion.phase='arrival'}});
  return()=>{trigger.kill();sceneMotion.phase='hidden';sceneMotion.dragging=false};
 },[]);
 const [selected,setSelected]=useState(COLORS[2]);
 const [quantity,setQuantity]=useState(1);
 const [added,setAdded]=useState(false);
 const add=useCart(s=>s.add);
 const pla=products.find(p=>p.slug==='pla-plus')||products[0];
 const finishAdd=()=>{add(pla,selected,1,quantity);setAdded(true);window.setTimeout(()=>setAdded(false),1800)};
 return <main className="secondary-home"><CinematicCanvas sharedMorph/>
  <section id="commerce-arrival" className="commerce-hero"><div className="commerce-hero-grid"/><div className="commerce-hero-left"><span className="micro commerce-eyebrow"><span className="commerce-dot"/> MATERIALS FOR WHAT'S NEXT / UFILL3D</span><h1>CREATE<br/>WITHOUT<br/><em>LIMITS<span>.</span></em></h1><p>Browse materials, choose a color and see the spool in 3D before your next idea takes shape.</p><div className="commerce-hero-ctas"><Link href="/shop" className="commerce-button">EXPLORE THE COLLECTION <ArrowUpRight size={18}/></Link><Link href="#bestsellers" className="commerce-link">SHOP BESTSELLERS <ArrowDown size={17}/></Link></div><div className="commerce-hero-proof"><div><strong>1.75<span>MM</span></strong><small>NOMINAL DIAMETER</small></div><div><strong>10<span> </span></strong><small>COLOR OPTIONS</small></div><div><strong>360<span>°</span></strong><small>ROTATABLE SPOOL VIEW</small></div></div></div><div className="commerce-hero-right"><div className="commerce-glow"/><div className="commerce-circle-ring commerce-ring-one"/><div className="commerce-circle-ring commerce-ring-two"/><span className="commerce-floating-tag commerce-tag-top"><Sparkles size={14}/> BUILT FOR EVERY LAYER</span><HeroSpoolInteraction className="commerce-hero-interaction"/><span className="commerce-floating-tag commerce-tag-bottom">WHITE SHELL. YOUR COLOR. <span>↗</span></span><div className="commerce-rotate-cue">DRAG TO ROTATE <span>•</span> SCROLL TO SPIN</div></div><div className="commerce-hero-bottom"><span>01 / 05 THE MATERIAL EXPERIENCE</span><span>SCROLL TO DISCOVER <ArrowDown size={15}/></span></div></section>
  <SpoolMorphShowcase products={products.slice(0,4)} id="secondary-morph" sharedHero/>
  <section className="commerce-trust" aria-label="Store features"><div><Package size={19}/><span>PRECISION IN EVERY LAYER</span></div><div><ShieldCheck size={19}/><span>MATERIALS TO EXPLORE</span></div><div><Truck size={19}/><span>SHIPPING INFO IN FAQ*</span></div><div><Sparkles size={19}/><span>COLORFUL BY DESIGN</span></div></section>
  <section className="commerce-categories"><div className="commerce-section-heading"><span className="micro">01 / DISCOVER THE POSSIBILITIES</span><h2>FIND YOUR <em>MATERIAL.</em></h2><p>Start with the material. Make the color your own.</p></div><div className="material-tiles"><Link href="/shop?material=PLA%2B" className="material-tile"><span className="material-tile-num">01 / POPULAR</span><span className="material-orb material-orb-plum"/><strong>PLA+<small>A VERSATILE START</small></strong><ArrowUpRight/></Link><Link href="/shop?material=PETG" className="material-tile"><span className="material-tile-num">02 / DURABLE</span><span className="material-orb material-orb-blue"/><strong>PETG<small>FOR PRACTICAL PRINTS</small></strong><ArrowUpRight/></Link><Link href="/shop?material=TPU" className="material-tile"><span className="material-tile-num">03 / FLEXIBLE</span><span className="material-orb material-orb-orange"/><strong>TPU<small>FOR FLEXIBLE IDEAS</small></strong><ArrowUpRight/></Link></div></section>

  <section id="bestsellers" className="commerce-products"><div className="commerce-products-head"><div><span className="micro">02 / THE MATERIAL EDIT</span><h2>MADE TO <em>MAKE.</em></h2></div><Link href="/shop" className="commerce-text-link">EXPLORE ALL MATERIALS <ArrowUpRight size={18}/></Link></div><div className="commerce-products-grid">{products.slice(0,4).map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div><div className="commerce-more"><Link href="/shop" className="commerce-button outline">SHOP ALL FILAMENTS <ArrowUpRight size={17}/></Link></div></section>
  <FilamentFlow/>
  <section className="commerce-color-lab"><div className="commerce-color-left"><span className="micro">04 / YOUR COLOR. YOUR STORY.</span><h2>MAKE IT<br/><em>YOUR OWN.</em></h2><p>Pick a color, turn the spool in 3D and see your combination before adding it to your bag.</p><div className="commerce-color-card"><div className="commerce-color-top"><span>PLA+ / CORE SERIES</span><strong>{money(pla.price)} <small>/ 1 KG</small></strong></div><h3>{selected.name}</h3><ColorSwatches value={selected} onChange={setSelected} colors={COLORS}/><div className="commerce-color-actions"><div className="commerce-qty" aria-label="Quantity"><button onClick={()=>setQuantity(Math.max(1,quantity-1))} aria-label="Decrease quantity">−</button><span>{quantity}</span><button onClick={()=>setQuantity(Math.min(20,quantity+1))} aria-label="Increase quantity">+</button></div><button className="commerce-button" onClick={finishAdd}>{added?<><Check size={18}/> ADDED</>:<>ADD TO BAG <Plus size={18}/></>}</button></div></div></div><div className="commerce-color-right"><span className="commerce-purple-halo"/><CommerceSpool color={selected.hex}/><div className="commerce-3d-label">LIVE 3D COLOR PREVIEW <span>↗</span></div></div></section>
  <section className="commerce-statement"><div className="micro">05 / WHAT WILL YOU MAKE NEXT?</div><h2>GOOD IDEAS<br/>DESERVE <em>GREAT MATERIAL.</em></h2><p>Choose a material that fits the idea you are ready to make.</p><div className="commerce-statement-actions"><Link href="/shop" className="commerce-button">SHOP THE COLLECTION <ArrowUpRight size={19}/></Link><Link href="/" className="commerce-link">EXPLORE THE CINEMATIC EXPERIENCE <ArrowRight size={18}/></Link></div><span className="commerce-statement-watermark">UFILL3D</span></section>
  <div className="commerce-disclaimer">* Product prices, stock, specifications and shipping information are demo values until your live catalog and fulfillment policy are configured.</div>
 </main>;
}
