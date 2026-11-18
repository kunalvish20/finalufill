import type { FilamentColor, Product } from '@/types/store';
export const COLORS: FilamentColor[] = [
{name:'Electric Purple',hex:'#9a5cff'},{name:'Midnight Black',hex:'#22202c'},
{name:'Arctic White',hex:'#f3f0f7'},{name:'Ocean Blue',hex:'#276cde'},
{name:'Neon Green',hex:'#82ed63'},{name:'Sunset Orange',hex:'#f17c34'},
{name:'Rose Pink',hex:'#ed87c1'},{name:'Metallic Silver',hex:'#a9b1c3'},
{name:'Crimson Red',hex:'#d73d59'},{name:'Golden Yellow',hex:'#ffd35e'}];
const common = {diameter:'1.75 mm',stock:24,weightOptions:[0.5,1],heat:'190–220°C',bed:'40–60°C',speed:'40–80 mm/s'};
export const DEMO_PRODUCTS: Product[] = [
{id:'pla',slug:'pla',name:'PLA / Original',category:'PLA',tagline:'Start with the everyday favorite.',description:'A versatile starting point for models, prototypes and objects you want to make your own.',price:899,colors:COLORS,...common,badge:'START HERE',featured:true},
{id:'pla-plus',slug:'pla-plus',name:'PLA+ / Pro',category:'PLA+',tagline:'More room for detail.',description:'Explore a familiar PLA-style workflow with a material choice made for detailed ideas.',price:1099,colors:COLORS,...common,heat:'205–225°C',badge:'BESTSELLER',featured:true},
{id:'petg',slug:'petg',name:'PETG / Endure',category:'PETG',tagline:'For practical ideas in motion.',description:'A material option for makers planning functional objects and everyday-use parts.',price:1199,colors:COLORS.slice(0,8),...common,heat:'225–250°C',bed:'70–90°C',featured:true},
{id:'abs',slug:'abs',name:'ABS / Form',category:'ABS',tagline:'Shape your next functional part.',description:'An ABS material option for experienced makers working with a suitable enclosed setup.',price:1299,colors:COLORS.slice(0,6),...common,heat:'235–260°C',bed:'90–110°C',speed:'40–70 mm/s'},
{id:'asa',slug:'asa',name:'ASA / Atmos',category:'ASA',tagline:'Think beyond the workbench.',description:'An ASA option to explore for projects intended for outdoor conditions, subject to confirmed material specifications.',price:1499,colors:COLORS.slice(0,5),...common,heat:'245–265°C',bed:'90–110°C'},
{id:'tpu',slug:'tpu',name:'TPU / Flex',category:'TPU',tagline:'Give your idea some flexibility.',description:'A flexible material option for compatible printers and parts designed to bend.',price:1599,colors:COLORS.slice(0,7),...common,heat:'210–235°C',bed:'40–60°C',speed:'15–35 mm/s'},
{id:'silk-pla',slug:'silk-pla',name:'Silk PLA / Aura',category:'Silk PLA',tagline:'Make the finish part of the idea.',description:'A PLA-style option with a silk-like surface for decorative pieces and display models.',price:1399,colors:COLORS.slice(0,9),...common,heat:'200–225°C'},
{id:'matte-pla',slug:'matte-pla',name:'Matte PLA / Studio',category:'Matte PLA',tagline:'A quieter kind of finish.',description:'A PLA-style option with a soft matte look for models, objects and visual prototypes.',price:1199,colors:COLORS,...common},
{id:'specialty',slug:'specialty',name:'Specialty / Lab',category:'Specialty',tagline:'Leave room to experiment.',description:'Explore unusual textures and colorways; confirm each formulation before choosing print settings.',price:1799,colors:COLORS.slice(0,6),...common,heat:'Varies by formulation',bed:'Varies',speed:'Varies'}
];
export function getProduct(slug:string){return DEMO_PRODUCTS.find(p=>p.slug===slug)}
export function unitPrice(product:Product,weight:number){return Math.round(product.price*weight)}
export const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
export async function getCatalog():Promise<Product[]>{
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)return DEMO_PRODUCTS;
 try {const {createClient}=await import('@supabase/supabase-js');const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
 const {data,error}=await client.from('products').select('*,variants(*)').eq('active',true).order('sort_order');
 if(error || !data?.length)return DEMO_PRODUCTS;
 return data.map((r:any)=>({id:r.id,slug:r.slug,name:r.name,category:r.category,tagline:r.tagline||'',description:r.description||'',price:r.base_price_paise/100,weightOptions:[0.5,1],colors: r.variants?.length?Array.from(new Map<string, FilamentColor>(r.variants.map((v:any):[string,FilamentColor]=>[v.color_name,{name:v.color_name,hex:v.color_hex}])).values()):COLORS,diameter:'1.75 mm',stock:r.variants?.reduce((a:number,v:any)=>a+v.stock,0)||0,heat:r.heat||'',bed:r.bed||'',speed:r.speed||'',badge:r.badge||undefined,featured:r.featured||false,imageUrl:r.image_path?client.storage.from('ufill-product-images').getPublicUrl(r.image_path).data.publicUrl:undefined} as Product));
 }catch{return DEMO_PRODUCTS;}
}
