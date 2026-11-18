'use client';

import {useRef,useState} from 'react';
import type {PointerEvent,KeyboardEvent} from 'react';
import {Move} from 'lucide-react';
import {sceneMotion} from '@/components/three/CinematicCanvas';

/** Accessible controls for the persistent WebGL spool across its visible scenes. */
export default function HeroSpoolInteraction({className=''}:{className?:string}){
  const last=useRef({x:0,y:0});
  const [dragging,setDragging]=useState(false);
  function point(e:PointerEvent<HTMLButtonElement>){
    const bounds=e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--pointer-x',`${e.clientX-bounds.left}px`);
    e.currentTarget.style.setProperty('--pointer-y',`${e.clientY-bounds.top}px`);
  }
  function down(e:PointerEvent<HTMLButtonElement>){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    point(e);
    last.current={x:e.clientX,y:e.clientY};
    e.currentTarget.setPointerCapture(e.pointerId);
    sceneMotion.dragging=true;
    setDragging(true);
  }
  function move(e:PointerEvent<HTMLButtonElement>){
    point(e);
    if(!sceneMotion.dragging)return;
    const dx=e.clientX-last.current.x;
    const dy=e.clientY-last.current.y;
    last.current={x:e.clientX,y:e.clientY};
    sceneMotion.dragYaw+=dx*.009;
    sceneMotion.dragPitch=Math.max(-.5,Math.min(.5,sceneMotion.dragPitch+dy*.006));
  }
  function stop(){sceneMotion.dragging=false;setDragging(false);}
  function reset(){sceneMotion.dragYaw=0;sceneMotion.dragPitch=0;}
  function key(e:KeyboardEvent<HTMLButtonElement>){
    if(e.key==='Home'){e.preventDefault();reset();return;}
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
      e.preventDefault();
      if(e.key==='ArrowLeft')sceneMotion.dragYaw-=.2;
      if(e.key==='ArrowRight')sceneMotion.dragYaw+=.2;
      if(e.key==='ArrowUp')sceneMotion.dragPitch=Math.max(-.5,sceneMotion.dragPitch-.12);
      if(e.key==='ArrowDown')sceneMotion.dragPitch=Math.min(.5,sceneMotion.dragPitch+.12);
    }
  }
  return <button type="button" className={`hero-spool-interaction ${className} ${dragging?'is-dragging':''}`}
    aria-label="Rotate the 3D filament spool. Drag or use arrow keys. Double click or press Home to reset."
    title="Drag or use arrow keys to rotate. Double click to reset."
    onPointerDown={down} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} onDoubleClick={reset} onKeyDown={key}>
    <span className="hero-spool-guide"><Move size={14}/> {dragging?'ROTATING SPOOL':'DRAG TO ROTATE'}{className&&<small>ARROWS · DOUBLE CLICK TO RESET</small>}</span>
  </button>;
}
