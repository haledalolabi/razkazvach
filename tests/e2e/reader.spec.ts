import { expect, test } from "@playwright/test";

const paidSlug = "e2e-paid-story";
const freeSlug = "e2e-free-story";

function currentMonthKey() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

test.beforeAll(async ({ request }) => {
  await request.post("/api/test-utils/stories", {
    data: {
      slug: paidSlug,
      title: "Платена приказка",
      description: "История само за абонати",
      ageMin: 4,
      ageMax: 7,
      status: "PUBLISHED",
      tags: ["платена"],
      body: {
        html: "<p>Начало на платената история.</p><p>Вторият абзац остава видим.</p><p>Третият абзац е скрит.</p>",
        lang: "bg",
      },
      audio: {
        url: "https://example.com/audio-paid.mp3",
      },
      clearFreeRotation: true,
    },
  });

  await request.post("/api/test-utils/stories", {
    data: {
      slug: freeSlug,
      title: "Свободна приказка",
      description: "История в свободната ротация",
      ageMin: 3,
      ageMax: 6,
      status: "PUBLISHED",
      tags: ["безплатна"],
      body: {
        html: "<p>Първи абзац.</p><p>Втори абзац.</p><p>Трети абзац, достъпен за всички.</p>",
        lang: "bg",
      },
      audio: {
        url: "https://example.com/audio-free.mp3",
      },
      clearFreeRotation: false,
      freeRotationMonthKey: currentMonthKey(),
    },
  });
});

test.describe("reader access", () => {
  test("non-entitled users see preview and paywall CTA", async ({ page }) => {
    await page.goto(`/prikazki/${paidSlug}`);
    await expect(page.getByText("Отключи цялата приказка")).toBeVisible();
    await expect(page.getByText("Третият абзац е скрит.")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Аудио заключено" }),
    ).toBeVisible();
  });

  test("free rotation story shows full body and audio", async ({ page }) => {
    await page.goto(`/prikazki/${freeSlug}`);
    await expect(
      page.getByText("Трети абзац, достъпен за всички."),
    ).toBeVisible();
    const audio = page.locator("audio");
    await expect(audio).toBeVisible();
    await expect(audio).toHaveAttribute(
      "src",
      "https://example.com/audio-free.mp3",
    );
  });
});
