'use client';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Spool} from './Spool';
export default function ProductViewerInner({color,compact,detail=false}:{color?:string;compact?:boolean;detail?:boolean}){return <Canvas dpr={[1,1.75]} camera={detail?{position:[1.8,1,3.8],fov:39,near:.1,far:50}:{position:[2.4,1.5,4.6],fov:37}} gl={{alpha:true,antialias:true}}>
 <ambientLight intensity={1.9} color="#ded0ff"/><directionalLight position={[-4,5,6]} intensity={4.7} color="#ffffff"/><pointLight position={[4,2,-3]} intensity={60} color="#7d38ff" distance={15}/>
 <Spool size={detail?1.2:compact?1.04:1.16} color={color}/><OrbitControls enablePan={false} enableZoom={!detail} minDistance={detail?3.8:4.7} maxDistance={detail?5.5:11} enableDamping dampingFactor={.07} autoRotate autoRotateSpeed={detail?.25:.42}/>
 </Canvas>}
