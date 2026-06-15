create extension if not exists "pgcrypto";
create schema if not exists private;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text not null,
  role text not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  level text not null default 'iniciante',
  cover_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  title text not null,
  description text,
  video_url text,
  duration_seconds integer not null default 0,
  position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active',
  enrolled_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  plan_name text not null default 'Academia Pro',
  status text not null default 'pending',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  stripe_invoice_id text,
  stripe_payment_intent_id text,
  amount_cents integer,
  currency text not null default 'BRL',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (new.id, new.raw_user_meta_data->>'name', new.email)
  on conflict (id) do update
  set email = excluded.email,
      name = coalesce(excluded.name, public.users.name),
      updated_at = now();

  insert into public.subscriptions (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

create policy "users can read own profile" on public.users
  for select using (auth.uid() = id);
create policy "users can update own profile" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "published courses are readable" on public.courses
  for select using (published = true);
create policy "published modules are readable" on public.modules
  for select using (
    exists (
      select 1 from public.courses
      where courses.id = modules.course_id and courses.published = true
    )
  );
create policy "published lessons are readable" on public.lessons
  for select using (
    published = true and exists (
      select 1 from public.courses
      where courses.id = lessons.course_id and courses.published = true
    )
  );

create policy "users manage own enrollments" on public.enrollments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own lesson progress" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users read own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "users read own payments" on public.payments
  for select using (auth.uid() = user_id);

create index courses_slug_idx on public.courses(slug);
create index modules_course_position_idx on public.modules(course_id, position);
create index lessons_course_position_idx on public.lessons(course_id, position);
create index enrollments_user_id_idx on public.enrollments(user_id);
create index lesson_progress_user_id_idx on public.lesson_progress(user_id);
