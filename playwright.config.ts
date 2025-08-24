import { defineConfig } from "@playwright/test";
export default defineConfig({
  tsconfig: "./tsconfig.playwright.json",
  testDir: "tests/e2e",
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3000",
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: "http://localhost:3000" },
});
