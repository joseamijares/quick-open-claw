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

      // Update instance status with step info
      const updateInstanceStatus = async (status: string, statusMessage?: string) => {
        await supabase
          .from('instances')
          .update({
            status,
            ...(statusMessage && { status_message: statusMessage }),
          })
          .eq('id', instance.id)
      }

      await updateInstanceStatus('provisioning', 'Preparando configuración del servidor...')

      // Determine if ollama is needed
      const useOllama = instance.config?.model_type === 'ollama'

      // Validate required config
      if (!instance.config?.telegram_token) {
        throw new Error('Token de Telegram no configurado. Revisa la configuración de tu instancia.')
      }

      // Create cloud-init script
      const userData = getCloudInitScript({
        gateway_token: instance.gateway_token,
        telegram_token: instance.config?.telegram_token,
        use_ollama: useOllama,
        model: instance.config?.model || 'gpt-4o',
      })

      await updateInstanceStatus('provisioning', 'Creando servidor en la nube...')

      // Create server
      const serverType = useOllama ? 'cx32' : 'cx22'
      let server
      try {
        server = await hetzner.createServer({
          name: `clawdbot-${instance.subdomain}`,
          server_type: serverType,
          location: 'nbg1',
          image: 'ubuntu-24.04',
          user_data: userData,
        })
      } catch (hetznerErr: unknown) {
        const msg = hetznerErr instanceof Error ? hetznerErr.message : 'Error desconocido'
        throw new Error(`Error al crear servidor en Hetzner: ${msg}`)
      }

      const ip = server.public_net.ipv4.ip

      await updateInstanceStatus('provisioning', 'Registrando servidor...')

      // Create host record
      const { data: host, error: hostError } = await supabase
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

      if (hostError) {
        throw new Error(`Error al registrar host: ${hostError.message}`)
      }

      // Update instance
      await supabase
        .from('instances')
        .update({
          host_id: host?.id,
          status: 'provisioning',
          status_message: 'Esperando que el servidor inicie...',
        })
        .eq('id', instance.id)

      // Poll for server ready (max 5 minutes)
      const POLL_INTERVAL_MS = 10000
      const MAX_POLLS = 30
      let ready = false
      for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
        try {
          const current = await hetzner.getServer(server.id)
          if (current.status === 'running') {
            ready = true
            break
          }
        } catch {
          // Transient poll failure, keep retrying
        }
      }

      if (ready) {
        await supabase
          .from('instances')
          .update({ status: 'running', status_message: null })
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
        throw new Error('El servidor no respondió en 5 minutos. Intenta de nuevo o contacta soporte.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido durante el aprovisionamiento'

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
        .update({ status: 'error', status_message: message })
        .eq('id', instance.id)

      results.push({ job_id: job.id, status: 'failed', error: message })
    }
  }

  return NextResponse.json({ results })
}
