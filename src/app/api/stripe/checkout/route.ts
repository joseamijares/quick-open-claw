import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, PlanKey } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { plan, currency = 'mxn' } = body as {
    plan: PlanKey
    currency?: 'mxn' | 'usd'
  }

  if (!['byok', 'unlimited'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  try {
    const session = await createCheckoutSession(
      user.id,
      user.email!,
      plan,
      currency
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
