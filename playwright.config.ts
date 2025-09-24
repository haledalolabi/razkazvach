import { defineConfig } from "@playwright/test";

const shouldUseMockPrisma = !process.env.DATABASE_URL;
if (shouldUseMockPrisma && !process.env.USE_MOCK_PRISMA) {
  process.env.USE_MOCK_PRISMA = "1";
}

const webServerEnv = (() => {
  if (!shouldUseMockPrisma) return undefined;
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      env[key] = value;
    }
  }
  env.USE_MOCK_PRISMA = process.env.USE_MOCK_PRISMA ?? "1";
  return env;
})();

export default defineConfig({
  tsconfig: "./tsconfig.playwright.json",
  testDir: "tests/e2e",
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3000",
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    env: webServerEnv,
  },
  use: { baseURL: "http://localhost:3000" },
});
