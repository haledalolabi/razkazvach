import {
  currentMonthKey,
  getFreeRotationForMonth,
  hasActiveSubscription,
  resolveCurrentUserId,
  subscriptionGrantsPremium,
} from "@/lib/entitlements";

export { subscriptionGrantsPremium };

export async function hasPremium(): Promise<boolean> {
  const { id } = await resolveCurrentUserId();
  return hasActiveSubscription(id);
}

export async function isFreeStory(storyId: string): Promise<boolean> {
  const monthKey = currentMonthKey();
  const rotation = await getFreeRotationForMonth(storyId, monthKey);
  return !!rotation;
}

export interface StoryAccessInput {
  isFree: boolean;
  hasPremium: boolean;
}

export function canAccessStory(input: StoryAccessInput): boolean {
  return input.isFree || input.hasPremium;
}
