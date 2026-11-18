import type {Metadata} from 'next';
import TertiaryHome from '@/components/sections/TertiaryHome';
import {getCatalog} from '@/lib/catalog';
export const metadata:Metadata={title:'The 3D Material Journey',description:'Watch one UFILL3D spool become four material choices, then explore colors and product details.'};
export const revalidate=60;
export default async function TertiaryPage(){return <TertiaryHome products={await getCatalog()}/>}
