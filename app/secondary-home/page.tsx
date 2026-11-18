import SecondaryHome from '@/components/sections/SecondaryHome';
import {getCatalog} from '@/lib/catalog';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Explore the Filament Collection',description:'Compare UFILL3D materials, browse colors and preview a 3D spool before choosing your filament.'};
export const revalidate=60;
export default async function SecondaryHomePage(){const products=await getCatalog();return <SecondaryHome products={products}/>}
