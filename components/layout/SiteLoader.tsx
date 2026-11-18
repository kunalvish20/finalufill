'use client';
import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';

export default function SiteLoader(){
 const pathname=usePathname();
 const [phase,setPhase]=useState<'active'|'exit'|'done'>('active');
 useEffect(()=>{
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setPhase('done');return}
   setPhase('active');
   const finish=window.setTimeout(()=>setPhase('exit'),750);
   const hide=window.setTimeout(()=>setPhase('done'),1120);
   return()=>{clearTimeout(finish);clearTimeout(hide)};
 },[pathname]);
 if(phase==='done')return null;
 return <div className={`site-preloader ${phase==='exit'?'is-exiting':''}`} role="status" aria-label="UFILL3D experience loading" aria-live="polite">
   <div className="site-preloader-mark">UFILL<span>3D</span><i/></div>
   <p>PRECISION IN EVERY LAYER</p>
   <div className="site-preloader-progress"><span/></div>
   <div className="site-preloader-meta"><span>ENGINEERING POSSIBILITY</span><span>01 / 01</span></div>
 </div>;
}
