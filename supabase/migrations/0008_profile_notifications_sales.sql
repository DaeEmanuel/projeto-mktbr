insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-avatars','user-avatars',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "users can upload own avatar" on storage.objects;
create policy "users can upload own avatar" on storage.objects for insert with check (bucket_id = 'user-avatars' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "users can update own avatar" on storage.objects;
create policy "users can update own avatar" on storage.objects for update using (bucket_id = 'user-avatars' and auth.uid()::text = (storage.foldername(name))[1]) with check (bucket_id = 'user-avatars' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "public can read avatars" on storage.objects;
create policy "public can read avatars" on storage.objects for select using (bucket_id = 'user-avatars');

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  title text not null,
  body text,
  notification_type text not null default 'info',
  related_order_id uuid references public.orders(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_created_at_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications(user_id) where read_at is null;

alter table public.notifications enable row level security;
drop policy if exists "users can read own notifications" on public.notifications;
create policy "users can read own notifications" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "users can update own notifications" on public.notifications;
create policy "users can update own notifications" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

DO $$
begin
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
end $$;
