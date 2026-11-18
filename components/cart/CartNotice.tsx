'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Check,X} from 'lucide-react';

type AddedItem={name:string;color:string;weight:number;quantity:number};

export function CartNotice(){
 const [item,setItem]=useState<AddedItem|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{
  const onAdd=(event:Event)=>{
   setItem((event as CustomEvent<AddedItem>).detail);
   if(timer.current)clearTimeout(timer.current);
   timer.current=setTimeout(()=>setItem(null),5500);
  };
  window.addEventListener('ufill3d:cart-add',onAdd);
  return()=>{window.removeEventListener('ufill3d:cart-add',onAdd);if(timer.current)clearTimeout(timer.current)};
 },[]);
 if(!item)return null;
 return <div className="cart-notice" role="status" aria-live="polite">
  <span className="cart-notice-icon"><Check size={18}/></span>
  <div><strong>Added to your bag</strong><small>{item.name} · {item.color} · {item.weight} KG{item.quantity>1?` × ${item.quantity}`:''}</small></div>
  <Link href="/cart" onClick={()=>setItem(null)}>VIEW BAG <ArrowUpRight size={15}/></Link>
  <button type="button" onClick={()=>setItem(null)} aria-label="Dismiss cart confirmation"><X size={16}/></button>
 </div>;
}
