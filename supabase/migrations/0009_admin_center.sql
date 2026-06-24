-- Administrative center support for MKTBR Site.
-- Safe migration: only creates missing admin tables, adds optional columns, and adds admin RLS policies.

alter table public.users add column if not exists blocked boolean not null default false;
alter table public.courses add column if not exists category text not null default 'Geral';
alter table public.courses add column if not exists price_cents integer not null default 0;
alter table public.courses add column if not exists featured boolean not null default false;
alter table public.books add column if not exists synopsis text;
alter table public.books add column if not exists status text not null default 'pending';
alter table public.books add column if not exists featured boolean not null default false;

create table if not exists public.site_settings (
  key text primary key,
  value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_url text,
  position text not null default 'home',
  display_order integer not null default 0,
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text,
  notification_type text not null default 'sistema',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.banners enable row level security;
alter table public.admin_notifications enable row level security;

drop policy if exists "admins can read all users" on public.users;
create policy "admins can read all users" on public.users
  for select using (exists (select 1 from public.users admins where admins.id = auth.uid() and admins.role = 'admin'));

drop policy if exists "admins can update users" on public.users;
create policy "admins can update users" on public.users
  for update using (exists (select 1 from public.users admins where admins.id = auth.uid() and admins.role = 'admin'))
  with check (exists (select 1 from public.users admins where admins.id = auth.uid() and admins.role = 'admin'));

drop policy if exists "admins can manage courses" on public.courses;
create policy "admins can manage courses" on public.courses
  for all using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

drop policy if exists "admins can manage books" on public.books;
create policy "admins can manage books" on public.books
  for all using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

drop policy if exists "admins can read orders" on public.orders;
create policy "admins can read orders" on public.orders
  for select using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

drop policy if exists "admins can read book sales" on public.book_sales;
create policy "admins can read book sales" on public.book_sales
  for select using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

drop policy if exists "public can read active banners" on public.banners;
create policy "public can read active banners" on public.banners
  for select using (active = true);

drop policy if exists "admins can manage banners" on public.banners;
create policy "admins can manage banners" on public.banners
  for all using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

drop policy if exists "public can read site settings" on public.site_settings;
create policy "public can read site settings" on public.site_settings
  for select using (true);

drop policy if exists "admins can manage site settings" on public.site_settings;
create policy "admins can manage site settings" on public.site_settings
  for all using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

drop policy if exists "admins can manage admin notifications" on public.admin_notifications;
create policy "admins can manage admin notifications" on public.admin_notifications
  for all using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

create index if not exists banners_position_order_idx on public.banners(position, display_order);
create index if not exists admin_notifications_created_at_idx on public.admin_notifications(created_at desc);
create index if not exists users_role_idx on public.users(role);
