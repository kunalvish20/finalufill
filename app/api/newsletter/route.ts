import {NextResponse} from 'next/server';
import {z} from 'zod';
import {serviceSupabase} from '@/lib/supabase/server';
export async function POST(req:Request){try{const {email}=z.object({email:z.string().email().max(200)}).parse(await req.json());if(!process.env.SUPABASE_SERVICE_ROLE_KEY)return NextResponse.json({error:'Newsletter is unavailable in demo mode; email was not saved.'},{status:503});const {error}=await serviceSupabase().from('newsletter_subscribers').upsert({email:email.toLowerCase()},{onConflict:'email',ignoreDuplicates:true});if(error)throw error;return NextResponse.json({success:true});}catch{return NextResponse.json({error:'Unable to subscribe; check your email and configuration'},{status:400})}}
