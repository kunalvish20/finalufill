'use client';
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';

const Inner=dynamic(()=>import('./ProductViewerInner'),{ssr:false,loading:()=> <div className="model-placeholder"><img alt="UFILL3D filament spool" src="/images/ufill3d-real-spool.webp"/></div>});

export function ProductViewer({color,compact=false,detail=false}:{color?:string;compact?:boolean;detail?:boolean}){
 const [webgl,setWebgl]=useState(false);
 useEffect(()=>{try{const canvas=document.createElement('canvas');setWebgl(Boolean(canvas.getContext('webgl2')||canvas.getContext('webgl')))}catch{setWebgl(false)}},[]);
 return <div className={`product-viewer${detail?' product-detail-viewer':''}`}>
   {webgl?<Inner color={color} compact={compact} detail={detail}/>:<div className="model-placeholder"><img alt="UFILL3D filament spool illustration" src="/images/ufill3d-real-spool.webp"/></div>}
   <div className="viewer-hint">{webgl?(detail?'DRAG TO ROTATE':'DRAG TO ROTATE · SCROLL TO ZOOM'):'STATIC PREVIEW · WEBGL UNAVAILABLE'}</div>
 </div>;
}
