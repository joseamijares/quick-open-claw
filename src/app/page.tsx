'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Zap, Shield, MessageCircle, Cpu, CreditCard, Bot } from 'lucide-react'

const plans = [
  {
    name: 'BYOK',
    price: '$349',
    priceUSD: '$19 USD',
    period: '/mes',
    description: 'Trae tu API key. Deploy en 60 seg.',
    features: [
      'Tu API key (Claude/Kimi/GPT)',
      'Deploy en 60 segundos',
      '1 asistente',
      'Telegram',
    ],
    cta: 'Empezar',
    popular: false,
  },
  {
    name: 'Easy',
    price: '$699',
    priceUSD: '$39 USD',
    period: '/mes',
    description: 'Sin API keys. Solo funciona.',
    features: [
      'Claude Haiku incluido',
      '$15 USD en créditos/mes',
      '1 asistente',
      'Sin configurar nada',
    ],
    cta: 'Comenzar',
    popular: true,
  },
  {
    name: 'Unlimited',
    price: '$899',
    priceUSD: '$49 USD',
    period: '/mes',
    description: 'Sin límites. Sin costos de API.',
    features: [
      'Ollama (Llama 3.2)',
      'Mensajes ilimitados',
      'Sin costos de API nunca',
      '1 asistente',
    ],
    cta: 'Ir Unlimited',
    popular: false,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="QuickOpenClaw" width={40} height={40} />
          <span className="text-xl font-bold">QuickOpenClaw</span>
        </div>
        <nav className="flex gap-4">
          <Link href="/auth/login" className="text-gray-300 hover:text-white">
            Iniciar sesión
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Registrarse
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Tu asistente de IA
          <br />
          <span className="text-blue-400">en 60 segundos</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Despliega un asistente inteligente en Telegram. Sin código, sin
          configuración, sin API keys (opcional). Solo funciona.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Desplegar ahora
          </Link>
          <Link
            href="#pricing"
            className="border border-gray-600 hover:border-gray-500 px-8 py-4 rounded-lg text-lg"
          >
            Ver precios
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          ¿Por qué QuickOpenClaw?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-xl">
            <Zap className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">60 segundos</h3>
            <p className="text-gray-400">
              De clic a asistente funcionando. Sin SSH, sin Docker, sin config.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <Cpu className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ollama incluido</h3>
            <p className="text-gray-400">
              Usa Llama 3.2 sin pagar API. O trae tu propia key de Claude/GPT.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <MessageCircle className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Telegram nativo</h3>
            <p className="text-gray-400">
              Conecta tu bot en minutos. WhatsApp próximamente.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <Shield className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tu servidor</h3>
            <p className="text-gray-400">
              Contenedor aislado en VPS dedicado. Tus datos, tu control.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <CreditCard className="w-12 h-12 text-pink-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Precios LATAM</h3>
            <p className="text-gray-400">
              Desde $99 MXN/mes. Paga con tarjeta o transferencia.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <Bot className="w-12 h-12 text-orange-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Open Source</h3>
            <p className="text-gray-400">
              Código abierto. Auto-hostea gratis o usa nuestro servicio.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Precios simples</h2>
        <p className="text-gray-400 text-center mb-12">
          Sin sorpresas. Cancela cuando quieras.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-gray-800 p-8 rounded-xl relative ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-sm px-3 py-1 rounded-full">
                  Popular
                </span>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
                <p className="text-sm text-gray-500">{plan.priceUSD}</p>
              </div>
              <p className="text-gray-400 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className={`block text-center py-3 rounded-lg font-semibold ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2026 QuickOpenClaw. Hecho con ❤️ en México.</p>
          <p className="mt-2 text-sm">
            Powered by{' '}
            <a
              href="https://openclaw.ai"
              className="text-blue-400 hover:underline"
            >
              OpenClaw
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
