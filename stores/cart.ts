'use client';
import {create} from 'zustand';
import {persist,createJSONStorage} from 'zustand/middleware';
import type { CartItem,FilamentColor,Product } from '@/types/store';
import {unitPrice} from '@/lib/catalog';
type CartState={items:CartItem[];add:(product:Product,color:FilamentColor,weight:number,qty?:number)=>void;remove:(key:string)=>void;quantity:(key:string,qty:number)=>void;clear:()=>void};
export const useCart=create<CartState>()(persist((set)=>({
 items:[],
 add:(p,c,w,q=1)=>{
  set(s=>{const key=[p.id,c.name,w,p.diameter].join(':');const current=s.items.find(i=>i.key===key);return{items:current?s.items.map(i=>i.key===key?{...i,quantity:Math.min(99,i.quantity+q)}:i):[...s.items,{key,productId:p.id,slug:p.slug,name:p.name,color:c,weight:w,diameter:p.diameter,unitPrice:unitPrice(p,w),quantity:q}]}});
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('ufill3d:cart-add',{detail:{name:p.name,color:c.name,weight:w,quantity:q}}));
 },
 remove:key=>set(s=>({items:s.items.filter(i=>i.key!==key)})),
 quantity:(key,qty)=>set(s=>({items:s.items.map(i=>i.key===key?{...i,quantity:Math.max(1,Math.min(99,qty))}:i)})),
 clear:()=>set({items:[]})
}),{name:'ufill3d-cart',storage:createJSONStorage(()=>localStorage)}));
export const cartSubtotal=(items:CartItem[])=>items.reduce((sum,item)=>sum+item.unitPrice*item.quantity,0);
