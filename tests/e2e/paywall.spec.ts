import { test, expect } from "@playwright/test";

const slug = "paywall-e2e-story";

test.beforeAll(async ({ request }) => {
  const response = await request.post("/api/test-utils/stories", {
    data: {
      slug,
      title: "Paywall Story",
      description: "Story for paywall test",
      ageMin: 4,
      ageMax: 8,
      status: "PUBLISHED",
      tags: [],
      body: { html: "<p>Hidden story</p>", lang: "bg" },
      clearFreeRotation: true,
    },
  });

  expect(response.status()).toBe(200);
});

test("non-premium users are redirected to paywall", async ({ page }) => {
  const response = await page.goto(`/prikazki/${slug}`);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/paywall/);
});
