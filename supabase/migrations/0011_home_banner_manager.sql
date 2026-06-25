-- Complete home banner manager support.
-- Keeps Stripe and existing admin center untouched.

alter table public.banners add column if not exists desktop_image_url text;
alter table public.banners add column if not exists mobile_image_url text;
alter table public.banners add column if not exists redirect_url text;
alter table public.banners add column if not exists start_date timestamptz;
alter table public.banners add column if not exists end_date timestamptz;
alter table public.banners add column if not exists is_active boolean not null default true;

update public.banners
set desktop_image_url = coalesce(desktop_image_url, image_url),
    redirect_url = coalesce(redirect_url, link_url),
    is_active = coalesce(is_active, active, true)
where desktop_image_url is null or redirect_url is null or is_active is distinct from coalesce(active, true);

create index if not exists banners_home_schedule_idx
  on public.banners(position, is_active, display_order, start_date, end_date);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-banners',
  'site-banners',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read site banners" on storage.objects;
create policy "public can read site banners"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-banners');

drop policy if exists "admins can upload site banners" on storage.objects;
create policy "admins can upload site banners"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-banners' and public.is_mktbr_admin());

drop policy if exists "admins can update site banners" on storage.objects;
create policy "admins can update site banners"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-banners' and public.is_mktbr_admin())
  with check (bucket_id = 'site-banners' and public.is_mktbr_admin());

drop policy if exists "admins can delete site banners" on storage.objects;
create policy "admins can delete site banners"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-banners' and public.is_mktbr_admin());

