'use client';

import dynamic from 'next/dynamic';
import {useEffect, useRef, useState} from 'react';

const Scene=dynamic(()=>import('./MorphCardSpoolScene'),{ssr:false});

/** Mount the real spool only when its card is approaching the viewport. */
export default function MorphCardSpool({color,name}:{color:string;name:string}){
 const holder=useRef<HTMLSpanElement>(null);
 const [ready,setReady]=useState(false);

 useEffect(()=>{
   const element=holder.current;
   if(!element)return;
   const observer=new IntersectionObserver(([entry])=>{
     if(!entry.isIntersecting)return;
     observer.disconnect();
     try{
       const canvas=document.createElement('canvas');
       setReady(Boolean(canvas.getContext('webgl2')||canvas.getContext('webgl')));
     }catch{setReady(false)}
   },{rootMargin:'150px'});
   observer.observe(element);
   return()=>observer.disconnect();
 },[]);

 return <span ref={holder} className="morph-card-spool" role="img" aria-label={`3D ${name} filament spool`}>
   {ready?<Scene color={color}/>:null}
 </span>;
}
