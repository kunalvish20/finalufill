import crypto from 'node:crypto';
import Razorpay from 'razorpay';
export const liveMode=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY&&process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET&&process.env.RAZORPAY_WEBHOOK_SECRET);
export function razorpay(){const key_id=process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,key_secret=process.env.RAZORPAY_KEY_SECRET;if(!key_id||!key_secret)throw new Error('Razorpay keys missing');return new Razorpay({key_id,key_secret})}
export function secureEqual(a:string,b:string){const x=Buffer.from(a,'utf8'),y=Buffer.from(b,'utf8');return x.length===y.length&&crypto.timingSafeEqual(x,y)}
export function verifyCheckout(orderId:string,paymentId:string,signature:string){const secret=process.env.RAZORPAY_KEY_SECRET;if(!secret)return false;const expected=crypto.createHmac('sha256',secret).update(`${orderId}|${paymentId}`).digest('hex');return secureEqual(expected,signature)}
export function verifyWebhook(payload:string,signature:string){const secret=process.env.RAZORPAY_WEBHOOK_SECRET;if(!secret)return false;const expected=crypto.createHmac('sha256',secret).update(payload).digest('hex');return secureEqual(expected,signature)}
