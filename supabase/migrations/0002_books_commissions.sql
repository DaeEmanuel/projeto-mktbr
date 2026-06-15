create table public.books (
  id uuid primary key default gen_random_uuid(),
  writer_id uuid not null references public.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  price_cents integer not null check (price_cents >= 501),
  cover_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.book_sales (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete restrict,
  writer_id uuid not null references public.users(id) on delete restrict,
  buyer_id uuid references public.users(id) on delete set null,
  buyer_email text,
  sale_amount_cents integer not null,
  platform_commission_cents integer not null default 500,
  writer_net_cents integer not null,
  currency text not null default 'BRL',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  status text not null default 'paid',
  sold_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint writer_net_matches_sale check (
    writer_net_cents = greatest(sale_amount_cents - platform_commission_cents, 0)
  )
);

create table public.writer_payouts (
  id uuid primary key default gen_random_uuid(),
  writer_id uuid not null references public.users(id) on delete cascade,
  book_sale_id uuid references public.book_sales(id) on delete set null,
  amount_cents integer not null,
  status text not null default 'pending',
  payout_reference text,
  notes text,
  requested_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.books enable row level security;
alter table public.book_sales enable row level security;
alter table public.writer_payouts enable row level security;

create policy "published books are readable" on public.books
  for select using (published = true or auth.uid() = writer_id or exists (
    select 1 from public.users
    where users.id = auth.uid() and users.role = 'admin'
  ));

create policy "writers can create own books" on public.books
  for insert with check (auth.uid() = writer_id);

create policy "writers can update own books" on public.books
  for update using (auth.uid() = writer_id) with check (auth.uid() = writer_id);

create policy "book sales are visible to participants and admins" on public.book_sales
  for select using (
    auth.uid() = buyer_id
    or auth.uid() = writer_id
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "payouts are visible to writers and admins" on public.writer_payouts
  for select using (
    auth.uid() = writer_id
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "admins can manage payouts" on public.writer_payouts
  for all using (exists (
    select 1 from public.users
    where users.id = auth.uid() and users.role = 'admin'
  )) with check (exists (
    select 1 from public.users
    where users.id = auth.uid() and users.role = 'admin'
  ));

create index books_writer_id_idx on public.books(writer_id);
create index books_slug_idx on public.books(slug);
create index book_sales_writer_id_sold_at_idx on public.book_sales(writer_id, sold_at desc);
create index book_sales_book_id_idx on public.book_sales(book_id);
create index book_sales_buyer_id_idx on public.book_sales(buyer_id);
create index writer_payouts_writer_id_status_idx on public.writer_payouts(writer_id, status);
