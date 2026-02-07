'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Instance } from '@/types/database'

export default function Dashboard() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser({ email: user.email || '' })

      // Fetch instances
      const { data } = await supabase
        .from('instances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setInstances(data || [])
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const createInstance = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Asistente ${instances.length + 1}`,
          use_ollama: true,
        }),
      })
      const data = await response.json()
      if (data.instance) {
        setInstances([data.instance, ...instances])
      }
    } catch (error) {
      console.error('Error creating instance:', error)
    }
    setCreating(false)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'running':
        return { label: 'Activo', emoji: '🟢', bg: 'bg-green-light', text: 'text-green-dark' }
      case 'provisioning':
        return { label: 'Configurando...', emoji: '🟡', bg: 'bg-yellow-light', text: 'text-yellow-700' }
      case 'stopped':
        return { label: 'Detenido', emoji: '⏸️', bg: 'bg-foreground/5', text: 'text-warm-gray' }
      case 'error':
        return { label: 'Error', emoji: '🔴', bg: 'bg-coral-light', text: 'text-coral' }
      default:
        return { label: status, emoji: '⚪', bg: 'bg-foreground/5', text: 'text-warm-gray' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-coral animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-foreground/5">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="QuickOpenClaw" width={36} height={36} className="rounded-2xl" />
            <span className="text-xl font-bold tracking-tight">QuickOpenClaw</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-warm-gray text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-warm-gray hover:text-foreground font-medium text-sm transition-colors"
            >
              Salir 👋
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Mis Asistentes 🤖</h1>
            <p className="text-warm-gray mt-1">
              {instances.length === 0
                ? 'Crea tu primer asistente'
                : `${instances.length} asistente${instances.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={createInstance}
            disabled={creating}
            className="bg-coral hover:bg-coral-dark disabled:opacity-50 px-5 py-3 rounded-2xl text-white font-bold flex items-center gap-2 transition-all hover:scale-105"
          >
            {creating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>➕</span>
            )}
            Nuevo asistente
          </button>
        </div>

        {instances.length === 0 ? (
          <div className="bg-white rounded-[20px] card-shadow p-16 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold mb-2">
              Sin asistentes aún
            </h2>
            <p className="text-warm-gray mb-8 text-lg">
              Crea tu primer asistente de IA en 60 segundos ⚡
            </p>
            <button
              onClick={createInstance}
              disabled={creating}
              className="bg-coral hover:bg-coral-dark px-8 py-4 rounded-2xl text-white font-bold inline-flex items-center gap-2 transition-all hover:scale-105"
            >
              {creating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>🚀</span>
              )}
              Crear asistente
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instances.map((instance) => {
              const status = getStatusConfig(instance.status)
              return (
                <div
                  key={instance.id}
                  className="bg-white rounded-[20px] card-shadow card-transition p-6"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold">
                        {instance.name}
                      </h3>
                      <p className="text-warm-gray text-sm">
                        {instance.subdomain}.clawdbot.lat
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}
                    >
                      {status.emoji} {status.label}
                    </span>
                  </div>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">Modelo</span>
                      <span className="font-medium">
                        {instance.config.model_type === 'ollama'
                          ? '🧠 Ollama (Llama 3.2)'
                          : instance.config.model_type === 'credits'
                            ? '✨ Claude Haiku'
                            : '🔑 BYOK'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">Canal</span>
                      <span className="font-medium">💬 Telegram</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {instance.status === 'running' ? (
                      <button className="flex-1 bg-foreground/5 hover:bg-foreground/10 py-2.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors">
                        ⏸️ Detener
                      </button>
                    ) : instance.status === 'stopped' ? (
                      <button className="flex-1 bg-green-light hover:bg-green text-green-dark hover:text-white py-2.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors">
                        ▶️ Iniciar
                      </button>
                    ) : null}
                    <button className="bg-foreground/5 hover:bg-foreground/10 px-3 py-2.5 rounded-2xl transition-colors" title="Configurar">
                      ⚙️
                    </button>
                    <button className="bg-foreground/5 hover:bg-foreground/10 px-3 py-2.5 rounded-2xl transition-colors" title="Abrir">
                      🔗
                    </button>
                    <button className="bg-coral-light hover:bg-coral/20 px-3 py-2.5 rounded-2xl text-coral transition-colors" title="Eliminar">
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
