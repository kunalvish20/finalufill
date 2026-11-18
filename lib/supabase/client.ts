import {createClient,SupabaseClient} from '@supabase/supabase-js';
let instance:SupabaseClient | undefined;
export function browserSupabase(){if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)return null;return instance??=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);}
