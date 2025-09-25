import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(async () => null),
}));

const findFirstMock = vi.fn();
const findUniqueSubscriptionMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    freeRotation: { findFirst: findFirstMock },
    subscription: { findUnique: findUniqueSubscriptionMock },
    user: { findUnique: vi.fn() },
  },
}));

const {
  canReadFullStory,
  currentMonthKey,
  getFreeRotationForMonth,
  hasActiveSubscription,
  subscriptionGrantsPremium,
} = await import("@/lib/entitlements");

describe("subscriptionGrantsPremium", () => {
  it("returns false for missing status", () => {
    expect(subscriptionGrantsPremium(undefined)).toBe(false);
    expect(subscriptionGrantsPremium(null)).toBe(false);
  });

  it("returns true for active-like statuses", () => {
    expect(subscriptionGrantsPremium("active")).toBe(true);
    expect(subscriptionGrantsPremium("trialing")).toBe(true);
    expect(subscriptionGrantsPremium("past_due")).toBe(true);
  });

  it("returns false for canceled", () => {
    expect(subscriptionGrantsPremium("canceled")).toBe(false);
  });
});

describe("entitlements helpers", () => {
  beforeEach(() => {
    findFirstMock.mockReset();
    findUniqueSubscriptionMock.mockReset();
  });

  it("currentMonthKey uses UTC date", () => {
    const key = currentMonthKey(new Date(Date.UTC(2024, 5, 3)));
    expect(key).toBe("2024-06");
  });

  it("getFreeRotationForMonth queries prisma", async () => {
    findFirstMock.mockResolvedValueOnce({ id: "1" });
    const result = await getFreeRotationForMonth("story-1", "2024-06");
    expect(result).toEqual({ id: "1" });
    expect(findFirstMock).toHaveBeenCalledWith({
      where: { storyId: "story-1", monthKey: "2024-06" },
    });
  });

  it("canReadFullStory returns true when story is in free rotation", async () => {
    findFirstMock.mockResolvedValueOnce({ id: "rotation" });
    const result = await canReadFullStory({
      storyId: "s1",
      userId: null,
      monthKey: "2024-06",
    });
    expect(result).toBe(true);
    expect(findUniqueSubscriptionMock).not.toHaveBeenCalled();
  });

  it("canReadFullStory checks subscription when not free", async () => {
    findFirstMock.mockResolvedValueOnce(null);
    findUniqueSubscriptionMock.mockResolvedValueOnce({ status: "active" });
    const result = await canReadFullStory({
      storyId: "s1",
      userId: "user-1",
      monthKey: "2024-06",
    });
    expect(result).toBe(true);
    expect(findUniqueSubscriptionMock).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("canReadFullStory returns false without rotation or subscription", async () => {
    findFirstMock.mockResolvedValueOnce(null);
    findUniqueSubscriptionMock.mockResolvedValueOnce({ status: "canceled" });
    const result = await canReadFullStory({
      storyId: "s1",
      userId: "user-1",
      monthKey: "2024-06",
    });
    expect(result).toBe(false);
  });

  it("hasActiveSubscription uses subscription status", async () => {
    findUniqueSubscriptionMock.mockResolvedValueOnce({ status: "past_due" });
    await expect(hasActiveSubscription("user-99")).resolves.toBe(true);
    expect(findUniqueSubscriptionMock).toHaveBeenCalledWith({
      where: { userId: "user-99" },
    });
  });
});
