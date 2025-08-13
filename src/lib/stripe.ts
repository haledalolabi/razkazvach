import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export async function checkConfig() {
  await stripe.prices.list({ limit: 1 })
}

export default stripe
