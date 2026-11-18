'use client';
import {Canvas, useFrame} from '@react-three/fiber';
import {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {printerMotion} from './PrinterScene';

const LAYERS=92;
const STEP=.030;
function shapeRadius(angle:number){
 return 1+.045*Math.cos(angle*6)+.032*Math.cos(angle*3+.4);
}
function Printer(){
 const layers=useRef<THREE.InstancedMesh>(null);
 const gantry=useRef<THREE.Group>(null);
 const carriage=useRef<THREE.Group>(null);
 const nozzle=useRef<THREE.Group>(null);
 const printGlow=useRef<THREE.PointLight>(null);
 const drip=useRef<THREE.Mesh>(null);
 const model=useRef<THREE.Group>(null);
 const visibleProgress=useRef(0);
 const reducedMotion=useRef<boolean|null>(null);
 const layerGeom=useMemo(()=>{
   const points=[];
   for(let i=0;i<=140;i++){
      const a=i/140*Math.PI*2;
      const radius=shapeRadius(a);
      points.push(new THREE.Vector3(radius*Math.cos(a),0,radius*Math.sin(a)));
   }
   return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,true,'centripetal'),220,.0145,6,true);
 },[]);
 useLayoutEffect(()=>{
   if(!layers.current)return;
   const matrix=new THREE.Matrix4();
   const position=new THREE.Vector3();
   const quaternion=new THREE.Quaternion();
   const scale=new THREE.Vector3();
   const colors=[new THREE.Color('#ad78ee'),new THREE.Color('#9862db'),new THREE.Color('#c29dff')];
   for(let i=0;i<LAYERS;i++){
     const t=i/(LAYERS-1);
     // A gradually tapered engineering vase with a subtle flared rim.
     const width=.68+.16*Math.sin(t*Math.PI*.86)+.17*Math.pow(t,3);
     position.set(0,.20+i*STEP,0);
     scale.set(width,1,width);
     matrix.compose(position,quaternion,scale);
     layers.current.setMatrixAt(i,matrix);
     layers.current.setColorAt(i,colors[i%3]);
   }
   layers.current.instanceMatrix.needsUpdate=true;
   if(layers.current.instanceColor)layers.current.instanceColor.needsUpdate=true;
 },[]);
 useFrame((state,dt)=>{
   const target=THREE.MathUtils.clamp(printerMotion.progress,0,1);
   if(reducedMotion.current===null)reducedMotion.current=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   visibleProgress.current=reducedMotion.current?target:THREE.MathUtils.damp(visibleProgress.current,target,3.2,Math.min(dt,.05));
   if(target===1&&visibleProgress.current>.997)visibleProgress.current=1;
   if(target===0&&visibleProgress.current<.003)visibleProgress.current=0;
   const progress=visibleProgress.current;
   const floating=progress*LAYERS;
   if(layers.current)layers.current.count=Math.floor(floating);
   const layer=Math.min(LAYERS-1,Math.floor(floating));
   // Scroll controls the height while a slower toolpath keeps the head readable.
   const phase=progress*Math.PI*2*12;
   const t=layer/(LAYERS-1);
   const rad=(.68+.16*Math.sin(t*Math.PI*.86)+.17*Math.pow(t,3))*shapeRadius(phase);
   const contactY=.20+layer*STEP+.015;
   if(gantry.current)gantry.current.position.y=contactY+.95;
   if(carriage.current)carriage.current.position.x=rad*Math.cos(phase);
   if(nozzle.current)nozzle.current.position.z=rad*Math.sin(phase);
   if(printGlow.current)printGlow.current.intensity=progress>0&&progress<.999?7+2*Math.sin(state.clock.elapsedTime*14):1;
   if(drip.current)drip.current.scale.y=.7+.25*Math.sin(state.clock.elapsedTime*14);
   if(model.current)model.current.rotation.y=THREE.MathUtils.damp(model.current.rotation.y,.24,2,dt);
 });
 return <group ref={model} position={[.65,-1.6,0]} rotation={[0,.24,0]}>
   <mesh position={[0,.015,0]} receiveShadow><boxGeometry args={[3.4,.18,3.1]}/><meshStandardMaterial color="#180d29" metalness={.35} roughness={.55}/></mesh>
   <mesh position={[0,.13,0]} receiveShadow><boxGeometry args={[2.88,.085,2.65]}/><meshStandardMaterial color="#33214d" metalness={.65} roughness={.31}/></mesh>
   <mesh position={[0,.177,0]}><boxGeometry args={[2.62,.013,2.39]}/><meshStandardMaterial color="#52406a" metalness={.45} roughness={.42}/></mesh>
   {/* Reference grid and build-volume details. */}
   {[-1,0,1].map(i=><group key={i}><mesh position={[i*.79,.187,0]}><boxGeometry args={[.006,.002,2.35]}/><meshBasicMaterial color="#8d5bc9" transparent opacity={.32}/></mesh><mesh position={[0,.187,i*.74]}><boxGeometry args={[2.55,.002,.006]}/><meshBasicMaterial color="#8d5bc9" transparent opacity={.32}/></mesh></group>)}
   {([-1.55,1.55] as const).flatMap(x=>[-1.35,1.35].map(z=><group key={`${x}-${z}`} position={[x,0,z]}>
     <mesh position={[0,2.24,0]}><cylinderGeometry args={[.042,.042,4.4,10]}/><meshStandardMaterial color="#8972ac" metalness={.68} roughness={.25}/></mesh>
     <mesh position={[0,.20,0]}><boxGeometry args={[.24,.22,.24]}/><meshStandardMaterial color="#241638" metalness={.4} roughness={.48}/></mesh>
     <mesh position={[0,4.39,0]}><boxGeometry args={[.25,.19,.25]}/><meshStandardMaterial color="#241638" metalness={.4} roughness={.48}/></mesh>
   </group>))}
   {[-1.35,1.35].map(z=><mesh key={`top-x-${z}`} position={[0,4.28,z]}><boxGeometry args={[3.22,.16,.19]}/><meshStandardMaterial color="#756289" metalness={.65} roughness={.31}/></mesh>)}
   {[-1.55,1.55].map(x=><mesh key={`top-z-${x}`} position={[x,4.28,0]}><boxGeometry args={[.19,.16,2.7]}/><meshStandardMaterial color="#756289" metalness={.65} roughness={.31}/></mesh>)}
   {/* Every complete circular tool-path is an individual rounded extruded filament strand. */}
   <instancedMesh ref={layers} args={[layerGeom,undefined,LAYERS]} frustumCulled={false} castShadow receiveShadow>
      <meshStandardMaterial color="#ffffff" metalness={.12} roughness={.39}/>
   </instancedMesh>
   {/* The X rail slides on all four uprights; its carriage carries the Y rail and print head. */}
   <group ref={gantry} position={[0,1.165,0]}>
     {[-1.35,1.35].map(z=><mesh key={`x-rail-${z}`} position={[0,0,z]}><boxGeometry args={[3.22,.11,.16]}/><meshStandardMaterial color="#8e79ae" metalness={.72} roughness={.25}/></mesh>)}
     {([-1.55,1.55] as const).flatMap(x=>[-1.35,1.35].map(z=><mesh key={`sleeve-${x}-${z}`} position={[x,0,z]}><boxGeometry args={[.19,.25,.22]}/><meshStandardMaterial color="#332049" metalness={.55} roughness={.38}/></mesh>))}
     <group ref={carriage} position={[.7,0,0]}>
       <mesh><boxGeometry args={[.16,.12,2.76]}/><meshStandardMaterial color="#a08bbd" metalness={.7} roughness={.28}/></mesh>
       <group ref={nozzle} position={[0,-.95,.2]}>
     <mesh position={[0,.95,0]} castShadow><boxGeometry args={[.56,.47,.60]}/><meshStandardMaterial color="#c7b5e1" roughness={.23} metalness={.48}/></mesh>
     <mesh position={[0,.62,0]}><cylinderGeometry args={[.20,.28,.42,12]}/><meshStandardMaterial color="#4c346a" metalness={.52} roughness={.37}/></mesh>
     <mesh position={[0,.26,0]}><cylinderGeometry args={[.14,.055,.29,12]}/><meshStandardMaterial color="#e4c5ab" metalness={.81} roughness={.18}/></mesh>
     <mesh ref={drip} position={[0,.12,0]}><cylinderGeometry args={[.019,.019,.21,7]}/><meshStandardMaterial color="#e7caff" emissive="#a164ff" emissiveIntensity={.5}/></mesh>
     <pointLight ref={printGlow} color="#bb78ff" intensity={6} distance={2.6} position={[0,.08,0]}/>
       </group>
     </group>
   </group>
 </group>;
}
export default function PrinterSceneInner(){return <Canvas camera={{position:[4.3,2.25,7.4],fov:40,near:.1,far:70}} dpr={[1,1.4]} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}}>
 <ambientLight intensity={1.7} color="#faf5ff"/>
 <hemisphereLight args={['#eee3ff','#35214b',1.8]}/>
 <directionalLight intensity={3.7} color="#e5d7ff" position={[3,7,4]}/>
 <directionalLight intensity={2.4} color="#aa7cff" position={[-4,3,-2]}/>
 <SuspenseSafePrinter/>
 </Canvas>}
function SuspenseSafePrinter(){return <Printer/>}
