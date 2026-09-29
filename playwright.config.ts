import { defineConfig, devices } from "@playwright/test";

import { HARNESS_HOST, resolveHarnessServer } from "./tests/browser/harness-server";

// Local runs take a free port so parallel checkouts never share a harness;
// CI keeps the fixed port. Reuse is opt-in with `PW_REUSE_SERVER=1`, and the
// global setup refuses a reused harness that serves another checkout. See
// `tests/browser/harness-server.ts`.
const { port: PORT, baseURL: BASE_URL, reuseExistingServer } = await resolveHarnessServer();
const HOST = HARNESS_HOST;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  globalSetup: "./tests/browser/global-setup.ts",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: "chromium",
      testIgnore: "**/forced-colors/**",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testIgnore: "**/forced-colors/**",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testIgnore: "**/forced-colors/**",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "forced-colors",
      testMatch: "**/forced-colors/*.spec.ts",
      use: { ...devices["Desktop Chrome"], forcedColors: "active" },
    },
  ],
  webServer: {
    // `vp dev` rather than `vite`: vite-plus aliases the `vite` package to
    // `@voidzero-dev/vite-plus-core`, which ships no CLI binary, and installing
    // a real `vite` alongside it makes every other `vp` command refuse to run.
    // `--strictPort` turns a port collision into an immediate failure instead
    // of a server on a port nobody is polling.
    command: `npx vp dev --config vite.harness.config.ts --host ${HOST} --port ${PORT} --strictPort`,
    url: `${BASE_URL}/tests/browser/harness.html`,
    reuseExistingServer,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
  },
});
