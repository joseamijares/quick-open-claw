export type Plan = 'byok' | 'unlimited'
export type ModelType = 'byok' | 'ollama'
export type HostingType = 'dedicated' | 'dedicated_ollama'
export type InstanceStatus = 'provisioning' | 'running' | 'stopped' | 'error'
export type HostStatus = 'available' | 'full' | 'provisioning' | 'error'

export interface User {
  id: string
  email: string
  name: string | null
  language: string
  timezone: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: Plan
  status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
  created_at: string
}

export interface VpsHost {
  id: string
  provider: string
  external_id: string | null
  ip_address: string
  specs: {
    vcpu: number
    ram_gb: number
    disk_gb: number
  }
  max_containers: number
  current_containers: number
  status: HostStatus
  region: string
  created_at: string
}

export interface Instance {
  id: string
  user_id: string
  host_id: string | null
  name: string
  container_id: string | null
  subdomain: string
  status: InstanceStatus
  config: {
    model: string
    model_type: ModelType // 'ollama' | 'openrouter' | 'byok'
    telegram_token?: string
    api_key?: string // for byok
  }
  gateway_token: string
  port: number | null
  created_at: string
  last_heartbeat: string | null
}

export interface ProvisionJob {
  id: string
  instance_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  logs: string[]
  started_at: string | null
  completed_at: string | null
  error: string | null
}
