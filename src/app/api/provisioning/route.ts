import { createClient } from '@supabase/supabase-js'
import { createHetznerClient, getCloudInitScript } from '@/lib/hetzner'
import { NextResponse } from 'next/server'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  // Verify cron secret or manual trigger
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const hetzner = createHetznerClient()

  // Fetch pending jobs
  const { data: jobs, error: fetchError } = await supabase
    .from('provision_jobs')
    .select('*, instances(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(5)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ message: 'No pending jobs' })
  }

  const results = []

  for (const job of jobs) {
    const instance = job.instances
    if (!instance) continue

    try {
      // Mark job as running
      await supabase
        .from('provision_jobs')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', job.id)

      // Determine if ollama is needed
      const useOllama = instance.config?.model_type === 'ollama'

      // Create cloud-init script
      const userData = getCloudInitScript({
        gateway_token: instance.gateway_token,
        telegram_token: instance.config?.telegram_token,
        use_ollama: useOllama,
        model: instance.config?.model || 'gpt-4o-mini',
      })

      // Create server
      const serverType = useOllama ? 'cx32' : 'cx22'
      const server = await hetzner.createServer({
        name: `clawdbot-${instance.subdomain}`,
        server_type: serverType,
        location: 'nbg1',
        image: 'ubuntu-24.04',
        user_data: userData,
      })

      const ip = server.public_net.ipv4.ip

      // Create host record
      const { data: host } = await supabase
        .from('vps_hosts')
        .insert({
          provider: 'hetzner',
          external_id: String(server.id),
          ip_address: ip,
          specs: {
            vcpu: useOllama ? 4 : 2,
            ram_gb: useOllama ? 8 : 4,
            disk_gb: useOllama ? 80 : 40,
          },
          status: 'provisioning',
          region: 'nbg1',
        })
        .select()
        .single()

      // Update instance
      await supabase
        .from('instances')
        .update({
          host_id: host?.id,
          status: 'provisioning',
        })
        .eq('id', instance.id)

      // Poll for server ready (max 5 minutes)
      let ready = false
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 10000))
        const current = await hetzner.getServer(server.id)
        if (current.status === 'running') {
          ready = true
          break
        }
      }

      if (ready) {
        await supabase
          .from('instances')
          .update({ status: 'running' })
          .eq('id', instance.id)

        await supabase
          .from('vps_hosts')
          .update({ status: 'available' })
          .eq('id', host?.id)

        await supabase
          .from('provision_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id)

        results.push({ job_id: job.id, status: 'completed', ip })
      } else {
        throw new Error('Server did not become ready within timeout')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'

      await supabase
        .from('provision_jobs')
        .update({
          status: 'failed',
          error: message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      await supabase
        .from('instances')
        .update({ status: 'error' })
        .eq('id', instance.id)

      results.push({ job_id: job.id, status: 'failed', error: message })
    }
  }

  return NextResponse.json({ results })
}
