import {NextResponse} from 'next/server';
import {z} from 'zod';
import {serviceSupabase} from '@/lib/supabase/server';
const schema=z.object({name:z.string().min(2).max(100),email:z.string().email().max(200),message:z.string().min(10).max(3000)});
export async function POST(req:Request){try{const body=schema.parse(await req.json());if(!process.env.SUPABASE_SERVICE_ROLE_KEY)return NextResponse.json({error:'Message delivery is disabled in demo mode; no message has been sent.'},{status:503});const {error}=await serviceSupabase().from('contact_messages').insert(body);if(error)throw error;return NextResponse.json({success:true,message:'Your message has been recorded in the store inbox.'});}catch(err){if(err instanceof z.ZodError)return NextResponse.json({error:'Please complete the required fields'},{status:400});return NextResponse.json({error:'The message could not be stored; please try again.'},{status:503})}}
