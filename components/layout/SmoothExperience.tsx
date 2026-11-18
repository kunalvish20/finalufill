'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

/** Smooth scrolling is only needed on the three animated homepages. */
export default function SmoothExperience(){
 const pathname=usePathname();
 const isExperience=pathname==='/'||pathname==='/secondary-home'||pathname==='/tertiary-homepage';

 useEffect(()=>{
   if(!isExperience||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   let cancelled=false;
   let cleanup:(()=>void)|undefined;

   Promise.all([import('lenis'),import('gsap'),import('gsap/ScrollTrigger')]).then(([{default:Lenis},{default:gsap},{ScrollTrigger}])=>{
     if(cancelled)return;
     gsap.registerPlugin(ScrollTrigger);
     const lenis=new Lenis({duration:1.05,smoothWheel:true,wheelMultiplier:1,touchMultiplier:1.1});
     const onLenis=()=>ScrollTrigger.update();
     lenis.on('scroll',onLenis);
     let raf=0;
     const loop=(time:number)=>{lenis.raf(time);raf=requestAnimationFrame(loop)};
     raf=requestAnimationFrame(loop);
     ScrollTrigger.refresh();
     cleanup=()=>{cancelAnimationFrame(raf);lenis.off('scroll',onLenis);lenis.destroy()};
   });

   return()=>{cancelled=true;cleanup?.()};
 },[isExperience,pathname]);

 return null;
}
