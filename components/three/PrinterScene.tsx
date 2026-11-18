'use client';
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState} from 'react';
export const printerMotion={progress:0};
const Inner=dynamic(()=>import('./PrinterSceneInner'),{ssr:false,loading:()=>null});
export default function PrinterScene(){const ref=useRef<HTMLDivElement>(null),[mounted,setMounted]=useState(false),[inView,setInView]=useState(false);useEffect(()=>{if(!ref.current)return;const target=ref.current.closest('.creation-section')??ref.current;const preload=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setMounted(true);preload.disconnect()}},{rootMargin:'450px'});const visibility=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting));preload.observe(target);visibility.observe(target);return()=>{preload.disconnect();visibility.disconnect()}},[]);return <div className={`printer-canvas${inView?' is-in-view':''}`} ref={ref}>{mounted&&<Inner/>}</div>}
