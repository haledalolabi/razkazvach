import { test, expect } from "@playwright/test";

test("home renders", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Уютни български истории/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Разгледай каталога" }),
  ).toBeVisible();
});

test("health endpoint", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBe(true);
});

test("search endpoint", async ({ request }) => {
  const res = await request.get("/api/search?q=demo");
  expect(res.status()).toBe(200);
});
