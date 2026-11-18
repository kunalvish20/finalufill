'use client';
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
export const sceneMotion={progress:0,phase:'arrival',unwind:0,heroScroll:0,dragYaw:0,dragPitch:0,dragging:false};
const WebGL=dynamic(()=>import('./HeroWebGL'),{ssr:false,loading:()=> <div className="webgl-fallback" aria-hidden="true"><img src="/images/ufill3d-real-spool.webp" alt=""/></div>});
export default function CinematicCanvas({sharedMorph=false}:{sharedMorph?:boolean}){
 const [supported,setSupported]=useState(false);
 const [active,setActive]=useState(true);
 useEffect(()=>{try{const canvas=document.createElement('canvas');setSupported(Boolean(canvas.getContext('webgl2')||canvas.getContext('webgl')))}catch{setSupported(false)}},[]);
 useEffect(()=>{
   const sections=['arrival','engineered','color-universe','tertiary-arrival','commerce-arrival',...(sharedMorph?['spool-chapter','tertiary-orbit','tertiary-morph','secondary-morph']:[])].map(id=>document.getElementById(id)).filter((element):element is HTMLElement=>Boolean(element));
   const visible=new Set<Element>();
   const observer=new IntersectionObserver(entries=>{
     for(const entry of entries){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target)}
     setActive(visible.size>0);
   },{rootMargin:'200px'});
   sections.forEach(section=>observer.observe(section));
   return()=>observer.disconnect();
 },[sharedMorph]);
 return <div className={`cinema-canvas${sharedMorph?' shared-morph':''}`} style={{opacity:active?1:0}} aria-label="Interactive 3D filament spool" role="img">
   {supported?<WebGL active={active} sharedMorph={sharedMorph}/>:<div className="webgl-fallback"><img src="/images/ufill3d-real-spool.webp" alt="Decorative illustration of the UFILL3D spool"/></div>}
 </div>;
}
