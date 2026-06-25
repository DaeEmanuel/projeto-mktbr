-- Course video test area for MKTBR Site.
-- Enables admins to upload MP4 lessons before official publication.

alter table public.lessons add column if not exists video_file_path text;
alter table public.lessons add column if not exists updated_at timestamptz not null default now();

insert into public.courses (slug, title, description, level, published)
values (
  'curso-teste-mktbr',
  'Curso de Teste MKTBR',
  'Ambiente de teste para validar player, upload de vídeo e experiência de aula antes da publicação oficial.',
  'teste',
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  level = excluded.level,
  published = true,
  updated_at = now();

with test_course as (
  select id from public.courses where slug = 'curso-teste-mktbr'
)
insert into public.modules (course_id, title, position)
select id, 'Aulas de teste', 0 from test_course
where not exists (
  select 1 from public.modules m where m.course_id = test_course.id and m.title = 'Aulas de teste'
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-videos',
  'course-videos',
  true,
  209715200,
  array['video/mp4']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read course videos" on storage.objects;
create policy "public can read course videos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'course-videos');

drop policy if exists "admins can upload course videos" on storage.objects;
create policy "admins can upload course videos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'course-videos' and public.is_mktbr_admin());

drop policy if exists "admins can update course videos" on storage.objects;
create policy "admins can update course videos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'course-videos' and public.is_mktbr_admin())
  with check (bucket_id = 'course-videos' and public.is_mktbr_admin());

drop policy if exists "admins can delete course videos" on storage.objects;
create policy "admins can delete course videos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'course-videos' and public.is_mktbr_admin());

create index if not exists lessons_video_course_idx on public.lessons(course_id, position, published);
