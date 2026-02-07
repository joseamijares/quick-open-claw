'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Cpu, MessageCircle, Server, Globe, Code } from 'lucide-react'

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
    cta: 'EMPEZAR',
    popular: false,
    color: 'gray' as const,
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
    cta: 'COMENZAR',
    popular: true,
    color: 'cyan' as const,
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
    cta: 'IR UNLIMITED',
    popular: false,
    color: 'orange' as const,
  },
]

const features = [
  {
    icon: Clock,
    title: '60 segundos',
    description: 'De clic a asistente funcionando. Sin SSH, sin Docker, sin config.',
    badgeColor: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Cpu,
    title: 'Ollama incluido',
    description: 'Usa Llama 3.2 sin pagar API. O trae tu propia key de Claude/GPT.',
    badgeColor: 'bg-blue-100 text-blue-600',
  },
  {
    icon: MessageCircle,
    title: 'Telegram nativo',
    description: 'Conecta tu bot en minutos. WhatsApp próximamente.',
    badgeColor: 'bg-teal-100 text-teal-600',
  },
  {
    icon: Server,
    title: 'Tu servidor',
    description: 'Contenedor aislado en VPS dedicado. Tus datos, tu control.',
    badgeColor: 'bg-orange-100 text-orange-500',
  },
  {
    icon: Globe,
    title: 'Precios LATAM',
    description: 'Desde $99 MXN/mes. Paga con tarjeta o transferencia.',
    badgeColor: 'bg-teal-100 text-teal-600',
  },
  {
    icon: Code,
    title: 'Open Source',
    description: 'Código abierto. Auto-hostea gratis o usa nuestro servicio.',
    badgeColor: 'bg-red-100 text-red-500',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="ClawdBot" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold text-[#1A2B4A]">ClawdBot</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-[#1A2B4A] text-[13px] font-semibold uppercase tracking-[1px] hover:opacity-70 transition-opacity"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/signup"
              className="bg-[#1E88E5] hover:bg-[#1976D2] text-white text-[13px] font-semibold uppercase tracking-[1px] px-6 py-2.5 rounded-lg transition-colors"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-gradient pt-16 pb-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm text-sm text-[#6B7B8D] px-4 py-1.5 rounded-full mb-8">
            <span>✨</span>
            <span>Nuevo: Soporte para Llama 3.2</span>
          </div>
          <h1 className="text-[48px] md:text-[52px] font-bold text-[#1A2B4A] leading-tight mb-6">
            Tu asistente de IA
            <br />
            <span className="text-[#1E88E5] italic wavy-underline">en 60 segundos</span>
          </h1>
          <p className="text-lg text-[#6B7B8D] mb-10 max-w-xl mx-auto leading-relaxed">
            Despliega un asistente inteligente en Telegram. Sin código, sin configuración, sin API keys (opcional).{' '}
            <span className="font-bold text-[#FF6B35]">Solo funciona.</span>
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/signup"
              className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold px-8 py-3 rounded-full text-base flex items-center gap-2 transition-colors"
            >
              🚀 Desplegar ahora
            </Link>
            <Link
              href="#pricing"
              className="bg-white hover:bg-gray-50 text-[#1A2B4A] font-semibold px-8 py-3 rounded-full text-base border border-[#E8ECF0] flex items-center gap-2 transition-colors"
            >
              📋 Ver precios
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[32px] font-bold text-[#1A2B4A] text-center mb-14">
            ¿Por qué ClawdBot?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white border border-[#E8ECF0] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-full ${feature.badgeColor} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A2B4A] mb-2">{feature.title}</h3>
                  <p className="text-[#6B7B8D] text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-[#FFF8ED]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-[32px] font-bold text-[#1A2B4A] text-center mb-3">
            Precios simples
          </h2>
          <p className="text-[#6B7B8D] text-center mb-14">
            Sin sorpresas. Cancela cuando quieras.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-8 relative ${
                  plan.popular ? 'border-[3px] border-[#00BCD4]' : 'border border-[#E8ECF0]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00BCD4] text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                    Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-[#1A2B4A] mb-3">{plan.name}</h3>
                <div className="mb-1">
                  <span
                    className={`text-4xl font-bold ${
                      plan.color === 'cyan'
                        ? 'text-[#00BCD4]'
                        : plan.color === 'orange'
                        ? 'text-[#FF6B35]'
                        : 'text-[#1A2B4A]'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[#6B7B8D] ml-1">{plan.period}</span>
                </div>
                <p className="text-sm text-[#6B7B8D] mb-3">{plan.priceUSD}</p>
                <p className="text-[#6B7B8D] text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-[#1A2B4A]">
                      <span className="text-[#4CAF50] font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block text-center py-3 rounded-full font-semibold uppercase text-sm tracking-wider transition-colors ${
                    plan.color === 'cyan'
                      ? 'bg-[#00BCD4] hover:bg-[#00ACC1] text-white'
                      : plan.color === 'orange'
                      ? 'bg-[#FF6B35] hover:bg-[#E55A2B] text-white'
                      : 'bg-[#4A5568] hover:bg-[#3D4858] text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8ECF0]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="ClawdBot" width={32} height={32} className="rounded-lg" />
            <span className="text-sm text-[#6B7B8D]">© 2026 ClawdBot Inc.</span>
          </div>
          <nav className="flex gap-8">
            <Link href="#" className="text-[#6B7B8D] text-xs font-semibold uppercase tracking-[1px] hover:text-[#1A2B4A] transition-colors">
              Términos
            </Link>
            <Link href="#" className="text-[#6B7B8D] text-xs font-semibold uppercase tracking-[1px] hover:text-[#1A2B4A] transition-colors">
              Privacidad
            </Link>
            <Link href="#" className="text-[#6B7B8D] text-xs font-semibold uppercase tracking-[1px] hover:text-[#1A2B4A] transition-colors">
              Contacto
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
