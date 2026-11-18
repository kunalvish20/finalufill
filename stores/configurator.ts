'use client';
import {create} from 'zustand';
import {COLORS} from '@/lib/catalog';
import type {FilamentColor} from '@/types/store';
export const useConfigurator=create<{color:FilamentColor;material:string;weight:number;setColor:(c:FilamentColor)=>void;setMaterial:(m:string)=>void;setWeight:(w:number)=>void}>((set)=>({color:COLORS[2],material:'pla-plus',weight:1,setColor:c=>set({color:c}),setMaterial:m=>set({material:m}),setWeight:w=>set({weight:w})}));
