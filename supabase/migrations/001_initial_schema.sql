-- ClawdBot LATAM - Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  language TEXT DEFAULT 'es',
  timezone TEXT DEFAULT 'America/Mexico_City',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter', -- 'starter', 'pro', 'premium'
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'past_due'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VPS Pool
CREATE TABLE IF NOT EXISTS vps_hosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT DEFAULT 'hetzner',
  external_id TEXT, -- Hetzner server ID
  ip_address INET NOT NULL,
  specs JSONB DEFAULT '{"vcpu": 4, "ram_gb": 16, "disk_gb": 80}'::jsonb,
  max_containers INT DEFAULT 8,
  current_containers INT DEFAULT 0,
  status TEXT DEFAULT 'available', -- 'available', 'full', 'provisioning', 'error'
  region TEXT DEFAULT 'nbg1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Instances (OpenClaw deployments)
CREATE TABLE IF NOT EXISTS instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  host_id UUID REFERENCES vps_hosts(id),
  name TEXT NOT NULL,
  container_id TEXT,
  subdomain TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'provisioning', -- 'provisioning', 'running', 'stopped', 'error'
  config JSONB DEFAULT '{"model": "llama3.2", "use_ollama": true}'::jsonb,
  gateway_token TEXT NOT NULL,
  port INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ
);

-- Provisioning Jobs
CREATE TABLE IF NOT EXISTS provision_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  logs TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT
);

-- Usage Tracking
CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  messages INT DEFAULT 0,
  tokens_in INT DEFAULT 0,
  tokens_out INT DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0,
  UNIQUE(instance_id, date)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE provision_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own instances" ON instances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own instances" ON instances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own instances" ON instances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own instances" ON instances
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own provision jobs" ON provision_jobs
  FOR SELECT USING (
    instance_id IN (SELECT id FROM instances WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert provision jobs" ON provision_jobs
  FOR INSERT WITH CHECK (
    instance_id IN (SELECT id FROM instances WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own usage" ON usage
  FOR SELECT USING (
    instance_id IN (SELECT id FROM instances WHERE user_id = auth.uid())
  );

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_instances_user_id ON instances(user_id);
CREATE INDEX IF NOT EXISTS idx_instances_status ON instances(status);
CREATE INDEX IF NOT EXISTS idx_provision_jobs_status ON provision_jobs(status);
CREATE INDEX IF NOT EXISTS idx_usage_instance_date ON usage(instance_id, date);
