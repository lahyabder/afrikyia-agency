import { expect, test } from "@playwright/test";

// Isolation guard: with isolated-env.ts in place no request may reach a hosted Supabase project.
let remoteSupabaseRequests: string[] = [];
test.beforeEach(async ({ page }) => {
  remoteSupabaseRequests = [];
  page.on("request", (request) => {
    if (/\.supabase\.(co|in)$/.test(new URL(request.url()).hostname)) remoteSupabaseRequests.push(request.url());
  });
});
test.afterEach(() => {
  expect(remoteSupabaseRequests, "E2E must not reach hosted Supabase").toEqual([]);
});

// Read-only smoke check: loads the home page, submits nothing, writes no data.
test("home page responds without a server error", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBeLessThan(500);
  await expect(page.locator("body")).not.toBeEmpty();
});
