'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,ShoppingBag} from 'lucide-react';
import type {Product} from '@/types/store';
import {COLORS,money,unitPrice} from '@/lib/catalog';
import {ProductViewer} from '@/components/three/ProductViewer';
import {ColorSwatches} from './ColorSwatches';
import {useCart} from '@/stores/cart';

export function ProductDetail({product}:{product:Product}){
 const [color,setColor]=useState(product.colors[0]||COLORS[0]);
 const [weight,setWeight]=useState(product.weightOptions.includes(1)?1:product.weightOptions[0]||1);
 const [qty,setQty]=useState(1);
 const [added,setAdded]=useState(false);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const add=useCart(state=>state.add);
 const price=unitPrice(product,weight);
 const available=product.stock>0;
 const [material,finish='Filament']=product.name.split(' / ');

 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 function put(){
   if(!available)return;
   add(product,color,weight,qty);
   setAdded(true);
   if(timer.current)clearTimeout(timer.current);
   timer.current=setTimeout(()=>setAdded(false),1800);
 }

 return <>
   <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/shop">ALL FILAMENTS</Link><span aria-hidden="true">/</span><span>{product.category.toUpperCase()}</span></nav>
   <div className="product-layout">
     <div className="product-visual">
       <span className="product-visual-label">UFILL3D / 3D PRODUCT VIEW</span>
       <ProductViewer color={color.hex} detail/>
       <span className="product-visual-color">{color.name} / {weight} KG</span>
     </div>
     <div className="product-detail">
       <div className="micro">UFILL3D / MATERIAL SERIES / {product.category.toUpperCase()}</div>
       <h1>{material}<br/><em>{finish}.</em></h1>
       <p className="product-tagline">{product.tagline}</p>
       <p className="lead">{product.description}</p>
       <div className="product-key-facts"><span>{product.category} MATERIAL</span><span>{product.diameter} DIAMETER</span></div>
       <div className="product-price-block"><span className="micro">PRICE / {weight} KG SPOOL</span><div className="price-main">{money(price)}</div></div>
       <div className="product-controls">
         <ColorSwatches value={color} onChange={setColor} colors={product.colors}/>
         <div className="control-row"><div className="field-label">SPOOL WEIGHT <span>{weight} KG</span></div><div className="segment-group">{product.weightOptions.map(option=><button key={option} type="button" className={'segment '+(option===weight?'active':'')} aria-pressed={option===weight} onClick={()=>setWeight(option)}>{option} KG</button>)}</div></div>
         <div className="control-row"><div className="field-label">QUANTITY <span>{available?`${product.stock} AVAILABLE · DEMO CATALOG`:'OUT OF STOCK'}</span></div><div className="qty-stepper"><button type="button" onClick={()=>setQty(Math.max(1,qty-1))} disabled={qty<=1} aria-label="Decrease quantity">−</button><span aria-live="polite">{qty}</span><button type="button" onClick={()=>setQty(Math.min(product.stock,qty+1))} disabled={!available||qty>=product.stock} aria-label="Increase quantity">+</button></div></div>
         <div className="purchase-actions"><button type="button" onClick={put} className="btn-primary" disabled={!available}>{added?'ADDED TO BAG':`ADD TO BAG · ${money(price*qty)}`} <ShoppingBag size={18}/></button>{available&&<Link href="/cart" className="btn-outline" onClick={put}>ADD & VIEW BAG <ArrowUpRight size={17}/></Link>}</div>
       </div>
       <div className="product-information">
         <details open><summary>PRODUCT INFORMATION</summary><p>{product.description} Prices and specifications are illustrative until the live product catalog is verified.</p></details>
         <details><summary>PRINT SETTINGS / STARTING POINTS</summary><p>Starting temperatures vary by printer and environment. Calibrate for your specific setup.</p><div className="spec-table"><span>Nozzle temperature</span><strong>{product.heat}</strong><span>Build plate</span><strong>{product.bed}</strong><span>Print speed</span><strong>{product.speed}</strong></div></details>
         <details><summary>TECHNICAL SPECIFICATIONS</summary><div className="spec-table"><span>Filament</span><strong>{product.category}</strong><span>Nominal diameter</span><strong>{product.diameter}</strong><span>Selected weight</span><strong>{weight} KG</strong><span>Color</span><strong>{color.name}</strong></div></details>
         <details><summary>SHIPPING & RETURNS</summary><p>Shipping charges, dispatch estimates and returns policies must be configured before accepting commercial orders.</p></details>
       </div>
     </div>
   </div>
 </>;
}
