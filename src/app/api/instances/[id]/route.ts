import { createClient } from '@/lib/supabase/server'
import { createHetznerClient } from '@/lib/hetzner'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('instances')
    .select('*, vps_hosts(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ instance: data })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { action, name, telegram_token, api_key } = body

  // Fetch instance
  const { data: instance } = await supabase
    .from('instances')
    .select('*, vps_hosts(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!instance) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Handle power actions
  if (action === 'start' || action === 'stop') {
    const host = instance.vps_hosts
    if (!host?.external_id) {
      return NextResponse.json({ error: 'No server found' }, { status: 400 })
    }

    const hetzner = createHetznerClient()
    const serverId = Number(host.external_id)
    const endpoint = action === 'start' ? 'poweron' : 'shutdown'

    try {
      const res = await fetch(
        `https://api.hetzner.cloud/v1/servers/${serverId}/actions/${endpoint}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.HETZNER_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || `HTTP ${res.status}`)
      }

      const newStatus = action === 'start' ? 'running' : 'stopped'
      await supabase
        .from('instances')
        .update({ status: newStatus })
        .eq('id', id)

      return NextResponse.json({ status: newStatus })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  // Handle settings update
  const updates: Record<string, unknown> = {}
  if (name) updates.name = name
  if (telegram_token || api_key) {
    const newConfig = { ...instance.config }
    if (telegram_token) newConfig.telegram_token = telegram_token
    if (api_key) newConfig.api_key = api_key
    updates.config = newConfig
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('instances')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ instance: data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch instance with host
  const { data: instance } = await supabase
    .from('instances')
    .select('*, vps_hosts(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!instance) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete Hetzner server if exists
  const host = instance.vps_hosts
  if (host?.external_id) {
    try {
      const hetzner = createHetznerClient()
      await hetzner.deleteServer(Number(host.external_id))
    } catch {
      // Continue with DB cleanup even if Hetzner delete fails
    }

    // Delete host record
    await supabase.from('vps_hosts').delete().eq('id', host.id)
  }

  // Delete instance (cascade deletes provision_jobs)
  await supabase.from('instances').delete().eq('id', id)

  return NextResponse.json({ deleted: true })
}
