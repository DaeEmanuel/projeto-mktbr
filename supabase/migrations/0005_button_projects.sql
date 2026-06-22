create table if not exists public.button_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome_projeto text not null,
  configuracao_json jsonb not null default '{}'::jsonb,
  imagem_preview text,
  download_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.button_projects enable row level security;

create policy "users can read own button projects" on public.button_projects
  for select
  using (auth.uid() = user_id);

create policy "users can create own button projects" on public.button_projects
  for insert
  with check (auth.uid() = user_id);

create policy "users can update own button projects" on public.button_projects
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own button projects" on public.button_projects
  for delete
  using (auth.uid() = user_id);

create policy "admins can read button projects" on public.button_projects
  for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create index if not exists button_projects_user_id_idx on public.button_projects(user_id);
create index if not exists button_projects_created_at_idx on public.button_projects(created_at desc);