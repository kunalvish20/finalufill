import {getCatalog} from '@/lib/catalog';
import {Configurator} from '@/components/products/Configurator';
export const metadata={title:'Color Lab | Choose Your Filament'};
export default async function Customize(){const products=await getCatalog();return <main className="inner-main"><div className="inner-container"><div className="micro">UFILL3D / INTERACTIVE COLOR LAB</div><h1 className="site-heading">THE <em>COLOR LAB.</em></h1><p className="lead" style={{marginBottom:35}}>Choose a material and color, then turn the 3D spool to see your selection from every angle.</p><Configurator products={products}/></div></main>}
