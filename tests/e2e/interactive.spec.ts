import { expect, test } from "@playwright/test";

const slug = "e2e-interactive-story";

function currentMonthKey() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

test.beforeAll(async ({ request }) => {
  await request.post("/api/test-utils/stories", {
    data: {
      slug,
      title: "Интерактивен тест",
      description: "История с избори",
      ageMin: 5,
      ageMax: 8,
      status: "PUBLISHED",
      tags: ["интерактивна"],
      clearFreeRotation: false,
      isInteractive: true,
      freeRotationMonthKey: currentMonthKey(),
      interactiveNodes: [
        {
          id: "node-start",
          title: "start",
          bodyHtml: "<p>Начало на приключението. Избери посока.</p>",
          choices: [
            { id: "choice-left", label: "Ляво", toNodeId: "node-left" },
            { id: "choice-right", label: "Дясно", toNodeId: "node-right" },
          ],
        },
        {
          id: "node-left",
          title: "left",
          bodyHtml: "<p>Ляв край с приятел.</p>",
          choices: [],
        },
        {
          id: "node-right",
          title: "right",
          bodyHtml: "<p>Десен край с урок.</p>",
          choices: [],
        },
      ],
    },
  });
});

test("choices update the node and restart resets", async ({ page }) => {
  await page.goto(`/prikazki/${slug}`);
  await expect(page.getByText(/Начало на приключението/)).toBeVisible();
  await page.getByRole("button", { name: "Ляво" }).click();
  await expect(page.getByText("Ляв край с приятел.")).toBeVisible();
  await page.getByRole("button", { name: "Започни отначало" }).click();
  await expect(page.getByText(/Начало на приключението/)).toBeVisible();
});
