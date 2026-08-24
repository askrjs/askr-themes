import { askr } from "@askrjs/vite";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [askr()],
  test: {
    api: {
      host: "127.0.0.1",
    },
    // Browser files share page-level state such as the viewport. Keep files
    // serial within each browser instance so responsive tests cannot race.
    fileParallelism: false,
    globals: true,
    browser: {
      api: {
        host: "127.0.0.1",
        port: 0,
      },
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
    },
    include: ["tests/browser/**/*.test.tsx"],
  },
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "@askrjs/askr",
    },
    jsxInject: "import { jsx, jsxs, Fragment } from '@askrjs/askr/jsx-runtime';",
  },
});
