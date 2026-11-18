'use client';
import {useEffect,useRef,Suspense} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import {Spool} from './Spool';
function WheelRig({color}:{color:string}){
 const group=useRef<THREE.Group>(null);
 const target=useRef(0);
 useEffect(()=>{
  let reset=0;
  const onScroll=()=>{target.current+=Math.sign(window.scrollY-reset)*.12;reset=window.scrollY;};
  window.addEventListener('scroll',onScroll,{passive:true});
  return()=>window.removeEventListener('scroll',onScroll);
 },[]);
 useFrame((_,delta)=>{
  if(!group.current)return;
  group.current.rotation.z=THREE.MathUtils.damp(group.current.rotation.z,target.current,3.1,delta);
 });
 return <group ref={group} rotation={[.1,1.3,0]}><Spool size={1.18} color={color} quality="low"/></group>;
}
export default function CommerceSpoolScene({color}:{color:string}){
 return <Canvas dpr={[1,1.35]} camera={{position:[0,0,4.2],fov:38,near:.1,far:60}} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}}>
 <ambientLight color="#ffffff" intensity={2.3}/>
 <hemisphereLight args={['#ffffff','#b3a0db',2.4]}/>
 <directionalLight position={[-3,5,6]} intensity={3.3} color="#ffffff"/>
 <directionalLight position={[4,0,1]} intensity={2.0} color="#ac77ff"/>
 <Suspense fallback={null}><WheelRig color={color}/><OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={.055} autoRotate autoRotateSpeed={.35} minPolarAngle={.55} maxPolarAngle={2.5}/></Suspense>
 </Canvas>;
}
