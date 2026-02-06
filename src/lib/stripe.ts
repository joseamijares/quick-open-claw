import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price_mxn: 9900, // $99 MXN in centavos
    price_usd: 500, // $5 USD in cents
    features: ['Llama 3.2 (Ollama)', 'Sin costo de API', '1 asistente'],
    instances: 1,
    use_ollama: true,
  },
  pro: {
    name: 'Pro',
    price_mxn: 19900,
    price_usd: 1000,
    features: ['Claude Haiku / GPT-4o-mini', 'Tu API key', '2 asistentes'],
    instances: 2,
    use_ollama: false,
  },
  premium: {
    name: 'Premium',
    price_mxn: 39900,
    price_usd: 2000,
    features: ['Claude Sonnet / GPT-4o', 'Tu API key', '5 asistentes'],
    instances: 5,
    use_ollama: false,
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
