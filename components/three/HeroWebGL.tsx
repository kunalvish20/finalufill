'use client';

import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Suspense,useLayoutEffect,useMemo,useRef,useState} from 'react';
import * as THREE from 'three';
import {Spool} from './Spool';
import {sceneMotion} from './CinematicCanvas';
import {spoolMorphMotion} from '@/lib/spoolMorphMotion';
import {COLORS} from '@/lib/catalog';

const smooth=(t:number,a:number,b:number)=>THREE.MathUtils.smoothstep(t,a,b);
const mix=THREE.MathUtils.lerp;
const HERO_YAW=1.42;
const HERO_PITCH=.03;
const HERO_ROLL=0;
const MORPH_COLORS=['Ocean Blue','Neon Green','Sunset Orange','Electric Purple'].map(name=>COLORS.find(color=>color.name===name)?.hex||'#9a5cff');

/** One WebGL spool travels from the hero through the color chapter.
 * Scroll is the source of truth; pointer drag provides an additive orientation.
 * Both smoothly damp inside the render loop, so there are no hard jumps.
 */
function StoryRig({sharedMorph}:{sharedMorph:boolean}){
  const root=useRef<THREE.Group>(null);
  const spool=useRef<THREE.Group>(null);
  const extra=useRef<Array<THREE.Group|null>>([]);
  const anchors=useRef<{x:number;y:number;scale:number}[]>([]);
  const anchorClock=useRef(0);
  const [morphTint,setMorphTint]=useState(false);
  const {camera,size,viewport}=useThree();
  useLayoutEffect(()=>{
    if(!root.current||!spool.current)return;
    const compact=size.width<760;
    root.current.position.set(compact?0:2.3,compact?-.8:0,0);
    root.current.scale.setScalar(compact?1.18:2.0);
    spool.current.rotation.set(HERO_PITCH,HERO_YAW,HERO_ROLL);
  },[size.width]);
  useFrame((state,delta)=>{
    if(!root.current||!spool.current)return;
    const compact=size.width<760;
    const viewportLine=size.height*.5;
    const story=sharedMorph?document.querySelector<HTMLElement>('.morph-story'):null;
    const storyRect=story?.getBoundingClientRect();
    const inMorph=Boolean(storyRect&&storyRect.top<size.height&&storyRect.bottom>0&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if(inMorph){
      const dt=Math.min(delta,.06);
      const p=THREE.MathUtils.clamp(spoolMorphMotion.progress,0,1);
      if(p>.16&&!morphTint)setMorphTint(true);
      if(p<.1&&morphTint)setMorphTint(false);
      anchorClock.current+=dt;
      const settled=p>=.75;
      if(settled||anchorClock.current>.075||anchors.current.length!==4){
        anchorClock.current=0;
        const ratio=viewport.width/size.width;
        anchors.current=[0,1,2,3].map(i=>{
          const target=story?.querySelector<HTMLElement>(`[data-morph-target="${i}"]`);
          if(!target)return {x:0,y:-2,scale:.6};
          const rect=target.getBoundingClientRect();
          return {x:(rect.left+rect.width/2-size.width/2)*ratio,y:(size.height/2-(rect.top+rect.height/2))*ratio,scale:Math.min(1.16,Math.min(rect.width*.80,rect.height*.91)*ratio/2.02)};
        });
      }
      const exit=smooth(THREE.MathUtils.clamp(sceneMotion.heroScroll,0,1),.15,1);
      const centerX=THREE.MathUtils.lerp(compact?0:2.3,0,exit);
      const centerY=THREE.MathUtils.lerp(compact?-.8:0,-.35,exit);
      const centerScale=THREE.MathUtils.lerp(compact?1.18:2,compact?1.28:1.56,exit);
      const split=smooth(p,.12,.44);
      const travel=smooth(p,.35,.75);
      const land=smooth(p,.35,.75);
      for(let i=0;i<4;i++){
        const group=i===0?root.current:extra.current[i-1];
        if(!group)continue;
        const aim=anchors.current[i]||{x:0,y:-2,scale:.6};
        const arcX=(i-1.5)*(size.width<1050?.87:1.18);
        const arcY=.30-Math.abs(i-1.5)*.15;
        const x=THREE.MathUtils.lerp(THREE.MathUtils.lerp(centerX,arcX,split),aim.x,travel);
        const y=THREE.MathUtils.lerp(THREE.MathUtils.lerp(centerY,arcY,split),aim.y,travel);
        const reveal=i===0?1:smooth(p,.12+i*.025,.34+i*.02);
        const scale=THREE.MathUtils.lerp(THREE.MathUtils.lerp(centerScale,.98,split),aim.scale,land)*reveal;
        group.position.x=settled?aim.x:THREE.MathUtils.damp(group.position.x,x,5.8,dt);
        group.position.y=settled?aim.y:THREE.MathUtils.damp(group.position.y,y,5.8,dt);
        group.position.z=THREE.MathUtils.lerp(-.16,0,land);
        const next=settled?aim.scale:THREE.MathUtils.damp(group.scale.x,Math.max(.0001,scale),8.5,dt);
        group.scale.setScalar(next);
        const wheel=i===0?spool.current:group;
        const targetX=.03+split*.09,targetY=HERO_YAW-split*.14+(i-1.5)*.035,targetZ=split*(i-1.5)*.015;
        wheel.rotation.x=settled?targetX:THREE.MathUtils.damp(wheel.rotation.x,targetX,5.8,dt);
        wheel.rotation.y=settled?targetY:THREE.MathUtils.damp(wheel.rotation.y,targetY,5.8,dt);
        wheel.rotation.z=settled?targetZ:THREE.MathUtils.damp(wheel.rotation.z,targetZ,5.8,dt);
        group.visible=i===0||next>.003;
      }
      return;
    }
    if(morphTint)setMorphTint(false);
    for(const group of extra.current)if(group)group.visible=false;
    let phase=sceneMotion.phase;
    let colorRect:DOMRect|undefined;
    // The section under the viewport decides visibility, including after fast scrolls.
    for(const [id,sectionPhase] of [
      ['engineered','engineered'],['color-universe','colors'],
      ['collection','hidden'],['creation','hidden'],
      ['showcase','hidden'],['finale','hidden']
    ]){
      const rect=document.getElementById(id)?.getBoundingClientRect();
      if(id==='color-universe')colorRect=rect;
      if(rect&&rect.top<=viewportLine&&rect.bottom>=viewportLine){phase=sectionPhase;break;}
    }
    const p=THREE.MathUtils.clamp(sceneMotion.progress,0,1);
    const damp=THREE.MathUtils.damp;
    let x=compact?0:2.3,y=compact?-.8:0,scale=compact?1.18:2.0;
    let yaw=HERO_YAW+sceneMotion.dragYaw+sceneMotion.heroScroll*.72;
    let pitch=HERO_PITCH+sceneMotion.dragPitch+sceneMotion.heroScroll*.72;
    let roll=HERO_ROLL;

    if(phase==='arrival'){
      // Hold the same front-facing pose from the first rendered frame.
    }else if(phase==='unwind'){
      const arrive=smooth(p,.01,.28);
      const depart=smooth(p,.72,.93);
      x=mix(compact?0:2.3,0,arrive);
      y=mix(compact?-.8:0,compact?1.65:1.50,arrive)+depart*.34;
      scale=mix(compact?1.18:2.0,compact?.8:1.23,arrive)*(1-depart*.40);
      yaw=HERO_YAW+sceneMotion.dragYaw+sceneMotion.heroScroll*.72+p*.64;
      pitch=HERO_PITCH+sceneMotion.dragPitch+sceneMotion.heroScroll*.72+p*4.2;
      roll=mix(HERO_ROLL,.04,arrive);
    }else if(phase==='engineered'){
      x=compact?0:Math.max(.8,Math.min(4.25,(size.width-900)*.0053-1));y=0;scale=compact?.96:1.74;yaw=3.45+sceneMotion.dragYaw;pitch=5.0+sceneMotion.dragPitch;roll=.31;
    }else if(phase==='colors'){
      // Keep the color-section pose in place, then turn it gently on the last scroll.
      const colorProgress=colorRect?THREE.MathUtils.clamp((viewportLine-colorRect.top)/colorRect.height,0,1):0;
      const turn=smooth(colorProgress,.62,.98);
      const worldPerPixel=2*8.5*Math.tan(THREE.MathUtils.degToRad(21))/size.height;
      x=compact?0:THREE.MathUtils.clamp(2.05+(size.width-1200)*.0033,2.05,4.2)-100*worldPerPixel;y=0;scale=compact?1.10:1.90;
      yaw=5.12+sceneMotion.dragYaw+turn*.28;
      pitch=6.7+sceneMotion.dragPitch+turn*.08;
      roll=turn*.04;
    }else{
      x=0;y=0;scale=.001;
    }
    // Damping remains frame-rate-independent on every channel.
    const f=scale===.001?12:phase==='unwind'?5.3:3.4;
    root.current.position.x=damp(root.current.position.x,x,f,delta);
    root.current.position.y=damp(root.current.position.y,y,f,delta);
    const nextScale=damp(root.current.scale.x,scale,f,delta);
    root.current.scale.setScalar(nextScale);
    root.current.visible=scale!==.001||nextScale>.015;
    spool.current.rotation.x=damp(spool.current.rotation.x,pitch,5.5,delta);
    spool.current.rotation.y=damp(spool.current.rotation.y,yaw,5.5,delta);
    spool.current.rotation.z=damp(spool.current.rotation.z,roll,5.5,delta);
    const cp=camera as THREE.PerspectiveCamera;
    cp.position.z=damp(cp.position.z,compact?9:8.5,2,delta);
    cp.lookAt(0,0,0);
  });
  return <>
    <group ref={root}><group ref={spool}><Spool color={morphTint?MORPH_COLORS[0]:undefined} quality="low"/></group></group>
    {sharedMorph&&MORPH_COLORS.slice(1).map((color,i)=><group key={i} ref={node=>{extra.current[i]=node}} visible={false} scale={.0001}><Spool color={color} quality="low" staticColor/></group>)}
  </>;
}

function Atmosphere(){
  const particles=useMemo(()=>{
    const positions=new Float32Array(125*3);
    for(let i=0;i<125;i++){
      positions[i*3]=Math.sin(i*35.45)*9;
      positions[i*3+1]=Math.cos(i*17.93)*6;
      positions[i*3+2]=-3-Math.abs(Math.sin(i*8.17))*7;
    }
    return positions;
  },[]);
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles,3]}/></bufferGeometry><pointsMaterial size={.014} color="#bc9cf6" sizeAttenuation transparent opacity={.40}/></points>;
}

export default function HeroWebGL({active,sharedMorph=false}:{active:boolean;sharedMorph?:boolean}){
  return <Canvas dpr={[1,1.35]} frameloop={active?'always':'never'} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}}
    camera={{position:[0,0,8.5],fov:42,near:.1,far:100}}
    style={{pointerEvents:'none'}} onCreated={({gl})=>gl.setClearColor('#000000',0)}>
    <ambientLight intensity={2.15} color="#ffffff"/>
    <directionalLight position={[-4,6,5]} color="#e2d4ff" intensity={3.8}/>
    <pointLight position={[4,2,2]} color="#a456ff" intensity={40} distance={20}/>
    <pointLight position={[-3,-4,0]} color="#5122ab" intensity={25} distance={15}/>
    <Suspense fallback={null}><StoryRig sharedMorph={sharedMorph}/><Atmosphere/></Suspense>
  </Canvas>;
}
