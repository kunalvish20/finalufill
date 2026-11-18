import type {Metadata} from 'next';
import {getCatalog} from '@/lib/catalog';
import {CatalogGrid} from '@/components/products/CatalogGrid';
export const metadata:Metadata={title:'Shop Filaments',description:'Browse UFILL3D filament by material and color. Compare options and find a spool for your next print.'};
export default async function Shop({searchParams}:{searchParams:Promise<{material?:string}>}){const products=await getCatalog();const params=await searchParams;return <main className="inner-main"><div className="inner-container"><div className="micro">UFILL3D / THE FILAMENT COLLECTION</div><h1 className="site-heading">FIND YOUR<br/><em>FILAMENT.</em></h1><p className="lead">Start with the material, explore the colors, and choose the spool that fits your next idea.</p><CatalogGrid products={products} initialMaterial={params.material}/></div></main>}
