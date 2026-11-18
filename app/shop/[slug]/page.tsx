import {notFound} from 'next/navigation';
import Link from 'next/link';
import type {Metadata} from 'next';
import {getCatalog,DEMO_PRODUCTS} from '@/lib/catalog';
import {ProductDetail} from '@/components/products/ProductDetail';
import {ProductCard} from '@/components/products/ProductCard';
export async function generateStaticParams(){return DEMO_PRODUCTS.map(p=>({slug:p.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;return {title:slug.replaceAll('-',' ').toUpperCase()}}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const products=await getCatalog();const p=products.find(p=>p.slug===slug);if(!p)notFound();return <main className="inner-main product-page"><div className="inner-container"><ProductDetail product={p}/><section className="product-related" aria-labelledby="related-heading"><div className="micro">YOU MAY ALSO LIKE</div><h2 id="related-heading">KEEP EXPLORING.</h2><div className="catalog-grid">{products.filter(i=>i.id!==p.id).slice(0,3).map((i,j)=><ProductCard key={i.id} product={i} index={j}/>)}</div></section></div></main>}
