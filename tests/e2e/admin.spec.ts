import { test, expect } from "@playwright/test";

test("admin requires auth", async ({ page }) => {
  const res = await page.goto("/admin");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveURL(/\/auth\/signin/);
});
