-- UFILL3D 001: run once in Supabase SQL Editor. Demo catalog is independent of this migration.
create extension if not exists pgcrypto;
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
 category text not null, tagline text default '', description text default '',
 base_price_paise integer not null check(base_price_paise>=0),
 heat text default '',bed text default '',speed text default '',
 badge text,image_path text,featured boolean not null default false,active boolean not null default true,
 sort_order integer not null default 0,created_at timestamptz not null default now()
);
create table if not exists public.variants (
 id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id) on delete cascade,
 color_name text not null,color_hex text not null default '#9a5cff',weight_grams integer not null check(weight_grams in(500,1000)),
 diameter_mm numeric(4,2) not null default 1.75,
 price_paise integer not null check(price_paise>=0),stock integer not null default 0 check(stock>=0),
 active boolean not null default true,sku text unique,
 unique(product_id,color_name,weight_grams,diameter_mm)
);
create table if not exists public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz default now());
create table if not exists public.customer_addresses(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 label text not null default 'Home',name text not null,phone text not null,
 line1 text not null,city text not null,state text not null,pincode text not null,country text not null default 'India',
 created_at timestamptz not null default now()
);
create table if not exists public.coupons (
 id uuid primary key default gen_random_uuid(),code text not null unique,
 discount_type text not null check(discount_type in ('fixed','percent')),
 discount_value integer not null check(discount_value>0),
 min_order_paise integer not null default 0,max_uses integer,
 used_count integer not null default 0,expires_at timestamptz,active boolean default true,
 check(discount_type!='percent' or discount_value<=100)
);
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
 customer_email text not null,shipping_address jsonb not null,
 subtotal_paise integer not null check(subtotal_paise>=0), discount_paise integer not null default 0 check(discount_paise>=0),
 total_paise integer not null check(total_paise>=100),currency text not null default 'INR',
 coupon_id uuid references public.coupons(id) on delete set null,
 status text not null default 'pending' check(status in('pending','paid','expired','review_required','refunded','cancelled')),
 razorpay_order_id text unique,razorpay_payment_id text unique,
 created_at timestamptz not null default now(),paid_at timestamptz
);
create table if not exists public.order_items (
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,
 variant_id uuid not null references public.variants(id),name text not null,color_name text not null,
 weight_grams integer not null,quantity integer not null check(quantity between 1 and 99),
 unit_price_paise integer not null check(unit_price_paise>=0)
);
-- Optional managed product imagery, uploaded through authenticated admin API.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('ufill-product-images','ufill-product-images',true,5242880,ARRAY['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
create table if not exists public.contact_messages(id uuid primary key default gen_random_uuid(),name text not null,email text not null,message text not null,created_at timestamptz not null default now());
create table if not exists public.newsletter_subscribers(id uuid primary key default gen_random_uuid(),email text not null unique,created_at timestamptz not null default now());
create table if not exists public.payment_events (
 event_id text primary key,order_id uuid references public.orders(id),kind text not null,
 created_at timestamptz not null default now()
);
create index if not exists idx_orders_user on public.orders(user_id,created_at desc);
create index if not exists idx_variants_product on public.variants(product_id);
create index if not exists idx_items_order on public.order_items(order_id);

-- Default: lock down all tables; make only active storefront products and variants publicly readable.
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.admin_users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.payment_events enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
create policy "shop public products" on public.products for select to anon,authenticated using(active=true);
create policy "shop public variants" on public.variants for select to anon,authenticated using(active=true and exists(select 1 from public.products p where p.id=variants.product_id and p.active));
create policy "my own orders" on public.orders for select to authenticated using(user_id=auth.uid());
create policy "my own order lines" on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
create policy "my saved addresses" on public.customer_addresses for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "admin self" on public.admin_users for select to authenticated using(user_id=auth.uid());
-- All privileged writes performed only from server using service-role. No write RLS for client on orders/stock/admin tables.

-- One transaction locks every exact SKU and validates current price, stock, and coupon.
create or replace function public.reserve_checkout(p_items jsonb,p_address jsonb,p_user uuid default null,p_coupon text default null)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare it jsonb;v public.variants%rowtype;p public.products%rowtype;
 v_qty integer;v_weight integer;v_total integer:=0;v_discount integer:=0;
 v_order uuid;v_coupon public.coupons%rowtype;v_variant uuid;v_records integer:=0;
begin
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)<1 or jsonb_array_length(p_items)>30 then raise exception 'Invalid order items';end if;
 if length(coalesce(p_address->>'name',''))<2 or length(coalesce(p_address->>'email',''))<5 or length(coalesce(p_address->>'line1',''))<5 then raise exception 'Invalid address';end if;
 -- All rows locked in stable UUID order to avoid oversell and lock-order deadlocks.
 for it in select value from jsonb_array_elements(p_items) order by (value->>'variantId') loop
   v_qty:=coalesce((it->>'quantity')::int,0);
   if v_qty<1 or v_qty>99 then raise exception 'Invalid quantity';end if;
   v_variant:=(it->>'variantId')::uuid;
   select * into v from public.variants where id=v_variant and active=true for update;
   if not found then raise exception 'Variant not found';end if;
   select * into p from public.products where id=v.product_id and active=true;
   if not found then raise exception 'Inactive product';end if;
   if v.stock<v_qty then raise exception 'Not enough stock for %',p.name;end if;
   v_total:=v_total+v_qty*v.price_paise;v_records:=v_records+1;
 end loop;
 if v_total<100 then raise exception 'Order minimum is INR 1';end if;
 if nullif(upper(trim(p_coupon)),'') is not null then
  select * into v_coupon from public.coupons where code=upper(trim(p_coupon)) and active=true for update;
  if not found then raise exception 'Invalid coupon';end if;
  if v_coupon.expires_at is not null and v_coupon.expires_at<now() then raise exception 'Coupon expired';end if;
  if v_coupon.max_uses is not null and v_coupon.used_count>=v_coupon.max_uses then raise exception 'Coupon use limit reached';end if;
  if v_total<v_coupon.min_order_paise then raise exception 'Coupon minimum not reached';end if;
  v_discount:=case when v_coupon.discount_type='fixed' then v_coupon.discount_value else floor(v_total*v_coupon.discount_value/100)::int end;
  v_discount:=least(v_discount,v_total-100);
 end if;
 insert into public.orders(user_id,customer_email,shipping_address,subtotal_paise,discount_paise,total_paise,coupon_id)
 values(p_user,lower(p_address->>'email'),p_address,v_total,v_discount,v_total-v_discount,case when nullif(upper(trim(p_coupon)),'') is not null then v_coupon.id else null end)
 returning id into v_order;
 for it in select value from jsonb_array_elements(p_items) order by (value->>'variantId') loop
  v_variant:=(it->>'variantId')::uuid;v_qty:=(it->>'quantity')::int;
  select * into v from public.variants where id=v_variant;
  select * into p from public.products where id=v.product_id;
  update public.variants set stock=stock-v_qty where id=v_variant;
  insert into public.order_items(order_id,variant_id,name,color_name,weight_grams,quantity,unit_price_paise)
  values(v_order,v_variant,p.name,v.color_name,v.weight_grams,v_qty,v.price_paise);
 end loop;
 return jsonb_build_object('orderId',v_order,'amount',v_total-v_discount);
end $$;

create or replace function public.release_pending_order(p_order uuid)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare v_status text;it record;
begin
 select status into v_status from public.orders where id=p_order for update;
 if v_status is distinct from 'pending' then return false;end if;
 for it in select variant_id,quantity from public.order_items where order_id=p_order order by variant_id loop
  update public.variants set stock=stock+it.quantity where id=it.variant_id;
 end loop;
 update public.orders set status='expired' where id=p_order;
 return true;
end $$;

-- The provider webhook, not browser callbacks, is the single authoritative payment transition.
create or replace function public.apply_payment_event(p_event_id text,p_gateway_order text,p_payment_id text,p_kind text,p_amount integer,p_currency text)
returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders%rowtype;
begin
 if p_kind not in ('payment.captured','order.paid','payment.failed') then return 'ignored';end if;
 select * into o from public.orders where razorpay_order_id=p_gateway_order for update;
 if not found then return 'unknown_order';end if;
 if o.total_paise<>p_amount or p_currency<>'INR' then raise exception 'Amount mismatch';end if;
 insert into public.payment_events(event_id,order_id,kind) values(p_event_id,o.id,p_kind) on conflict do nothing;
 if not found then return 'duplicate';end if;
 if p_kind in('payment.captured','order.paid') then
  if o.status='pending' then
   update public.orders set status='paid',paid_at=now(),razorpay_payment_id=nullif(p_payment_id,'') where id=o.id;
   if o.coupon_id is not null then update public.coupons set used_count=used_count+1 where id=o.coupon_id;end if;
   return 'paid';
  elsif o.status='paid' then return 'already_paid';
  else
   update public.orders set status='review_required',razorpay_payment_id=nullif(p_payment_id,'') where id=o.id;
   return 'manual_review_late_payment';
  end if;
 end if;
 return 'logged_failure';
end $$;

-- The final scheduled expiry must check provider status operationally before release.
revoke all on function public.reserve_checkout(jsonb,jsonb,uuid,text) from public,anon,authenticated;
revoke all on function public.release_pending_order(uuid) from public,anon,authenticated;
revoke all on function public.apply_payment_event(text,text,text,text,integer,text) from public,anon,authenticated;
grant execute on function public.reserve_checkout(jsonb,jsonb,uuid,text) to service_role;
grant execute on function public.release_pending_order(uuid) to service_role;
grant execute on function public.apply_payment_event(text,text,text,text,integer,text) to service_role;

-- Seed a live starter catalog with exact variants. All prices/stock are TEST values; replace before selling.
insert into public.products(slug,name,category,tagline,description,base_price_paise,heat,bed,speed,featured,sort_order) values
('pla','PLA / Original','PLA','Everyday creative essential','Starter catalog item — update commercial description before selling',89900,'190–220°C','40–60°C','40–80 mm/s',true,1),
('pla-plus','PLA+ / Pro','PLA+','Beyond your everyday layer','Starter catalog item — update commercial description before selling',109900,'205–225°C','40–60°C','40–80 mm/s',true,2),
('petg','PETG / Endure','PETG','Built for makers','Starter catalog item — update commercial description before selling',119900,'225–250°C','70–90°C','40–80 mm/s',true,3),
('abs','ABS / Form','ABS','Engineering-ready','Starter catalog item — update commercial description before selling',129900,'235–260°C','90–110°C','40–70 mm/s',false,4),
('asa','ASA / Atmos','ASA','Outdoor creativity','Starter catalog item — update commercial description before selling',149900,'245–265°C','90–110°C','40–70 mm/s',false,5),
('tpu','TPU / Flex','TPU','Bend the rules','Starter catalog item — update commercial description before selling',159900,'210–235°C','40–60°C','15–35 mm/s',false,6),
('silk-pla','Silk PLA / Aura','Silk PLA','A little more luminous','Starter catalog item — update commercial description before selling',139900,'200–225°C','40–60°C','40–70 mm/s',false,7),
('matte-pla','Matte PLA / Studio','Matte PLA','Low-sheen finish','Starter catalog item — update commercial description before selling',119900,'190–220°C','40–60°C','40–80 mm/s',false,8),
('specialty','Specialty / Lab','Specialty','Experiments in texture','Starter catalog item — update commercial description before selling',179900,'Varies','Varies','Varies',false,9)
on conflict (slug) do nothing;
insert into public.variants(product_id,color_name,color_hex,weight_grams,diameter_mm,price_paise,stock,sku)
select p.id,c.name,c.hex,w.weight,1.75,(p.base_price_paise*w.weight/1000)::int,24,
'UF-'||upper(replace(p.slug,'-',''))||'-'||upper(replace(c.name,' ',''))||'-'||w.weight
from public.products p
cross join (values ('Electric Purple','#9a5cff'),('Midnight Black','#22202c'),('Arctic White','#f3f0f7'),('Ocean Blue','#276cde'),('Neon Green','#82ed63'),('Sunset Orange','#f17c34'),('Rose Pink','#ed87c1'),('Metallic Silver','#a9b1c3'),('Crimson Red','#d73d59'),('Golden Yellow','#ffd35e')) as c(name,hex)
cross join(values(500),(1000))as w(weight)
on conflict(product_id,color_name,weight_grams,diameter_mm) do nothing;
