'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Bot,
  Plus,
  Play,
  Square,
  Trash2,
  Settings,
  ExternalLink,
  Loader2,
  LogOut,
} from 'lucide-react'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-400 bg-green-400/10'
      case 'provisioning':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'stopped':
        return 'text-gray-400 bg-gray-400/10'
      case 'error':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return 'Activo'
      case 'provisioning':
        return 'Configurando...'
      case 'stopped':
        return 'Detenido'
      case 'error':
        return 'Error'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Bot className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold">ClawdBot</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Asistentes</h1>
            <p className="text-gray-400">
              {instances.length === 0
                ? 'Crea tu primer asistente'
                : `${instances.length} asistente${instances.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={createInstance}
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white flex items-center gap-2"
          >
            {creating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            Nuevo asistente
          </button>
        </div>

        {instances.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Sin asistentes
            </h2>
            <p className="text-gray-400 mb-6">
              Crea tu primer asistente de IA en 60 segundos
            </p>
            <button
              onClick={createInstance}
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white inline-flex items-center gap-2"
            >
              {creating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Crear asistente
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instances.map((instance) => (
              <div
                key={instance.id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {instance.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {instance.subdomain}.clawdbot.lat
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}
                  >
                    {getStatusText(instance.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Modelo</span>
                    <span className="text-white">
                      {instance.config.use_ollama
                        ? 'Llama 3.2 (Ollama)'
                        : instance.config.model}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Canal</span>
                    <span className="text-white">Telegram</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {instance.status === 'running' ? (
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-white flex items-center justify-center gap-2">
                      <Square className="w-4 h-4" />
                      Detener
                    </button>
                  ) : instance.status === 'stopped' ? (
                    <button className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg text-white flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      Iniciar
                    </button>
                  ) : null}
                  <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-white">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-white">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button className="bg-red-600/20 hover:bg-red-600/30 p-2 rounded-lg text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
