import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(secret, {
      apiVersion: "2025-08-27.basil",
    });
  }
  return stripeClient;
}

const PLAN_TO_PRICE: Record<string, string | undefined> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  semiannual: process.env.STRIPE_PRICE_SEMIANNUAL,
  annual: process.env.STRIPE_PRICE_ANNUAL,
};

function resolvePrice(plan: string): string | null {
  const id = PLAN_TO_PRICE[plan];
  if (!id) return null;
  return id;
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const plan = String((body as Record<string, unknown>)?.plan ?? "monthly");
  const price = resolvePrice(plan);
  if (!price) {
    return NextResponse.json({ error: "invalid plan" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const metadata = user?.id ? { userId: user.id } : undefined;

  const stripe = getStripeClient();

  let customer = await findExistingCustomer(stripe, email);
  if (!customer) {
    customer = await stripe.customers.create({ email, metadata });
  } else if (metadata && customer.metadata?.userId !== metadata.userId) {
    await stripe.customers.update(customer.id, { metadata });
  }

  const successUrl =
    process.env.STRIPE_SUCCESS_URL ?? "http://localhost:3000/pay/success";
  const cancelUrl =
    process.env.STRIPE_CANCEL_URL ?? "http://localhost:3000/pay/cancel";

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: { plan },
  });

  return NextResponse.json({ id: checkout.id, url: checkout.url });
}

async function findExistingCustomer(stripe: Stripe, email: string) {
  const list = await stripe.customers.list({ email, limit: 1 });
  return list.data[0] ?? null;
}
