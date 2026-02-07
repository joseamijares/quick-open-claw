import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price_mxn: 9900, // $99 MXN
    price_usd: 500, // $5 USD
    features: [
      'Contenedor compartido',
      'OpenRouter (Haiku/GPT-4o-mini)',
      '1 asistente',
      'Telegram',
      'Docs y comunidad',
    ],
    instances: 1,
    channels: ['telegram'],
    model_type: 'openrouter',
    hosting: 'shared',
  },
  pro: {
    name: 'Pro',
    price_mxn: 24900, // $249 MXN
    price_usd: 1200, // $12 USD
    features: [
      'VPS dedicado',
      'Tu API key (BYOK)',
      '2 asistentes',
      'Telegram + WhatsApp',
      'Soporte por email',
      'SLA 99%',
    ],
    instances: 2,
    channels: ['telegram', 'whatsapp'],
    model_type: 'byok',
    hosting: 'dedicated',
  },
  business: {
    name: 'Business',
    price_mxn: 49900, // $499 MXN
    price_usd: 2500, // $25 USD
    features: [
      'VPS dedicado + Ollama',
      'BYOK + modelos locales',
      '5 asistentes',
      'Todos los canales',
      'Soporte prioritario',
      'SLA 99.9%',
    ],
    instances: 5,
    channels: ['telegram', 'whatsapp', 'discord'],
    model_type: 'byok_ollama',
    hosting: 'dedicated_ollama',
  },
} as const

export type PlanKey = keyof typeof PLANS

export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: PlanKey,
  currency: 'mxn' | 'usd' = 'mxn'
) {
  const planData = PLANS[plan]
  const amount = currency === 'mxn' ? planData.price_mxn : planData.price_usd

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `ClawdBot ${planData.name}`,
            description: planData.features.join(' • '),
          },
          unit_amount: amount,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
    metadata: {
      user_id: userId,
      plan,
    },
  })

  return session
}

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  return session
}
