'use client';

import {Suspense} from 'react';
import {Canvas} from '@react-three/fiber';
import {Spool} from './Spool';

/** A still, front three-quarter product pose keeps the label and filament visible. */
export default function MorphCardSpoolScene({color}:{color:string}){
 return <Canvas frameloop="demand" dpr={[1,1.3]} camera={{position:[0,0,4.55],fov:37,near:.1,far:20}}
   gl={{alpha:true,antialias:true,powerPreference:'low-power'}} style={{pointerEvents:'none'}}>
   <ambientLight color="#ffffff" intensity={1.25}/>
   <hemisphereLight args={['#ffffff','#c6b6e3',1.05]}/>
   <directionalLight position={[-3,5,6]} intensity={2.35} color="#ffffff"/>
   <directionalLight position={[4,1,3]} intensity={.8} color="#d7b9fa"/>
   <Suspense fallback={null}>
     <group rotation={[.19,1.01,.025]}>
       <Spool size={1.16} color={color} quality="low" staticColor/>
     </group>
   </Suspense>
 </Canvas>;
}
