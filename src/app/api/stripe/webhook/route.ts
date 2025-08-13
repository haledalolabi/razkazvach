import Stripe from 'stripe'

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return new Response('webhook not configured yet')
  }
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()
  try {
    Stripe.webhooks.constructEvent(body, sig || '', secret)
  } catch {
    return new Response('invalid signature', { status: 400 })
  }
  return new Response('ok')
}
