create sequence if not exists public.orders_purchase_code_seq;

create or replace function public.generate_mktbr_purchase_code()
returns text
language plpgsql
as $$
declare
  next_number bigint;
begin
  next_number := nextval('public.orders_purchase_code_seq');
  return 'MKTBR-' || extract(year from now())::int || '-' || lpad(next_number::text, 6, '0');
end;
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  purchase_code text not null unique default public.generate_mktbr_purchase_code(),
  buyer_id uuid references auth.users(id) on delete set null,
  product_id text not null,
  product_type text not null default 'ebook',
  product_name text not null,
  author_id uuid references auth.users(id) on delete set null,
  buyer_name text,
  buyer_email text,
  amount integer not null default 0,
  payment_method text not null default 'stripe',
  payment_status text not null default 'pending',
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_buyer_id_created_at_idx on public.orders(buyer_id, created_at desc);
create index if not exists orders_author_id_created_at_idx on public.orders(author_id, created_at desc);
create index if not exists orders_payment_status_created_at_idx on public.orders(payment_status, created_at desc);
create index if not exists orders_product_id_idx on public.orders(product_id);

alter table public.orders enable row level security;

drop policy if exists "buyers can read own orders" on public.orders;
create policy "buyers can read own orders" on public.orders
  for select using (auth.uid() = buyer_id);

drop policy if exists "authors can read product orders" on public.orders;
create policy "authors can read product orders" on public.orders
  for select using (auth.uid() = author_id);

alter table public.ebook_orders add column if not exists order_id uuid references public.orders(id) on delete set null;
alter table public.book_sales add column if not exists order_id uuid references public.orders(id) on delete set null;
alter table public.writer_payouts add column if not exists order_id uuid references public.orders(id) on delete set null;

create table if not exists public.course_purchases (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(course_id, buyer_id)
);

alter table public.course_purchases enable row level security;
drop policy if exists "buyers can read own course purchases" on public.course_purchases;
create policy "buyers can read own course purchases" on public.course_purchases
  for select using (auth.uid() = buyer_id);

DO $$
begin
  begin
    alter publication supabase_realtime add table public.orders;
  exception when duplicate_object then
    null;
  end;
end $$;

create unique index if not exists writer_payouts_book_sale_id_unique
  on public.writer_payouts(book_sale_id)
  where book_sale_id is not null;

create unique index if not exists writer_earnings_order_id_unique
  on public.writer_earnings(order_id)
  where order_id is not null;
