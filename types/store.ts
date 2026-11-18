export type FilamentColor = {name: string; hex: string};
export type Product = {id: string;slug:string;name:string;category:string;tagline:string;description:string;price:number;weightOptions:number[];colors:FilamentColor[];diameter:string;stock:number;heat:string;bed:string;speed:string;badge?:string;featured?:boolean;imageUrl?:string};
export type CartItem = {key:string;productId:string;slug:string;name:string;color:FilamentColor;weight:number;diameter:string;unitPrice:number;quantity:number};
export type CheckoutAddress = {name:string;email:string;phone:string;line1:string;city:string;state:string;pincode:string;country:string};
