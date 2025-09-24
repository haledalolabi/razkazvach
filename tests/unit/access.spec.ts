import { describe, expect, it } from "vitest";
import { canAccessStory, subscriptionGrantsPremium } from "../../lib/access";

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

describe("canAccessStory", () => {
  it("allows when story is free", () => {
    expect(canAccessStory({ isFree: true, hasPremium: false })).toBe(true);
  });

  it("allows when user has premium", () => {
    expect(canAccessStory({ isFree: false, hasPremium: true })).toBe(true);
  });

  it("denies when both false", () => {
    expect(canAccessStory({ isFree: false, hasPremium: false })).toBe(false);
  });
});
