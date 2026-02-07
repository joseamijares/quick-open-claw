import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  return _stripe
}

export const PLANS = {
  byok: {
    name: 'BYOK',
    price_mxn: 34900, // $349 MXN
    price_usd: 1900, // $19 USD
    features: [
      'Tu API key (Claude/Kimi/GPT)',
      'Deploy en 60 segundos',
      '1 asistente',
      'Telegram',
      'Docs + comunidad Discord',
    ],
    instances: 1,
    channels: ['telegram'],
    model_type: 'byok',
    hosting: 'dedicated',
  },
  unlimited: {
    name: 'Unlimited',
    price_mxn: 69900, // $699 MXN
    price_usd: 3900, // $39 USD
    features: [
      'Ollama (Llama 3.2)',
      'Sin costos de API',
      'Mensajes ilimitados',
      '2 asistentes',
      'Telegram',
      'Soporte por email',
    ],
    instances: 2,
    channels: ['telegram'],
    model_type: 'ollama',
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
  const stripe = getStripe()
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
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  return session
}
