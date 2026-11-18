import {NextResponse} from 'next/server';
import {z} from 'zod';
import {randomUUID} from 'node:crypto';
import {serviceSupabase,authenticate} from '@/lib/supabase/server';
import {liveMode,razorpay} from '@/lib/payments/razorpay';
const item=z.object({productId:z.string().min(1).max(80),slug:z.string().min(1),color:z.string().min(1),weight:z.number().refine(v=>v===0.5||v===1),quantity:z.number().int().min(1).max(99),diameter:z.string().min(1)});
const schema=z.object({items:z.array(item).min(1).max(30),address:z.object({name:z.string().min(2).max(120),email:z.string().email().max(200),phone:z.string().min(8).max(20),line1:z.string().min(5).max(200),city:z.string().min(2).max(100),state:z.string().min(2).max(100),pincode:z.string().min(4).max(15),country:z.string().max(80)}),coupon:z.string().max(50).optional()});
export async function GET(){return NextResponse.json({live:liveMode()});}
export async function POST(req:Request){try{const body=schema.parse(await req.json());if(!liveMode()){return NextResponse.json({mode:'demo',reference:`DEMO-${randomUUID().slice(0,8).toUpperCase()}`,notice:'No payment accepted; no live order created'});}
const sb=serviceSupabase();const lineItems=[];
for(const i of body.items){const {data,error}=await sb.from('variants').select('id,product_id,price_paise,stock,products!inner(slug,active)').eq('product_id',i.productId).eq('color_name',i.color).eq('weight_grams',Math.round(i.weight*1000)).eq('diameter_mm',parseFloat(i.diameter)).eq('active',true).maybeSingle();if(error||!data) return NextResponse.json({error:`Unavailable configuration: ${i.slug}`},{status:400});lineItems.push({variantId:data.id,quantity:i.quantity});}
const user=await authenticate(req);const {data:reservation,error:dbError}=await sb.rpc('reserve_checkout',{p_items:lineItems,p_address:body.address,p_user:user?.id||null,p_coupon:body.coupon||null});if(dbError||!reservation) return NextResponse.json({error:dbError?.message||'Inventory validation failed'},{status:409});
const orderId=reservation.orderId as string,amount=reservation.amount as number;
try{const order=await razorpay().orders.create({amount,currency:'INR',receipt:orderId,notes:{ufill_order_id:orderId}});const {error:updateError}=await sb.from('orders').update({razorpay_order_id:order.id}).eq('id',orderId).eq('status','pending');if(updateError)throw updateError;
return NextResponse.json({mode:'live',orderId,razorpayOrderId:order.id,amount,keyId:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID});
}catch(err){await sb.rpc('release_pending_order',{p_order:orderId});throw err;}
}catch(err){if(err instanceof z.ZodError)return NextResponse.json({error:'Please check the order and shipping details'},{status:400});console.error('[checkout/create]',err);return NextResponse.json({error:'Checkout is temporarily unavailable'},{status:503});}}
