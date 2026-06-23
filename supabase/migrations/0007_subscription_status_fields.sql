alter table public.subscriptions
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists subscription_plan text,
  add column if not exists subscription_start_date timestamptz,
  add column if not exists subscription_end_date timestamptz,
  add column if not exists stripe_price_id text,
  add column if not exists stripe_latest_invoice_id text,
  add column if not exists stripe_latest_payment_intent_id text;

update public.subscriptions
set subscription_status = coalesce(subscription_status, status),
    subscription_plan = coalesce(subscription_plan, plan_name),
    subscription_end_date = coalesce(subscription_end_date, current_period_end),
    subscription_start_date = coalesce(subscription_start_date, created_at)
where subscription_status is null
   or subscription_plan is null
   or subscription_end_date is null
   or subscription_start_date is null;

create index if not exists subscriptions_stripe_customer_id_idx on public.subscriptions(stripe_customer_id);
create index if not exists subscriptions_stripe_subscription_id_idx on public.subscriptions(stripe_subscription_id);
create index if not exists subscriptions_subscription_status_idx on public.subscriptions(subscription_status);
