import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PREMIUM_STATUSES = new Set(["active", "trialing", "past_due"]);

export function subscriptionGrantsPremium(status?: string | null): boolean {
  if (!status) return false;
  return PREMIUM_STATUSES.has(status);
}

export function currentMonthKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

export async function getFreeRotationForMonth(
  storyId: string,
  monthKey: string,
) {
  return prisma.freeRotation.findFirst({ where: { storyId, monthKey } });
}

export async function hasActiveSubscription(userId: string | null | undefined) {
  if (!userId) return false;
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });
  return subscriptionGrantsPremium(subscription?.status ?? null);
}

export async function resolveCurrentUserId(): Promise<{
  id: string | null;
  role: string | null;
}> {
  const session = await auth();
  const email = session?.user?.email ?? null;
  if (!email) return { id: null, role: session?.user?.role ?? null };
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
  if (!user) {
    return { id: null, role: session?.user?.role ?? null };
  }
  return { id: user.id, role: user.role };
}

export async function canReadFullStory({
  userId,
  storyId,
  monthKey,
  isFreeThisMonth,
}: {
  userId?: string | null;
  storyId: string;
  monthKey?: string;
  isFreeThisMonth?: boolean;
}): Promise<boolean> {
  const computedMonthKey = monthKey ?? currentMonthKey();
  const freeRotation =
    typeof isFreeThisMonth === "boolean"
      ? isFreeThisMonth
      : (await getFreeRotationForMonth(storyId, computedMonthKey)) !== null;

  if (freeRotation) {
    return true;
  }

  const active = await hasActiveSubscription(userId ?? null);
  return active;
}
