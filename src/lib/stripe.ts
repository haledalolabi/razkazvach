import Stripe from 'stripe'

let client: Stripe | null = null

export function getStripeClient() {
  if (client) return client
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return null
  client = new Stripe(secret)
  return client
}

export async function checkConfig() {
  const stripe = getStripeClient()
  if (!stripe) throw new Error('STRIPE_SECRET_KEY is not set')
  await stripe.prices.list({ limit: 1 })
}

export default getStripeClient
