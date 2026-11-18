'use client';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import * as THREE from 'three';
import {useConfigurator} from '@/stores/configurator';

/** The actual photographed UFILL3D white-face / purple-rim GLB, NOT a procedural placeholder.
 * Only the coiled PLA material is recolored. Face decals, plastic, rim and silver hub stay intact.
 * Model is exported facing +Z; rotate it -90 degrees to match the original animation's X-axis wheel.
 */
export type SpoolProps={size?:number;interactive?:boolean;animated?:boolean;color?:string;quality?:'high'|'low';staticColor?:boolean};
export function Spool({size=1,interactive=false,animated=false,color,quality='high',staticColor=false}:SpoolProps){
 const {scene}=useGLTF(quality==='low'?'/models/ufill3d_spool_low.glb':'/models/ufill3d_spool.glb');
 const configured=useConfigurator(s=>s.color.hex);
 const wheel=useRef<THREE.Group>(null);
 const initialColor=staticColor?color:undefined;
 const tint=useMemo(()=>new THREE.Color(color||configured),[color,configured]);
 const grooveTint=useMemo(()=>tint.clone().multiplyScalar(.68),[tint]);
 const {model,filamentMaterials}=useMemo(()=>{
   const cloned=scene.clone(true);
   const filamentMaterials:THREE.MeshStandardMaterial[]=[];
   cloned.traverse(child=>{
     if(!(child instanceof THREE.Mesh))return;
     child.castShadow=true;child.receiveShadow=true;
     // glTF clones share materials unless they are explicitly cloned here.
     const original=Array.isArray(child.material)?child.material:[child.material];
     const materials=original.map(material=>{
       const copy=material.clone();
       if(/PLA\+\s*\|\s*(White filament strands|filament highlight|winding groove)/i.test(copy.name) && 'color' in copy){
         const m=copy as THREE.MeshStandardMaterial;
         if(/White filament strands/i.test(copy.name)){
           m.roughness=.44;
           m.metalness=.015;
           m.envMapIntensity=1.2;
         }
         if(/winding groove/i.test(copy.name)){
           m.roughness=.58;
           m.metalness=0;
           m.envMapIntensity=.9;
         }
         if(/filament highlight/i.test(copy.name)){
           m.roughness=.28;
           m.metalness=0;
           m.envMapIntensity=1.35;
         }
         if(initialColor){
           const tint=new THREE.Color(initialColor);
           m.color.copy(/winding groove/i.test(copy.name)?tint.multiplyScalar(.68):tint);
         }
         filamentMaterials.push(m);
       }
       return copy;
     });
     if(/08\s*•\s*Underlying coiled filament core/i.test(child.name)){
       child.scale.set(1.008,1.008,1.02);
     }
     if(/09\s*•\s*Seventy-two dimensional PLA filament windings/i.test(child.name)){
       child.scale.set(1.01,1.01,1.025);
     }
     child.material=Array.isArray(child.material)?materials:materials[0];
   });
   return {model:cloned,filamentMaterials};
 },[scene,initialColor]);
 useFrame((_,delta)=>{
   for(const material of filamentMaterials){
     const target=/winding groove/i.test(material.name)?grooveTint:tint;
     material.color.lerp(target,1-Math.exp(-delta*5.7));
   }
   if(interactive&&!animated&&wheel.current)wheel.current.rotation.x+=delta*.045;
 });
 return <group ref={wheel} scale={size}><group rotation={[0,-Math.PI/2,0]}><primitive object={model}/></group></group>;
}
