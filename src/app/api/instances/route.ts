import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('instances')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ instances: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, model_type = 'openrouter', model = 'gpt-4o-mini', telegram_token, api_key } = body

  // Generate unique subdomain
  const subdomain = nanoid(8).toLowerCase()
  const gateway_token = nanoid(32)

  // Create instance record
  const { data: instance, error } = await supabase
    .from('instances')
    .insert({
      user_id: user.id,
      name,
      subdomain,
      status: 'provisioning',
      gateway_token,
      config: {
        model,
        model_type,
        telegram_token,
        ...(api_key && { api_key }),
      },
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Queue provisioning job (will be picked up by worker)
  await supabase.from('provision_jobs').insert({
    instance_id: instance.id,
    status: 'pending',
  })

  // TODO: Trigger actual provisioning via Hetzner API
  // For MVP, we'll do this synchronously or via a cron

  return NextResponse.json({ instance })
}
