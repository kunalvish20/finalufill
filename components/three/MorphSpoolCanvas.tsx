'use client';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {Suspense, useRef} from 'react';
import * as THREE from 'three';
import {Spool} from './Spool';
import {spoolMorphMotion} from '@/lib/spoolMorphMotion';

const clamp=THREE.MathUtils.clamp;
const ease=(x:number,a:number,b:number)=>THREE.MathUtils.smoothstep(clamp(x,0,1),a,b);
const lerp=THREE.MathUtils.lerp;

function MovingSpools({colors,withIntro}:{colors:string[];withIntro:boolean}){
 const groups=useRef<Array<THREE.Group|null>>([]);
 const {size,viewport}=useThree();
 const anchors=useRef<{x:number;y:number;scale:number}[]>([]);
 const clock=useRef(0);
 useFrame((state,dt)=>{
   const elapsed=Math.min(dt,.06);
   clock.current+=elapsed;
   if(clock.current>.075||anchors.current.length!==4){
     clock.current=0;
     anchors.current=[0,1,2,3].map(i=>{
       const target=document.querySelector<HTMLElement>(`[data-morph-target="${i}"]`);
       if(!target)return {x:0,y:-2.3,scale:.6};
       const rect=target.getBoundingClientRect();
       // Match scene objects to the real product-card visual areas (not hardcoded pixels).
       const ratio=viewport.width/size.width;
       return {
         x:(rect.left+rect.width/2-size.width/2)*ratio,
         y:(size.height/2-(rect.top+rect.height/2))*ratio,
         scale:Math.min(1.10,Math.min(rect.width*.72,rect.height*.86)*ratio/2.02)
       };
     });
   }
   const p=spoolMorphMotion.progress;
   const split=ease(p,.24,.70);
   const land=ease(p,.46,.86);
   const start=ease(p,0,.25);
   const fade=ease(p,.91,.99);
   const damp=THREE.MathUtils.damp;
   for(let i=0;i<4;i++){
     const group=groups.current[i];if(!group)continue;
     const aim=anchors.current[i]||{x:0,y:-2,scale:.6};
     const delay=i===0?0:ease(p,.24+i*.022,.66+i*.018);
     const reveal=i===0?1:delay;
     const centerX=0,centerY=withIntro?.01:-.04;
     // The four spools share one exact center, branch into an arc, then land in card frames.
     const arcX=(i-1.5)*(size.width<1050?.92:1.28);
     const arcY=.53+Math.abs(i-1.5)*-.16;
     const travel=ease(p,.38,.76);
     const x=lerp(lerp(centerX,arcX,split),aim.x,travel);
     const y=lerp(lerp(centerY,arcY,split),aim.y,travel);
     const centralScale=withIntro?1.62:1.47;
     const overallScale=lerp(lerp(centralScale,1.01,split),aim.scale,land);
     const targetScale=overallScale*reveal*(1-fade);
     const t=3.8;
     group.position.x=damp(group.position.x,x,t,elapsed);
     group.position.y=damp(group.position.y,y,t,elapsed);
     group.position.z=lerp(-.16,0,land);
     const sc=damp(group.scale.x,Math.max(.0001,targetScale),5.3,elapsed);
     group.scale.setScalar(sc);
     group.rotation.y=damp(group.rotation.y,1.26-split*.30+(i-1.5)*.09,4.2,elapsed);
     group.rotation.x=damp(group.rotation.x,.11+split*.14,4.2,elapsed);
     group.rotation.z=damp(group.rotation.z,split*(i-1.5)*.055+land*.02,4.2,elapsed);
     group.visible=targetScale>.0015||sc>.003;
   }
 });
 return <>{colors.map((color,i)=><group key={i} ref={node=>{groups.current[i]=node}} position={[0,0,-.16]} scale={i===0?1.4:.0001} rotation={[.11,1.28,0]}><Spool color={color} quality="low"/></group>)}</>;
}

export default function MorphSpoolCanvas({colors,withIntro=false}:{colors:string[];withIntro?:boolean}){
 return <Canvas dpr={[1,1.25]} camera={{position:[0,0,8.3],fov:40,near:.1,far:40}} frameloop="always"
   gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} style={{pointerEvents:'none'}}>
   <ambientLight color="#fff" intensity={2}/>
   <hemisphereLight args={['#ffffff','#b38af4',2.1]}/>
   <directionalLight position={[-4,6,6]} intensity={3.3} color="#fff"/>
   <directionalLight position={[5,2,3]} intensity={2.1} color="#b67cff"/>
   <Suspense fallback={null}><MovingSpools colors={colors} withIntro={withIntro}/></Suspense>
 </Canvas>;
}
