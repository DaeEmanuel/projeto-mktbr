alter table public.books
  add column if not exists synopsis_html text,
  add column if not exists author_name text,
  add column if not exists category text,
  add column if not exists short_slug text,
  add column if not exists ebook_file_path text,
  add column if not exists ebook_file_name text,
  add column if not exists video_url text,
  add column if not exists video_file_path text;

alter table public.books
  drop constraint if exists books_price_cents_check;

alter table public.books
  add constraint books_price_cents_check check (price_cents >= 501);

create unique index if not exists books_short_slug_key
  on public.books(short_slug)
  where short_slug is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'book-assets',
  'book-assets',
  true,
  209715200,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ebook-files',
  'ebook-files',
  false,
  104857600,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public can read book assets" on storage.objects
  for select using (bucket_id = 'book-assets');

create policy "writers can manage own book assets" on storage.objects
  for all using (
    bucket_id = 'book-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'book-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "writers can manage own ebook files" on storage.objects
  for all using (
    bucket_id = 'ebook-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'ebook-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
