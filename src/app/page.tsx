'use client'

import Link from 'next/link'
import Image from 'next/image'

const plans = [
  {
    name: 'BYOK',
    emoji: '🔑',
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
    emoji: '✨',
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
    cta: '¡Comenzar! 🚀',
    popular: true,
  },
  {
    name: 'Unlimited',
    emoji: '♾️',
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="QuickOpenClaw" width={44} height={44} className="rounded-2xl" />
          <span className="text-xl font-bold tracking-tight">QuickOpenClaw</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/auth/login" className="text-warm-gray hover:text-foreground font-medium px-4 py-2 rounded-xl transition-colors">
            Iniciar sesión
          </Link>
          <Link
            href="/auth/signup"
            className="bg-coral hover:bg-coral-dark text-white px-5 py-2.5 rounded-2xl font-semibold transition-colors"
          >
            Registrarse
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-16 pb-24 text-center">
        <div className="text-6xl mb-6">🤖</div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
          Tu asistente de IA
          <br />
          <span className="text-coral">en 60 segundos</span>
        </h1>
        <p className="text-xl text-warm-gray mb-10 max-w-2xl mx-auto leading-relaxed">
          Despliega un asistente inteligente en Telegram. Sin código, sin
          configuración, sin API keys (opcional). Solo funciona. ⚡
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/auth/signup"
            className="bg-coral hover:bg-coral-dark text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            🚀 Desplegar ahora
          </Link>
          <Link
            href="#pricing"
            className="border-2 border-foreground/10 hover:border-foreground/20 px-8 py-4 rounded-2xl text-lg font-semibold transition-colors"
          >
            Ver precios
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 tracking-tight">
          ¿Por qué QuickOpenClaw?
        </h2>
        <p className="text-warm-gray text-center mb-14 text-lg">Todo lo que necesitas, nada que no 🎯</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { emoji: '⚡', title: '60 segundos', desc: 'De clic a asistente funcionando. Sin SSH, sin Docker, sin config.' },
            { emoji: '🧠', title: 'Ollama incluido', desc: 'Usa Llama 3.2 sin pagar API. O trae tu propia key de Claude/GPT.' },
            { emoji: '💬', title: 'Telegram nativo', desc: 'Conecta tu bot en minutos. WhatsApp próximamente.' },
            { emoji: '🔒', title: 'Tu servidor', desc: 'Contenedor aislado en VPS dedicado. Tus datos, tu control.' },
            { emoji: '🇲🇽', title: 'Precios LATAM', desc: 'Desde $99 MXN/mes. Paga con tarjeta o transferencia.' },
            { emoji: '💚', title: 'Open Source', desc: 'Código abierto. Auto-hostea gratis o usa nuestro servicio.' },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white p-8 rounded-[20px] card-shadow card-transition"
            >
              <div className="text-4xl mb-4">{f.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-warm-gray leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 tracking-tight">
          Precios simples 💰
        </h2>
        <p className="text-warm-gray text-center mb-14 text-lg">
          Sin sorpresas. Cancela cuando quieras.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[20px] p-8 relative card-transition ${
                plan.popular
                  ? 'bg-coral text-white scale-105 card-shadow-hover'
                  : 'bg-white card-shadow'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow text-foreground text-sm font-bold px-4 py-1 rounded-full">
                  ⭐ Popular
                </span>
              )}
              <div className="text-3xl mb-3">{plan.emoji}</div>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className={plan.popular ? 'text-white/70' : 'text-warm-gray'}>{plan.period}</span>
                <p className={`text-sm mt-1 ${plan.popular ? 'text-white/60' : 'text-warm-gray'}`}>{plan.priceUSD}</p>
              </div>
              <p className={`mb-6 ${plan.popular ? 'text-white/80' : 'text-warm-gray'}`}>{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className={plan.popular ? 'text-yellow' : 'text-green'}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className={`block text-center py-3.5 rounded-2xl font-bold transition-all hover:scale-105 ${
                  plan.popular
                    ? 'bg-white text-coral hover:bg-white/90'
                    : 'bg-coral-light text-coral hover:bg-coral hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/5 py-10 mt-10">
        <div className="container mx-auto px-6 text-center text-warm-gray">
          <p className="text-lg">© 2026 QuickOpenClaw. Hecho con ❤️ en México 🇲🇽</p>
          <p className="mt-2 text-sm">
            Powered by{' '}
            <a
              href="https://openclaw.ai"
              className="text-coral hover:underline font-medium"
            >
              OpenClaw
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
