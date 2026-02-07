'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Bot, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PLAN_INFO: Record<string, { name: string; price: string; features: string[] }> = {
  byok: {
    name: 'BYOK',
    price: '$349 MXN/mes',
    features: ['Tu API key', 'Deploy en 60 seg', '1 asistente', 'Telegram'],
  },
  easy: {
    name: 'Easy',
    price: '$699 MXN/mes',
    features: ['Claude Haiku incluido', '$15 USD créditos/mes', '1 asistente', 'Telegram'],
  },
  unlimited: {
    name: 'Unlimited',
    price: '$899 MXN/mes',
    features: ['Ollama Llama 3.2', 'Mensajes ilimitados', '1 asistente', 'Telegram'],
  },
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}

function CheckoutContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const plan = searchParams.get('plan') || 'byok'
  const info = PLAN_INFO[plan] || PLAN_INFO.byok

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/auth/login?next=/dashboard/checkout?plan=${plan}`)
      }
    }
    checkAuth()
  }, [supabase, router, plan])

  const handleCheckout = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, currency: 'mxn' }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Error al crear la sesión de pago')
        setLoading(false)
      }
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <Bot className="w-10 h-10 text-blue-400" />
            <span className="text-2xl font-bold">ClawdBot</span>
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-1">
            Plan {info.name}
          </h2>
          <p className="text-2xl font-bold text-blue-400 mb-6">{info.price}</p>

          <ul className="space-y-2 mb-8">
            {info.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-gray-300">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-4 rounded-lg text-white font-semibold text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirigiendo a Stripe...
              </>
            ) : (
              'Continuar al pago'
            )}
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            Serás redirigido a Stripe para completar el pago de forma segura.
          </p>
        </div>
      </div>
    </div>
  )
}
