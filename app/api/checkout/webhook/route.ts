import {NextResponse} from 'next/server';
import crypto from 'node:crypto';
import {serviceSupabase} from '@/lib/supabase/server';
import {verifyWebhook} from '@/lib/payments/razorpay';
export const runtime='nodejs';
export async function POST(req:Request){const raw=await req.text();const signature=req.headers.get('x-razorpay-signature')||'';if(!verifyWebhook(raw,signature))return NextResponse.json({error:'Invalid signature'},{status:401});try{
const event=JSON.parse(raw);const kind=event.event as string;const payment=event.payload?.payment?.entity;const order=event.payload?.order?.entity;
if(!['payment.captured','order.paid','payment.failed'].includes(kind))return NextResponse.json({accepted:true,ignored:true});
const providerOrderId=payment?.order_id||order?.id;
const amount=Number(payment?.amount??order?.amount);const currency=payment?.currency??order?.currency;
if(!providerOrderId||!Number.isInteger(amount)||!currency)return NextResponse.json({error:'Incomplete provider event'},{status:400});
const id=req.headers.get('x-razorpay-event-id')||crypto.createHash('sha256').update(raw).digest('hex');
const sb=serviceSupabase();const {data,error}=await sb.rpc('apply_payment_event',{p_event_id:id,p_gateway_order:providerOrderId,p_payment_id:payment?.id||'',p_kind:kind,p_amount:amount,p_currency:currency});
if(error){console.error('[checkout/webhook]',error);return NextResponse.json({error:'Event could not be processed'},{status:500});}
return NextResponse.json({accepted:true,result:data});
}catch(err){console.error('[checkout/webhook]',err);return NextResponse.json({error:'Malformed event'},{status:400});}}
