import { prisma } from "@/lib/prisma";

const PREMIUM_STATUSES = new Set(["active", "trialing", "past_due"]);

export function subscriptionGrantsPremium(status?: string | null): boolean {
  if (!status) return false;
  return PREMIUM_STATUSES.has(status);
}

export async function hasPremium(): Promise<boolean> {
  const { auth } = await import("@/auth");
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return false;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscriptions: true },
  });
  const subscription = user?.subscriptions?.[0];
  return subscriptionGrantsPremium(subscription?.status ?? null);
}

export async function isFreeStory(storyId: string): Promise<boolean> {
  const rotation = await prisma.freeRotation.findUnique({ where: { storyId } });
  return !!rotation;
}

export interface StoryAccessInput {
  isFree: boolean;
  hasPremium: boolean;
}

export function canAccessStory(input: StoryAccessInput): boolean {
  return input.isFree || input.hasPremium;
}
