'use client';
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState} from 'react';
export const printerMotion={progress:0};
const Inner=dynamic(()=>import('./PrinterSceneInner'),{ssr:false,loading:()=>null});
export default function PrinterScene(){const ref=useRef<HTMLDivElement>(null),[visible,setVisible]=useState(false);useEffect(()=>{if(!ref.current)return;const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)setVisible(true)},{rootMargin:'550px'});observer.observe(ref.current);return()=>observer.disconnect()},[]);return <div className="printer-canvas" ref={ref}>{visible&&<Inner/>}</div>}
