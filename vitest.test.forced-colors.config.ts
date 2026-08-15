import { askr } from "@askrjs/vite";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [askr()],
  test: {
    api: { host: "127.0.0.1" },
    globals: true,
    browser: {
      api: { host: "127.0.0.1", port: 0 },
      enabled: true,
      headless: true,
      provider: playwright({ contextOptions: { forcedColors: "active" } }),
      instances: [{ browser: "chromium" }],
    },
    include: ["tests/forced-colors/**/*.test.tsx"],
  },
  oxc: {
    jsx: { runtime: "automatic", importSource: "@askrjs/askr" },
    jsxInject: "import { jsx, jsxs, Fragment } from '@askrjs/askr/jsx-runtime';",
  },
});
