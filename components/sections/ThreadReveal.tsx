'use client';

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, Plus, Check, ArrowDown} from 'lucide-react';
import type {Product, FilamentColor} from '@/types/store';
import {money} from '@/lib/catalog';
import {useCart} from '@/stores/cart';

const ART = [
  {image:'/images/ufill3d-real-spool.webp',name:'Ocean Blue',accent:'#2B91ED'},
  {image:'/images/ufill3d-real-spool.webp',name:'Neon Green',accent:'#A4BE89'},
  {image:'/images/ufill3d-real-spool.webp',name:'Sunset Orange',accent:'#AD775B'},
  {image:'/images/ufill3d-real-spool.webp',name:'Electric Purple',accent:'#9C6CFA'},
];

function RevealProduct({product,index}:{product:Product;index:number}){
  const add = useCart(s=>s.add);
  const [added,setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const art = ART[index] ?? ART[0];
  const color: FilamentColor = product.colors.find(c=>c.name===art.name) || product.colors[0];
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  const addProduct=()=>{
    add(product,color,1);
    setAdded(true);
    if(timer.current)clearTimeout(timer.current);
    timer.current=setTimeout(()=>setAdded(false),1800);
  };
  return <article className="unwind-product" data-thread-card style={{'--product-accent':art.accent} as React.CSSProperties}>
    <div className="unwind-product-top"><span>UF / {String(index+1).padStart(2,'0')}</span><span>{product.badge || 'THE MATERIAL EDIT'}</span></div>
    <Link className="unwind-product-image" href={`/shop/${product.slug}`} aria-label={`Discover ${product.name}`}>
      <img src={product.imageUrl || art.image} alt={`${product.name} — UFILL3D filament spool`} loading="eager"/>
      <span className="unwind-product-weight">1.0 <small>KG</small></span>
    </Link>
    <div className="unwind-product-details">
      <div className="unwind-product-category"><span className="unwind-color-dot"/> {product.category} / 1.75 MM</div>
      <Link href={`/shop/${product.slug}`} className="unwind-product-title">{product.name} <ArrowUpRight aria-hidden="true" size={17}/></Link>
      <div className="unwind-product-buy"><span>{money(product.price)} <small>/ 1KG</small></span><button onClick={addProduct} aria-label={added?`${product.name} added to bag`:`Add ${product.name} to bag`} title="Add to bag">{added?<Check size={17}/>:<Plus size={18}/>}</button></div>
    </div>
  </article>;
}

// All thread endpoints are measured against real product-card positions. The
// filament always lands on its product even when the viewport size changes.
export default function ThreadReveal({products}:{products:Product[]}){
  const section=useRef<HTMLElement>(null);
  const [geometry,setGeometry]=useState({width:1600,height:900,master:'',branches:['','','',''],ends:[[0,0],[0,0],[0,0],[0,0]] as number[][],joint:[0,0] as number[]});
  useEffect(()=>{
    const el=section.current;
    if(!el)return;
    let raf=0;
    const measure=()=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        const bounds=el.getBoundingClientRect();
        const grid=el.querySelector<HTMLElement>('[data-unwind-products]');
        const cards=Array.from(el.querySelectorAll<HTMLElement>('[data-thread-card]'));
        if(!bounds.width||!bounds.height||!grid)return;
        const gridBounds=grid.getBoundingClientRect();
        const x=bounds.width/2;
        const originY=bounds.height*(bounds.width<680?.12:.29);
        const jointY=bounds.height*(bounds.width<680?.19:.365);
        const master=`M ${x} ${originY} C ${x-8} ${originY+24}, ${x+8} ${jointY-20}, ${x} ${jointY}`;
        const ends=cards.map(card=>{
          return [gridBounds.left-bounds.left+card.offsetLeft+card.offsetWidth/2,gridBounds.top-bounds.top+card.offsetTop];
        });
        const branches=ends.map(([ex,ey])=>{
          const dx=ex-x;
          const dy=ey-jointY;
          return `M ${x} ${jointY} C ${x+dx*.38} ${jointY+Math.max(24,dy*.13)}, ${ex} ${ey-Math.max(28,dy*.42)}, ${ex} ${ey}`;
        });
        setGeometry({width:bounds.width,height:bounds.height,master,branches,ends,joint:[x,jointY]});
      });
    };
    const observer=new ResizeObserver(measure);
    observer.observe(el);
    el.querySelectorAll('[data-thread-card]').forEach(card=>observer.observe(card));
    window.addEventListener('resize',measure,{passive:true});
    measure();
    return()=>{observer.disconnect();window.removeEventListener('resize',measure);cancelAnimationFrame(raf);};
  },[products]);

  return <section id="spool-chapter" className="chapter spool-chapter unwind-scene" ref={section} aria-labelledby="unwind-title">
    <div className="unwind-ambient" aria-hidden="true"/>
    <div className="unwind-grid" aria-hidden="true"/>
    <div className="unwind-head">
      <div className="unwind-section-id"><span className="unwind-live"/> 02 / THE UNWINDING</div>
      <span className="unwind-head-aside">A MATERIAL STORY — MADE TO MOVE</span>
    </div>
    <div className="unwind-intro" data-unwind-intro>
      <span className="unwind-caption">ONE SPOOL. ENDLESS DIRECTIONS.</span>
      <h2 id="unwind-title">EVERY IDEA<br/>STARTS <em>HERE.</em></h2>
      <p>One continuous filament. Four entirely different possibilities.</p>
    </div>
    <div className="unwind-finale" data-unwind-finale>
      <div className="unwind-finale-label">01 THREAD <span/> 04 MATERIALS</div>
      <h2>FOLLOW THE <em>FILAMENT.</em></h2>
      <p>Discover the collection — made for wherever your imagination goes.</p>
    </div>
    <svg className="unwind-lines" aria-hidden="true" width="100%" height="100%" viewBox={`0 0 ${Math.max(1,geometry.width)} ${Math.max(1,geometry.height)}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="unwind-thread-gradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e6d4ff"/><stop offset=".38" stopColor="#b384ff"/><stop offset="1" stopColor="#7b40eb"/></linearGradient>
        {geometry.ends.map(([ex,ey],i)=><linearGradient key={i} id={`unwind-branch-gradient-${i}`} gradientUnits="userSpaceOnUse" x1={geometry.joint[0]} y1={geometry.joint[1]} x2={ex} y2={ey}><stop stopColor="#e7c9ff"/><stop offset=".38" stopColor="#b88cff"/><stop offset="1" stopColor={ART[i].accent}/></linearGradient>)}
        <filter id="unwind-thread-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <path className="filament-master filament-blur" d={geometry.master} pathLength="1"/>
      <path className="filament-master filament-ink" d={geometry.master} pathLength="1"/>
      {geometry.branches.map((d,i)=><g key={i}><path className={`filament-branch filament-blur branch-${i}`} d={d} pathLength="1" style={{stroke:ART[i].accent}}/><path className={`filament-branch filament-ink branch-${i}`} d={d} pathLength="1" style={{stroke:`url(#unwind-branch-gradient-${i})`}}/></g>)}
      <circle className="filament-junction-ring" cx={geometry.joint[0]} cy={geometry.joint[1]} r="12"/>
      <circle className="filament-junction-core" cx={geometry.joint[0]} cy={geometry.joint[1]} r="4"/>
      {geometry.ends.map(([x,y],i)=><g key={i}><circle className="filament-tip filament-tip-halo" cx={x} cy={y} r="12" fill={ART[i].accent}/><circle className="filament-tip" cx={x} cy={y} r="4" fill={ART[i].accent}/></g>)}
    </svg>
    <div className="unwind-sparks" aria-hidden="true">
      {Array.from({length:26},(_,i)=><span key={i} className={`unwind-spark unwind-spark-${i%5}`} style={{'--spark-x':`${((i*61+17)%96)+2}%`,'--spark-y':`${((i*37+24)%62)+18}%`,'--spark-delay':`${(i%9)*.08}s`} as React.CSSProperties}/>)}
    </div>
    <div className="unwind-flash" aria-hidden="true"/>
    <div className="unwind-products" data-unwind-products>
      {products.slice(0,4).map((product,i)=><RevealProduct key={product.id} product={product} index={i}/>)}
    </div>
    <div className="unwind-bottom">
      <span className="unwind-cue"><ArrowDown size={15}/> SCROLL TO UNWIND</span>
      <span>UFILL3D / PRECISION IN MOTION</span>
      <Link href="/shop">FULL COLLECTION <ArrowUpRight size={14}/></Link>
    </div>
  </section>;
}
