import Stripe from "stripe";
import { describe, expect, it, vi, type Mock } from "vitest";
import {
  handleStripeEvent,
  priceToPlan,
} from "../../lib/payments/stripeWebhook";
import type { StripeWebhookDeps } from "../../lib/payments/stripeWebhook";

const baseDeps = () => {
  const prisma = {
    webhookReceipt: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(undefined),
    },
    user: {
      findUnique: vi
        .fn()
        .mockResolvedValue({ id: "user-1", email: "user@example.com" }),
    },
    subscription: {
      upsert: vi.fn().mockResolvedValue(undefined),
    },
  } as unknown as StripeWebhookDeps["prisma"];

  const stripe = {
    customers: {
      retrieve: vi
        .fn()
        .mockResolvedValue({ id: "cus_123", email: "user@example.com" }),
    },
  } as unknown as StripeWebhookDeps["stripe"];

  return { prisma, stripe } as StripeWebhookDeps;
};

describe("priceToPlan", () => {
  it("maps known price ids", () => {
    const monthly = "price_month";
    process.env.STRIPE_PRICE_MONTHLY = monthly;
    expect(priceToPlan(monthly)).toBe("monthly");
  });

  it("falls back to unknown", () => {
    expect(priceToPlan("other")).toBe("unknown");
  });
});

describe("handleStripeEvent", () => {
  it("skips duplicate events", async () => {
    const deps = baseDeps();
    (deps.prisma.webhookReceipt.findUnique as Mock).mockResolvedValue({
      id: "w1",
    } as unknown);
    const event = {
      id: "evt_1",
      type: "checkout.session.completed",
    } as Stripe.Event;
    const result = await handleStripeEvent(deps, event);
    expect(result.duplicate).toBe(true);
    expect(deps.prisma.webhookReceipt.create).not.toHaveBeenCalled();
  });

  it("records subscription updates", async () => {
    const deps = baseDeps();
    const event = {
      id: "evt_2",
      type: "customer.subscription.updated",
      data: {
        object: {
          status: "active",
          customer: "cus_123",
          current_period_end: 1,
          items: {
            data: [{ price: { id: process.env.STRIPE_PRICE_MONTHLY } }],
          },
        },
      },
    } as unknown as Stripe.Event;

    const result = await handleStripeEvent(deps, event);
    expect(result.received).toBe(true);
    expect(deps.prisma.webhookReceipt.create).toHaveBeenCalled();
    expect(deps.prisma.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } }),
    );
  });
});
