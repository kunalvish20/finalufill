import HomeExperience from '@/components/sections/HomeExperience';
import {getCatalog} from '@/lib/catalog';
export const revalidate=60;
export default async function Home(){const products=await getCatalog();return <HomeExperience products={products}/>}
