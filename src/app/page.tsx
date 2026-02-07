'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Cpu, MessageCircle, Server, Globe, Code, Rocket, List, Check, Star } from 'lucide-react'

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
    borderColor: '#E2E8F0',
    priceColor: '#1D293D',
    ctaBg: '#314158',
    ctaBorder: '#1D293D',
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
    borderColor: '#0EA5E9',
    priceColor: '#0EA5E9',
    ctaBg: '#0EA5E9',
    ctaBorder: '#0369A1',
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
    borderColor: '#FB923C',
    priceColor: '#F97316',
    ctaBg: '#F97316',
    ctaBorder: '#C2410C',
  },
]

const features = [
  {
    icon: Clock,
    title: '60 segundos',
    description: 'De clic a asistente funcionando. Sin SSH, sin Docker, sin config.',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderColor: '#B9F8CF',
  },
  {
    icon: Cpu,
    title: 'Ollama incluido',
    description: 'Usa Llama 3.2 sin pagar API. O trae tu propia key de Claude/GPT.',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: '#C4B5FD',
  },
  {
    icon: MessageCircle,
    title: 'Telegram nativo',
    description: 'Conecta tu bot en minutos. WhatsApp próximamente.',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    borderColor: '#BAE6FD',
  },
  {
    icon: Server,
    title: 'Tu servidor',
    description: 'Contenedor aislado en VPS dedicado. Tus datos, tu control.',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    borderColor: '#E9D5FF',
  },
  {
    icon: Globe,
    title: 'Precios LATAM',
    description: 'Desde $99 MXN/mes. Paga con tarjeta o transferencia.',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    borderColor: '#FDE68A',
  },
  {
    icon: Code,
    title: 'Open Source',
    description: 'Código abierto. Auto-hostea gratis o usa nuestro servicio.',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    borderColor: '#FECDD3',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="w-full bg-white" style={{ height: 80 }}>
        <div className="max-w-6xl mx-auto px-6 h-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="ClawdBot" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold text-[#1D293D]">ClawdBot</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-[#62748E] text-[14px] font-[800] uppercase tracking-[0.2px] hover:opacity-70 transition-opacity"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/signup"
              className="bg-[#0369A1] hover:bg-[#025d8f] text-white text-[14px] font-[800] uppercase tracking-[0.2px] px-[18px] py-[8.5px] rounded-[12px] transition-colors"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-16 pb-32 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FFF5E6] text-[14px] text-[#92700A] px-4 py-1.5 rounded-full mb-8">
            <Star className="w-4 h-4 text-[#D4A017]" />
            <span className="font-medium">Nuevo: Soporte para Llama 3.2</span>
          </div>
          <h1 className="text-[60px] font-[800] text-[#1D293D] leading-[75px] tracking-[-1.236px] mb-6">
            Tu asistente de IA
            <br />
            <span className="text-[#0EA5E9] underline">en 60 segundos</span>
          </h1>
          <p className="text-[18px] text-[#45556C] font-medium mb-10 max-w-xl mx-auto leading-relaxed">
            Despliega un asistente inteligente en Telegram. Sin código, sin configuración, sin API keys (opcional).{' '}
            <span className="font-bold text-[#F97316]">Solo funciona.</span>
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/signup"
              className="bg-[#F97316] hover:bg-[#EA6C10] text-white font-[800] text-[18px] rounded-[16px] flex items-center gap-2 transition-colors"
              style={{
                padding: '17px 33px 23px 32px',
                borderBottom: '6px solid #C2410C',
                boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3)',
              }}
            >
              <Rocket className="w-5 h-5" />
              Desplegar ahora
            </Link>
            <Link
              href="#pricing"
              className="bg-white hover:bg-gray-50 text-[#314158] font-[800] text-[18px] rounded-[16px] flex items-center gap-2 transition-colors"
              style={{
                padding: '18px 35px 22px 34px',
                border: '2px solid #E2E8F0',
                borderBottom: '6px solid #E2E8F0',
              }}
            >
              <List className="w-5 h-5" />
              Ver precios
            </Link>
          </div>
        </div>
        {/* Crab mascot - bottom right of hero */}
        <div className="absolute bottom-0 right-8 md:right-16 lg:right-24 z-0">
          <Image
            src="/crab-mascot.svg"
            alt="ClawdBot Mascot"
            width={200}
            height={200}
            className="w-[140px] md:w-[180px] lg:w-[200px] h-auto"
          />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[32px] font-[800] text-[#1D293D] text-center mb-14">
            ¿Por qué ClawdBot?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-[24px] flex flex-col gap-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  style={{
                    padding: '34px 34px 38px 34px',
                    border: `2px solid ${feature.borderColor}`,
                    borderBottom: `6px solid ${feature.borderColor}`,
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-[20px] font-[800] text-[#1D293D]">{feature.title}</h3>
                  <p className="text-[16px] font-medium text-[#45556C] leading-[26px]">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-[#FFF8F0]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-[36px] font-[800] italic text-[#1D293D] text-center mb-3">
            Precios simples
          </h2>
          <p className="text-[#62748E] text-center mb-14">
            Sin sorpresas. Cancela cuando quieras.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="bg-white rounded-[24px] p-8 relative"
                style={{
                  border: `${plan.popular ? '3px' : '2px'} solid ${plan.borderColor}`,
                  borderBottom: `6px solid ${plan.borderColor}`,
                }}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0EA5E9] text-white text-[12px] font-[800] uppercase tracking-wider px-4 py-1 rounded-full">
                    Popular
                  </span>
                )}
                <h3 className="text-xl font-[800] text-[#1D293D] mb-3">{plan.name}</h3>
                <div className="mb-1">
                  <span
                    className="text-4xl font-[800]"
                    style={{ color: plan.priceColor }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[#62748E] ml-1">{plan.period}</span>
                </div>
                <p className="text-sm text-[#62748E] mb-3">{plan.priceUSD}</p>
                <p className="text-[#62748E] text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-[#1D293D]">
                      <Check className="w-4 h-4 text-[#0EA5E9] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className="block text-center font-[800] uppercase text-sm tracking-wider transition-colors text-white rounded-[16px]"
                  style={{
                    padding: '14px 0',
                    backgroundColor: plan.ctaBg,
                    borderBottom: `6px solid ${plan.ctaBorder}`,
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0]">
        {/* Crab mascot above footer */}
        <div className="flex justify-center -mt-12">
          <Image
            src="/crab-mascot.svg"
            alt="ClawdBot Mascot"
            width={100}
            height={100}
            className="w-[80px] h-auto"
          />
        </div>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="ClawdBot" width={32} height={32} className="rounded-lg" />
            <span className="text-sm text-[#62748E]">&copy; 2026 ClawdBot Inc.</span>
          </div>
          <nav className="flex gap-8">
            <Link href="#" className="text-[#62748E] text-xs font-[800] uppercase tracking-[1px] hover:text-[#1D293D] transition-colors">
              Términos
            </Link>
            <Link href="#" className="text-[#62748E] text-xs font-[800] uppercase tracking-[1px] hover:text-[#1D293D] transition-colors">
              Privacidad
            </Link>
            <Link href="#" className="text-[#62748E] text-xs font-[800] uppercase tracking-[1px] hover:text-[#1D293D] transition-colors">
              Contacto
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
