import Stripe from "stripe";
import type { PrismaClient, Prisma } from "@prisma/client";

export interface StripeWebhookDeps {
  prisma: PrismaClient;
  stripe: Stripe;
}

export interface StripeWebhookResult {
  received: boolean;
  duplicate?: boolean;
}

export function priceToPlan(priceId?: string | null): string {
  if (!priceId) return "unknown";
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return "monthly";
  if (priceId === process.env.STRIPE_PRICE_SEMIANNUAL) return "semiannual";
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return "annual";
  return "unknown";
}

export async function handleStripeEvent(
  deps: StripeWebhookDeps,
  event: Stripe.Event,
): Promise<StripeWebhookResult> {
  const { prisma, stripe } = deps;

  const existing = await prisma.webhookReceipt.findUnique({
    where: { eventId: event.id },
  });
  if (existing) {
    return { received: true, duplicate: true };
  }

  await prisma.webhookReceipt.create({
    data: {
      eventId: event.id,
      type: event.type,
      payload: event as unknown as Prisma.InputJsonValue,
    },
  });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session.customer) break;
      const customer = (await stripe.customers.retrieve(
        session.customer as string,
      )) as Stripe.Customer;
      const email = customer.email;
      if (!email) break;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) break;
      const plan =
        typeof session.metadata?.plan === "string"
          ? session.metadata.plan
          : "unknown";
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          status: "active",
          plan,
          provider: "stripe",
        },
        create: {
          userId: user.id,
          status: "active",
          plan,
          provider: "stripe",
        },
      });
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      if (!subscription.customer) break;
      const customer = (await stripe.customers.retrieve(
        subscription.customer as string,
      )) as Stripe.Customer;
      const email = customer.email;
      if (!email) break;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) break;
      const rawPeriodEnd = (subscription as { current_period_end?: number })
        .current_period_end;
      const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000) : null;
      const plan = priceToPlan(subscription.items.data[0]?.price?.id);
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          status: subscription.status,
          plan,
          provider: "stripe",
          currentPeriodEnd: periodEnd,
        },
        create: {
          userId: user.id,
          status: subscription.status,
          plan,
          provider: "stripe",
          currentPeriodEnd: periodEnd,
        },
      });
      break;
    }
    default:
      break;
  }

  return { received: true };
}
