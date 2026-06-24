-- Harden admin access checks and internal payment notifications.
-- The app still uses Stripe Webhook as the primary payment confirmation flow.

create or replace function public.is_mktbr_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_email text;
begin
  requester_email := nullif(auth.jwt() ->> 'email', '');

  if auth.uid() is null and requester_email is null then
    return false;
  end if;

  return exists (
    select 1
    from public.users u
    where coalesce(u.blocked, false) = false
      and u.role = 'admin'
      and (
        u.id = auth.uid()
        or (requester_email is not null and lower(u.email) = lower(requester_email))
      )
  );
end;
$$;

revoke all on function public.is_mktbr_admin() from public;
grant execute on function public.is_mktbr_admin() to authenticated;

alter table public.admin_notifications add column if not exists order_id uuid references public.orders(id) on delete set null;
alter table public.admin_notifications add column if not exists severity text not null default 'info';

-- Refresh admin read/manage policies to avoid recursive RLS failures.
drop policy if exists "admins can read all users" on public.users;
create policy "admins can read all users" on public.users
  for select to authenticated
  using (auth.uid() = id or public.is_mktbr_admin());

drop policy if exists "admins can update users" on public.users;
create policy "admins can update users" on public.users
  for update to authenticated
  using (public.is_mktbr_admin())
  with check (public.is_mktbr_admin());

drop policy if exists "admins can manage courses" on public.courses;
create policy "admins can manage courses" on public.courses
  for all to authenticated
  using (public.is_mktbr_admin())
  with check (public.is_mktbr_admin());

drop policy if exists "admins can manage books" on public.books;
create policy "admins can manage books" on public.books
  for all to authenticated
  using (public.is_mktbr_admin())
  with check (public.is_mktbr_admin());

drop policy if exists "admins can read orders" on public.orders;
create policy "admins can read orders" on public.orders
  for select to authenticated
  using (public.is_mktbr_admin());

drop policy if exists "admins can read book sales" on public.book_sales;
create policy "admins can read book sales" on public.book_sales
  for select to authenticated
  using (public.is_mktbr_admin());

drop policy if exists "admins can manage admin notifications" on public.admin_notifications;
create policy "admins can manage admin notifications" on public.admin_notifications
  for all to authenticated
  using (public.is_mktbr_admin())
  with check (public.is_mktbr_admin());

create index if not exists admin_notifications_order_id_idx on public.admin_notifications(order_id);
