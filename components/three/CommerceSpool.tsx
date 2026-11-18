'use client';
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState} from 'react';

const Scene=dynamic(()=>import('./CommerceSpoolScene'),{ssr:false,loading:()=> <div className="commerce-model-loading"><img src="/images/ufill3d-real-spool.webp" alt="UFILL3D white and violet filament spool"/></div>});
export default function CommerceSpool({color,className=''}:{color:string;className?:string}){
 const [webgl,setWebgl]=useState(false);
 const [near,setNear]=useState(false);
 const holder=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!holder.current)return;const obs=new IntersectionObserver(([entry])=>setNear(entry.isIntersecting),{rootMargin:'550px'});obs.observe(holder.current);return()=>obs.disconnect()},[]);
 useEffect(()=>{try{const c=document.createElement('canvas');setWebgl(!!(c.getContext('webgl2')||c.getContext('webgl')))}catch{setWebgl(false)}},[]);
 return <div ref={holder} className={'commerce-spool '+className} aria-label="Interactive three dimensional UFILL3D filament spool. Drag to rotate.">
 {webgl&&near?<Scene color={color}/>:<div className="commerce-model-loading"><img src="/images/ufill3d-real-spool.webp" alt="UFILL3D spool"/></div>}
 </div>;
}
