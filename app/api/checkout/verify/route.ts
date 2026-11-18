import {NextResponse} from 'next/server';
import {z} from 'zod';
import {serviceSupabase} from '@/lib/supabase/server';
import {verifyCheckout,liveMode,razorpay} from '@/lib/payments/razorpay';
const schema=z.object({orderId:z.string().uuid(),razorpay_order_id:z.string(),razorpay_payment_id:z.string(),razorpay_signature:z.string()});
export async function POST(req:Request){if(!liveMode())return NextResponse.json({error:'Live payments not configured'},{status:503});try{const body=schema.parse(await req.json());const sb=serviceSupabase();const {data:order}=await sb.from('orders').select('id,razorpay_order_id,status,total_paise').eq('id',body.orderId).maybeSingle();if(!order||order.razorpay_order_id!==body.razorpay_order_id)return NextResponse.json({error:'Order mismatch'},{status:400});if(!verifyCheckout(body.razorpay_order_id,body.razorpay_payment_id,body.razorpay_signature))return NextResponse.json({error:'Invalid payment signature'},{status:400});
// Cross-check provider data; do NOT mark paid here. Only webhook can do so.
const payment=await razorpay().payments.fetch(body.razorpay_payment_id);
if(payment.order_id!==body.razorpay_order_id||Number(payment.amount)!==order.total_paise||payment.currency!=='INR')return NextResponse.json({error:'Payment details mismatch'},{status:400});
return NextResponse.json({verified:true,paid:order.status==='paid',message:'Payment response verified. Await signed capture webhook for final settlement.'});
}catch(err){if(err instanceof z.ZodError)return NextResponse.json({error:'Invalid payload'},{status:400});console.error('[checkout/verify]',err);return NextResponse.json({error:'Unable to verify payment'},{status:503});}}
