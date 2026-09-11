import { defineConfig, devices } from "@playwright/test";

const HOST = "127.0.0.1";
const PORT = 4318;
const BASE_URL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },
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
    // `--strictPort` turns a port collision into an immediate failure instead
    // of a server on a port nobody is polling.
    // `vp dev` rather than `vite`: vite-plus aliases the `vite` package to
    // `@voidzero-dev/vite-plus-core`, which ships no CLI binary, and installing
    // a real `vite` alongside it makes every other `vp` command refuse to run.
    // `--strictPort` turns a port collision into an immediate failure instead
    // of a server on a port nobody is polling.
    command: `npx vp dev --config vite.harness.config.ts --host ${HOST} --port ${PORT} --strictPort`,
    url: `${BASE_URL}/tests/browser/harness.html`,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
  },
});
