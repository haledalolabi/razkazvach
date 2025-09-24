import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slug = "paywall-e2e-story";

test.beforeAll(async () => {
  const story = await prisma.story.upsert({
    where: { slug },
    update: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      title: "Paywall Story",
      description: "Story for paywall test",
      ageMin: 4,
      ageMax: 8,
      tags: [],
      body: {
        upsert: {
          update: { html: "<p>Hidden story</p>", lang: "bg" },
          create: { html: "<p>Hidden story</p>", lang: "bg" },
        },
      },
    },
    create: {
      slug,
      title: "Paywall Story",
      description: "Story for paywall test",
      ageMin: 4,
      ageMax: 8,
      status: "PUBLISHED",
      publishedAt: new Date(),
      tags: [],
      body: { create: { html: "<p>Hidden story</p>", lang: "bg" } },
    },
    include: { body: true },
  });

  await prisma.freeRotation.deleteMany({ where: { storyId: story.id } });
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("non-premium users are redirected to paywall", async ({ page }) => {
  const response = await page.goto(`/prikazki/${slug}`);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/paywall/);
});
