import { expect, test } from "@playwright/test";

const youngerSlug = "e2e-catalog-young";
const olderInteractiveSlug = "e2e-catalog-interactive";

test.beforeAll(async ({ request }) => {
  await request.post("/api/test-utils/stories", {
    data: {
      slug: youngerSlug,
      title: "Малка история",
      description: "За най-малките читатели",
      ageMin: 3,
      ageMax: 5,
      status: "PUBLISHED",
      tags: ["класика"],
      body: {
        html: "<p>Кратка история.</p>",
        lang: "bg",
      },
      clearFreeRotation: true,
    },
  });

  await request.post("/api/test-utils/stories", {
    data: {
      slug: olderInteractiveSlug,
      title: "Голямо приключение",
      description: "Интерактивно пътешествие",
      ageMin: 6,
      ageMax: 8,
      status: "PUBLISHED",
      tags: ["интерактивна"],
      isInteractive: true,
      clearFreeRotation: true,
      interactiveNodes: [
        {
          id: "node-a",
          title: "start",
          bodyHtml: "<p>Начална точка.</p>",
          choices: [],
        },
      ],
    },
  });
});

test("catalog filters by age and interactive flag", async ({ page }) => {
  await page.goto("/catalog");
  await expect(page.getByText("Малка история")).toBeVisible();
  await expect(page.getByText("Голямо приключение")).toBeVisible();

  await page.getByRole("button", { name: "Възраст 3–5" }).click();
  await expect(page.getByText("Малка история")).toBeVisible();
  await expect(page.getByText("Голямо приключение")).toHaveCount(0);

  await page.getByRole("button", { name: "Възраст 3–5" }).click();
  await page.getByRole("button", { name: "Само интерактивни" }).click();
  await expect(page.getByText("Голямо приключение")).toBeVisible();
  await expect(page.getByText("Малка история")).toHaveCount(0);
});
