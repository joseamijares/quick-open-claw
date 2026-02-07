-- QuickOpenClaw Schema Migration
-- Run this in Supabase SQL Editor

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('byok', 'easy', 'unlimited')),
  status text not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id)
);

-- VPS Hosts
create table if not exists public.vps_hosts (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'hetzner',
  external_id text,
  ip_address text not null,
  specs jsonb not null default '{}',
  max_containers int not null default 1,
  current_containers int not null default 0,
  status text not null default 'available' check (status in ('available', 'full', 'provisioning', 'error')),
  region text not null default 'nbg1',
  created_at timestamptz not null default now()
);

-- Instances
create table if not exists public.instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  host_id uuid references public.vps_hosts(id) on delete set null,
  name text not null,
  container_id text,
  subdomain text not null unique,
  status text not null default 'provisioning' check (status in ('provisioning', 'running', 'stopped', 'error')),
  config jsonb not null default '{}',
  gateway_token text not null,
  port int,
  created_at timestamptz not null default now(),
  last_heartbeat timestamptz
);

-- Provision Jobs
create table if not exists public.provision_jobs (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.instances(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  logs jsonb not null default '[]',
  started_at timestamptz,
  completed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

-- RLS Policies
alter table public.subscriptions enable row level security;
alter table public.vps_hosts enable row level security;
alter table public.instances enable row level security;
alter table public.provision_jobs enable row level security;

-- Users can read their own subscriptions
create policy "Users read own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Users can read their own instances
create policy "Users read own instances" on public.instances
  for select using (auth.uid() = user_id);

-- Users can insert their own instances
create policy "Users insert own instances" on public.instances
  for insert with check (auth.uid() = user_id);

-- Users can update their own instances
create policy "Users update own instances" on public.instances
  for update using (auth.uid() = user_id);

-- Users can delete their own instances
create policy "Users delete own instances" on public.instances
  for delete using (auth.uid() = user_id);

-- Users can read their own provision jobs (via instance)
create policy "Users read own provision jobs" on public.provision_jobs
  for select using (
    exists (
      select 1 from public.instances
      where instances.id = provision_jobs.instance_id
      and instances.user_id = auth.uid()
    )
  );

-- Service role has full access (via supabase service key, bypasses RLS)
-- No explicit policy needed — service role bypasses RLS by default

-- Indexes
create index if not exists idx_instances_user_id on public.instances(user_id);
create index if not exists idx_instances_status on public.instances(status);
create index if not exists idx_provision_jobs_status on public.provision_jobs(status);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_sub on public.subscriptions(stripe_subscription_id);
