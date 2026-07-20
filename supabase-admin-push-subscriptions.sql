create extension if not exists pgcrypto;

create table if not exists public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_push_subscriptions enable row level security;

drop policy if exists "Admins can manage push subscriptions"
on public.admin_push_subscriptions;

create policy "Admins can manage push subscriptions"
on public.admin_push_subscriptions
for all
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
