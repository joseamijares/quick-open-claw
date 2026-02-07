'use client'

import { useEffect, useState, useCallback } from 'react'
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
  X,
  Check,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Instance } from '@/types/database'

export default function Dashboard() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null)
  const [settingsForm, setSettingsForm] = useState({ name: '', telegram_token: '', api_key: '' })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fetchInstances = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('instances')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setInstances(data)
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser({ email: user.email || '' })
      await fetchInstances()
      setLoading(false)
    }
    init()
  }, [router, supabase, fetchInstances])

  // Poll every 30s
  useEffect(() => {
    const interval = setInterval(fetchInstances, 30000)
    return () => clearInterval(interval)
  }, [fetchInstances])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleAction = async (id: string, action: 'start' | 'stop') => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/instances/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) await fetchInstances()
    } catch { /* ignore */ }
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/instances/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setInstances((prev) => prev.filter((i) => i.id !== id))
      }
    } catch { /* ignore */ }
    setDeleteConfirm(null)
    setActionLoading(null)
  }

  const openSettings = (instance: Instance) => {
    setSettingsOpen(instance.id)
    setSettingsForm({
      name: instance.name,
      telegram_token: instance.config.telegram_token || '',
      api_key: instance.config.api_key || '',
    })
  }

  const saveSettings = async () => {
    if (!settingsOpen) return
    setSettingsSaving(true)
    try {
      const res = await fetch(`/api/instances/${settingsOpen}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      })
      if (res.ok) {
        await fetchInstances()
        setSettingsOpen(null)
      }
    } catch { /* ignore */ }
    setSettingsSaving(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-400/10'
      case 'provisioning': return 'text-yellow-400 bg-yellow-400/10'
      case 'stopped': return 'text-gray-400 bg-gray-400/10'
      case 'error': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Activo'
      case 'provisioning': return 'Configurando...'
      case 'stopped': return 'Detenido'
      case 'error': return 'Error'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  const settingsInstance = instances.find((i) => i.id === settingsOpen)

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Bot className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold">ClawdBot</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user?.email}</span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Asistentes</h1>
            <p className="text-gray-400">
              {instances.length === 0 ? 'Crea tu primer asistente' : `${instances.length} asistente${instances.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/setup')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo asistente
          </button>
        </div>

        {instances.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sin asistentes</h2>
            <p className="text-gray-400 mb-6">Crea tu primer asistente de IA en 60 segundos</p>
            <button
              onClick={() => router.push('/dashboard/setup')}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear asistente
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instances.map((instance) => (
              <div key={instance.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{instance.name}</h3>
                    <p className="text-gray-400 text-sm">{instance.subdomain}.clawdbot.lat</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                    {getStatusText(instance.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Modelo</span>
                    <span className="text-white">
                      {instance.config.model_type === 'ollama' ? 'Ollama (Llama 3.2)' : instance.config.model_type === 'credits' ? 'Claude Haiku' : 'BYOK'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Canal</span>
                    <span className="text-white">Telegram</span>
                  </div>
                  {instance.last_heartbeat && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Último heartbeat</span>
                      <span className="text-white text-xs">
                        {new Date(instance.last_heartbeat).toLocaleString('es-MX')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {instance.status === 'running' ? (
                    <button
                      onClick={() => handleAction(instance.id, 'stop')}
                      disabled={actionLoading === instance.id}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 py-2 rounded-lg text-white flex items-center justify-center gap-2"
                    >
                      {actionLoading === instance.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                      Detener
                    </button>
                  ) : instance.status === 'stopped' ? (
                    <button
                      onClick={() => handleAction(instance.id, 'start')}
                      disabled={actionLoading === instance.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 py-2 rounded-lg text-white flex items-center justify-center gap-2"
                    >
                      {actionLoading === instance.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      Iniciar
                    </button>
                  ) : instance.status === 'provisioning' ? (
                    <div className="flex-1 bg-yellow-600/20 py-2 rounded-lg text-yellow-400 flex items-center justify-center gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Configurando...
                    </div>
                  ) : null}
                  <button onClick={() => openSettings(instance)} className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-white">
                    <Settings className="w-5 h-5" />
                  </button>
                  {deleteConfirm === instance.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(instance.id)}
                        disabled={actionLoading === instance.id}
                        className="bg-red-600 hover:bg-red-700 p-2 rounded-lg text-white"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(instance.id)} className="bg-red-600/20 hover:bg-red-600/30 p-2 rounded-lg text-red-400">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Settings slide-out */}
      {settingsOpen && settingsInstance && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSettingsOpen(null)} />
          <div className="relative bg-gray-800 w-full max-w-md p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Configuración</h2>
              <button onClick={() => setSettingsOpen(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del bot</label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Token de Telegram</label>
                <input
                  type="text"
                  value={settingsForm.telegram_token}
                  onChange={(e) => setSettingsForm({ ...settingsForm, telegram_token: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {settingsInstance.config.model_type === 'byok' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                  <input
                    type="password"
                    value={settingsForm.api_key}
                    onChange={(e) => setSettingsForm({ ...settingsForm, api_key: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(settingsInstance.status)}`}>
                  {settingsInstance.status === 'running' && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                  {getStatusText(settingsInstance.status)}
                </div>
              </div>

              {settingsInstance.last_heartbeat && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Último heartbeat</label>
                  <p className="text-white text-sm">{new Date(settingsInstance.last_heartbeat).toLocaleString('es-MX')}</p>
                </div>
              )}

              <button
                onClick={saveSettings}
                disabled={settingsSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 mt-6"
              >
                {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
