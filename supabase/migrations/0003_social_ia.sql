alter table public.subscriptions
  add column if not exists social_plan text not null default 'free',
  add column if not exists social_status text not null default 'active',
  add column if not exists social_current_period_end timestamptz,
  add column if not exists stripe_social_subscription_id text;

create table public.social_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null,
  handle text,
  profile_url text,
  niche text,
  audience text,
  connected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, platform)
);

create table public.generated_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  social_profile_id uuid references public.social_profiles(id) on delete set null,
  prompt text not null,
  content text not null,
  platform text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.generated_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  social_profile_id uuid references public.social_profiles(id) on delete set null,
  prompt text not null,
  image_url text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.profile_analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  social_profile_id uuid references public.social_profiles(id) on delete set null,
  platform text,
  profile_url text,
  summary text,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  platform text,
  content_type text,
  planned_for date not null,
  caption text,
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  social_profile_id uuid references public.social_profiles(id) on delete set null,
  generated_post_id uuid references public.generated_posts(id) on delete set null,
  platform text not null,
  caption text not null,
  media_url text,
  scheduled_for timestamptz,
  status text not null default 'coming_soon',
  provider_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_profiles enable row level security;
alter table public.generated_posts enable row level security;
alter table public.generated_images enable row level security;
alter table public.profile_analysis enable row level security;
alter table public.content_calendar enable row level security;
alter table public.scheduled_posts enable row level security;

create policy "users manage own social profiles" on public.social_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own generated posts" on public.generated_posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own generated images" on public.generated_images
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own profile analysis" on public.profile_analysis
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own content calendar" on public.content_calendar
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own scheduled posts" on public.scheduled_posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index social_profiles_user_id_idx on public.social_profiles(user_id);
create index generated_posts_user_id_created_at_idx on public.generated_posts(user_id, created_at desc);
create index generated_images_user_id_created_at_idx on public.generated_images(user_id, created_at desc);
create index profile_analysis_user_id_created_at_idx on public.profile_analysis(user_id, created_at desc);
create index content_calendar_user_id_planned_for_idx on public.content_calendar(user_id, planned_for);
create index scheduled_posts_user_id_scheduled_for_idx on public.scheduled_posts(user_id, scheduled_for);
