'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Bot,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  MessageCircle,
  Cpu,
  Rocket,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Plan } from '@/types/database'

const STEPS = [
  { id: 1, title: 'Nombre', icon: Bot },
  { id: 2, title: 'Telegram', icon: MessageCircle },
  { id: 3, title: 'Modelo', icon: Cpu },
  { id: 4, title: 'Desplegar', icon: Rocket },
]

const BYOK_MODELS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', provider: 'anthropic' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', provider: 'anthropic' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'openai' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
  { value: 'moonshot-v1-auto', label: 'Moonshot v1', provider: 'moonshot' },
]

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>}>
      <SetupContent />
    </Suspense>
  )
}

function SetupContent() {
  const [step, setStep] = useState(1)
  const [plan, setPlan] = useState<Plan>('byok')
  const [botName, setBotName] = useState('Mi Asistente')
  const [telegramToken, setTelegramToken] = useState('')
  const [telegramValid, setTelegramValid] = useState<boolean | null>(null)
  const [telegramBotName, setTelegramBotName] = useState('')
  const [validatingTelegram, setValidatingTelegram] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-20250514')
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam && ['byok', 'easy', 'unlimited'].includes(planParam)) {
      setPlan(planParam as Plan)
    } else {
      // Fetch from subscription
      const fetchPlan = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('user_id', user.id)
          .single()
        if (data) setPlan(data.plan as Plan)
      }
      fetchPlan()
    }
  }, [searchParams, supabase])

  const validateTelegram = async () => {
    if (!telegramToken.trim()) return
    setValidatingTelegram(true)
    setTelegramValid(null)
    setError('')

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${telegramToken.trim()}/getMe`
      )
      const data = await res.json()
      if (data.ok) {
        setTelegramValid(true)
        setTelegramBotName(data.result.username)
      } else {
        setTelegramValid(false)
        setError('Token inválido. Verifica con @BotFather.')
      }
    } catch {
      setTelegramValid(false)
      setError('Error al validar el token.')
    }
    setValidatingTelegram(false)
  }

  const canAdvance = () => {
    switch (step) {
      case 1:
        return botName.trim().length > 0
      case 2:
        return telegramValid === true
      case 3:
        if (plan === 'byok') return apiKey.trim().length > 0
        return true
      case 4:
        return true
      default:
        return false
    }
  }

  const handleDeploy = async () => {
    setDeploying(true)
    setError('')

    const modelType = plan === 'byok' ? 'byok' : plan === 'easy' ? 'credits' : 'ollama'
    const model =
      plan === 'byok'
        ? selectedModel
        : plan === 'easy'
          ? 'claude-3-5-haiku-20241022'
          : 'ollama/llama3.2'

    try {
      const res = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: botName,
          model_type: modelType,
          model,
          telegram_token: telegramToken.trim(),
          ...(plan === 'byok' && { api_key: apiKey.trim() }),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al crear la instancia')
        setDeploying(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Error de conexión')
      setDeploying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white">
            <Bot className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold">ClawdBot</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Step indicators */}
        <div className="flex items-center justify-center mb-12">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  step === s.id
                    ? 'bg-blue-600 text-white'
                    : step > s.id
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-gray-800 text-gray-500'
                }`}
              >
                {step > s.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium hidden sm:inline">{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-600 mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-800 rounded-xl p-8">
          {/* Step 1: Name */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Nombra tu asistente
              </h2>
              <p className="text-gray-400 mb-6">
                Dale un nombre a tu bot de Telegram.
              </p>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Mi Asistente"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Telegram */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Conecta Telegram
              </h2>
              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <h3 className="text-white font-medium mb-2">Instrucciones:</h3>
                <ol className="text-gray-300 text-sm space-y-2">
                  <li>1. Abre Telegram y busca <strong>@BotFather</strong></li>
                  <li>2. Envía <code className="bg-gray-600 px-1 rounded">/newbot</code> y sigue las instrucciones</li>
                  <li>3. Copia el token que te da BotFather</li>
                  <li>4. Pégalo aquí abajo</li>
                </ol>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={telegramToken}
                  onChange={(e) => {
                    setTelegramToken(e.target.value)
                    setTelegramValid(null)
                    setError('')
                  }}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={validateTelegram}
                  disabled={validatingTelegram || !telegramToken.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-3 rounded-lg text-white font-medium"
                >
                  {validatingTelegram ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Validar'
                  )}
                </button>
              </div>
              {telegramValid === true && (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Bot válido: @{telegramBotName}
                </p>
              )}
              {telegramValid === false && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Model */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Configura el modelo
              </h2>

              {plan === 'byok' && (
                <div>
                  <p className="text-gray-400 mb-6">
                    Usa tu propia API key para conectar el modelo de tu preferencia.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Modelo
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {BYOK_MODELS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label} ({m.provider})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Tu key se almacena encriptada y solo se usa en tu instancia.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {plan === 'easy' && (
                <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-6 text-center">
                  <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">Claude Haiku incluido ✓</h3>
                  <p className="text-gray-400 text-sm">
                    Tu plan incluye $15 USD en créditos mensuales. No necesitas configurar nada.
                  </p>
                </div>
              )}

              {plan === 'unlimited' && (
                <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-6 text-center">
                  <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">Ollama Llama 3.2 incluido ✓</h3>
                  <p className="text-gray-400 text-sm">
                    Modelo local instalado en tu servidor. Mensajes ilimitados, sin costos de API.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Deploy */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                Revisa y despliega
              </h2>
              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Nombre</span>
                  <span className="text-white font-medium">{botName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Telegram Bot</span>
                  <span className="text-white font-medium">@{telegramBotName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Modelo</span>
                  <span className="text-white font-medium">
                    {plan === 'byok'
                      ? BYOK_MODELS.find((m) => m.value === selectedModel)?.label
                      : plan === 'easy'
                        ? 'Claude 3.5 Haiku'
                        : 'Ollama Llama 3.2'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-white font-medium capitalize">{plan}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-4 rounded-lg text-white font-semibold text-lg flex items-center justify-center gap-2"
              >
                {deploying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Desplegando...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Desplegar
                  </>
                )}
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="flex items-center gap-1 text-gray-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" /> Atrás
              </button>
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg text-white font-medium flex items-center gap-1"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
