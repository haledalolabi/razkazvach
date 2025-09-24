import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { handleStripeEvent } from "@/lib/payments/stripeWebhook";

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(secret, { apiVersion: "2025-08-27.basil" });
  }
  return stripeClient;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  const stripe = getStripeClient();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe] signature verification failed", error);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    const result = await handleStripeEvent({ prisma, stripe }, event);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[stripe] webhook handling failed", {
      id: event.id,
      type: event.type,
      error,
    });
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
