import { defineConfig, devices } from "@playwright/test";
import { isolatedEnv } from "./e2e/isolated-env";

// Port 4613 follows the Web-Projects QA convention (test servers use 4600+),
// so E2E runs never collide with a dev server on 3000.
const PORT = 4613;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: BASE_URL,
    // Always start our own isolated server; never attach to an unknown one.
    reuseExistingServer: false,
    env: isolatedEnv(BASE_URL),
    timeout: 180_000,
  },
});
